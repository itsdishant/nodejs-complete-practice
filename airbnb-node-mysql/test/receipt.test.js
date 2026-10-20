// ponytail: one runnable check for the receipt math, the shared page shell, and
// that no view repeats the document boilerplate.
// Run: node --test test/receipt.test.js
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const ejs = require("ejs");

const VIEWS = path.join(__dirname, "..", "views");
const ROOT = path.join(__dirname, "..");
const controllers = require("../controllers/appController");
const { forCode } = require("../utils/notification");

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.name !== "node_modules")
    .flatMap((e) => {
      const p = path.join(dir, e.name);
      return e.isDirectory() ? walk(p) : [p];
    });

const CLEANING_FEE = 1200;
const SERVICE_FEE = 850;

// Same rules as Reserve.getBookingById
const nights = (from, to) =>
  from && to
    ? Math.max(1, Math.round((new Date(to) - new Date(from)) / 86400000))
    : 1;
const nightlyRate = (total, n) =>
  Math.max(0, Math.round((total - CLEANING_FEE - SERVICE_FEE) / n));

const booking = {
  id: "abc123",
  homeName: "Test Villa",
  location: "Goa",
  photo: null,
  homeId: "7",
  checkIn: "2026-11-01",
  checkOut: "2026-11-04",
  nights: nights("2026-11-01", "2026-11-04"),
  fullName: "Guest",
  email: "g@example.com",
  phoneNumber: "999",
  numberOfGuests: 2,
  paymentMethod: "upi",
  paymentMethodLabel: "UPI",
  formattedNightlyRate: "₹2,000",
  formattedNightsTotal: "₹6,000",
  formattedCleaningFee: "₹1,200",
  formattedServiceFee: "₹850",
  formattedTotal: "₹8,050",
};

// Minimal express res double: renders through the real controller.
function render(handler, view, data) {
  return new Promise((resolve) => {
    const res = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      send(body) {
        resolve({ html: body, status: this.statusCode });
        return this;
      },
    };
    handler(res, view, "test title", "/test", data);
  });
}

test("nights edge cases", () => {
  assert.equal(nights("2026-11-01", "2026-11-04"), 3);
  assert.equal(nights("2026-11-01", "2026-11-02"), 1);
  assert.equal(nights("2026-11-01", "2026-11-01"), 1); // same day clamps to 1
  assert.equal(nights(null, null), 1); // missing dates fall back
});

test("receipt reconciles: nightly x nights + fees == stored total", () => {
  const total = 8050;
  const n = nights("2026-11-01", "2026-11-04");
  const rate = nightlyRate(total, n);
  assert.equal(rate, 2000);
  assert.equal(rate * n + CLEANING_FEE + SERVICE_FEE, total);
});

test("controller wraps the body in exactly one document shell", async () => {
  const { html } = await render(controllers.reserveController, "booking-details", {
    booking,
  });
  assert.equal((html.match(/<!doctype/gi) || []).length, 1);
  assert.equal((html.match(/<\/main>/g) || []).length, 1);
  assert.match(html, /Test Villa/); // the fragment was injected as `body`
  assert.match(html, /<title>test title<\/title>/);
});

const expectations = {
  "reserve/booking-details.ejs": {
    has: [/Test Villa/, /Booking ID: abc123/, /6,000/], // 6,000 = nights subtotal
    hasNot: [/Print receipt/, /View listing/],
  },
  "reserve/bookings.ejs": {
    has: [/Booking ID: abc123/],
    hasNot: [/Print receipt/],
  },
};

for (const [view, want] of Object.entries(expectations)) {
  test(`${view} renders`, async () => {
    const html = await ejs.renderFile(path.join(VIEWS, view), {
      title: "t",
      currentPath: "/bookings",
      booking,
      bookings: [booking],
    });
    assert.match(html, /border-coral\/30/); // booking id chip is the highlighted variant
    for (const re of want.has) assert.match(html, re);
    for (const re of want.hasNot) assert.doesNotMatch(html, re);
    assert.doesNotMatch(html, /undefined|NaN|itinerary/i);
  });
}

test("only partials/content.ejs owns the document boilerplate", () => {
  const layoutFiles = walk(VIEWS).filter((f) => {
    const src = fs.readFileSync(f, "utf8");
    return /<!doctype|<html|<body/i.test(src);
  });
  assert.deepEqual(
    layoutFiles.map((f) => path.relative(VIEWS, f)),
    ["partials/content.ejs"],
  );
});

test("notice codes are an allowlist, not passed through", () => {
  assert.deepEqual(forCode("booking-confirmed"), {
    type: "success",
    message: "Reservation confirmed.",
  });
  assert.equal(forCode("<script>alert(1)</script>"), null);
  assert.equal(forCode(undefined), null);
});

test("the shell escapes notice text so it can't close the script tag", async () => {
  const { html } = await render(controllers.homeController, "404", {
    notice: { type: "error", message: "</script><img src=x onerror=alert(1)>" },
  });
  assert.doesNotMatch(html, /<\/script><img/);
  assert.match(html, /\\u003c\/script>/);
});

test("no console.* left in app code (toasts replaced it)", () => {
  const offenders = walk(ROOT)
    .filter((f) => f.endsWith(".js") && !f.includes(`${path.sep}test${path.sep}`))
    .flatMap((f) =>
      fs
        .readFileSync(f, "utf8")
        .split("\n")
        .map((src) => ({ f: path.relative(ROOT, f), src }))
        .filter((l) => /console\.\w+\(/.test(l.src)),
    );
  // The one allowed console call is the server boot line, which no page can toast.
  assert.equal(offenders.length, 1);
  assert.equal(offenders[0].f, "app.js");
  assert.match(offenders[0].src, /Server is running/);
});
