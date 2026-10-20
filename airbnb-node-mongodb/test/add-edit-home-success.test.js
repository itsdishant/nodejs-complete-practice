const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const ejs = require("ejs");

test("listing success page renders without splitting EJS expressions", async () => {
  const html = await ejs.renderFile(
    path.join(__dirname, "..", "views", "shared", "add-edit-home-success.ejs"),
    {
      isEdit: false,
      homeName: "Garden House",
      location: "Goa",
      formattedPrice: "₹2,400",
      photo: "https://example.com/garden.jpg",
    },
  );

  assert.match(html, /Listing published/);
  assert.match(html, /Garden House/);
  assert.match(html, /₹2,400 per night/);
});
