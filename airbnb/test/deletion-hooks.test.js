const { describe, it, before, after } = require("node:test");
const assert = require("node:assert");
const path = require("node:path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const User = require("../models/userModel");
const Home = require("../models/homeModel");
const Booking = require("../models/bookingModel");
const Wishlist = require("../models/wishlistModel");

describe("Cascade Deletion Hooks (findOneAndDelete)", () => {
  const createdUserIds = [];
  const createdHomeIds = [];
  const createdBookingIds = [];
  const createdWishlistIds = [];

  before(async () => {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is required to run database tests.");
    }
    await mongoose.connect(process.env.MONGODB_URI, { dbName: "airbnb-prod" });
  });

  after(async () => {
    // Safety cleanup of any created test IDs
    await Promise.all([
      User.deleteMany({ _id: { $in: createdUserIds } }),
      Home.deleteMany({ _id: { $in: createdHomeIds } }),
      Booking.deleteMany({ _id: { $in: createdBookingIds } }),
      Wishlist.deleteMany({ _id: { $in: createdWishlistIds } }),
    ]);
    await mongoose.disconnect();
  });

  // Helpers to register created IDs for tracking
  async function createTestUser(data) {
    const user = await User.create({
      fullName: data.fullName || "Test User",
      email: data.email || `test_${Date.now()}_${Math.random()}@example.com`,
      password: data.password || "password123",
      role: data.role || "traveller",
    });
    createdUserIds.push(user._id);
    return user;
  }

  async function createTestHome(hostId, data = {}) {
    const home = await Home.create({
      hostId,
      name: data.name || "Test Stay",
      location: data.location || "Goa, India",
      price: data.price || 4000,
      url: data.url || "https://example.com/test.jpg",
    });
    createdHomeIds.push(home._id);
    return home;
  }

  async function createTestBooking(homeId, userId, data = {}) {
    const booking = await Booking.create({
      homeId,
      userId,
      fullName: data.fullName || "Guest Name",
      email: data.email || "guest@example.com",
      phoneNumber: data.phoneNumber || "9876543210",
      checkIn: data.checkIn || new Date("2026-11-10"),
      checkOut: data.checkOut || new Date("2026-11-14"),
      totalPrice: data.totalPrice || 18050,
      paymentMethod: data.paymentMethod || "upi",
      numberOfGuests: data.numberOfGuests || 2,
    });
    createdBookingIds.push(booking._id);
    return booking;
  }

  async function createTestWishlist(homeId, userId) {
    const wishlist = await Wishlist.create({ homeId, userId });
    createdWishlistIds.push(wishlist._id);
    return wishlist;
  }

  it("should cascade delete bookings and wishlists when Home is deleted, leaving unrelated home records intact", async () => {
    const host = await createTestUser({ role: "host" });
    const traveller = await createTestUser({ role: "traveller" });

    // Target home and related records
    const targetHome = await createTestHome(host._id, { name: "Target Home" });
    const targetBooking = await createTestBooking(
      targetHome._id,
      traveller._id,
    );
    const targetWishlist = await createTestWishlist(
      targetHome._id,
      traveller._id,
    );

    // Unrelated home and related records
    const unrelatedHome = await createTestHome(host._id, {
      name: "Unrelated Home",
    });
    const unrelatedBooking = await createTestBooking(
      unrelatedHome._id,
      traveller._id,
    );
    const unrelatedWishlist = await createTestWishlist(
      unrelatedHome._id,
      traveller._id,
    );

    // Act: delete target home through findOneAndDelete
    const deletedHome = await Home.findOneAndDelete({ _id: targetHome._id });
    assert.ok(
      deletedHome,
      "Target home should be returned by findOneAndDelete",
    );

    // Assert: Target home, its booking, and its wishlist are removed
    const foundTargetHome = await Home.findById(targetHome._id);
    const foundTargetBooking = await Booking.findById(targetBooking._id);
    const foundTargetWishlist = await Wishlist.findById(targetWishlist._id);

    assert.strictEqual(foundTargetHome, null, "Target home should be deleted");
    assert.strictEqual(
      foundTargetBooking,
      null,
      "Target home's booking should be deleted",
    );
    assert.strictEqual(
      foundTargetWishlist,
      null,
      "Target home's wishlist should be deleted",
    );

    // Assert: Unrelated home, its booking, and its wishlist remain untouched
    const foundUnrelatedHome = await Home.findById(unrelatedHome._id);
    const foundUnrelatedBooking = await Booking.findById(unrelatedBooking._id);
    const foundUnrelatedWishlist = await Wishlist.findById(
      unrelatedWishlist._id,
    );

    assert.ok(foundUnrelatedHome, "Unrelated home must remain intact");
    assert.ok(
      foundUnrelatedBooking,
      "Unrelated home's booking must remain intact",
    );
    assert.ok(
      foundUnrelatedWishlist,
      "Unrelated home's wishlist must remain intact",
    );
  });

  it("should cascade delete bookings and wishlists when Traveller is deleted, leaving unrelated traveller records intact", async () => {
    const host = await createTestUser({ role: "host" });
    const sharedHome = await createTestHome(host._id, {
      name: "Shared Property",
    });

    // Target traveller and their records
    const targetTraveller = await createTestUser({ role: "traveller" });
    const targetBooking = await createTestBooking(
      sharedHome._id,
      targetTraveller._id,
    );
    const targetWishlist = await createTestWishlist(
      sharedHome._id,
      targetTraveller._id,
    );

    // Unrelated traveller and their records
    const unrelatedTraveller = await createTestUser({ role: "traveller" });
    const unrelatedBooking = await createTestBooking(
      sharedHome._id,
      unrelatedTraveller._id,
    );
    const unrelatedWishlist = await createTestWishlist(
      sharedHome._id,
      unrelatedTraveller._id,
    );

    // Act: delete target traveller through findOneAndDelete
    const deletedTraveller = await User.findOneAndDelete({
      _id: targetTraveller._id,
    });
    assert.ok(
      deletedTraveller,
      "Target traveller should be returned by findOneAndDelete",
    );

    // Assert: Target traveller, their booking, and their wishlist are removed
    const foundTargetUser = await User.findById(targetTraveller._id);
    const foundTargetBooking = await Booking.findById(targetBooking._id);
    const foundTargetWishlist = await Wishlist.findById(targetWishlist._id);

    assert.strictEqual(
      foundTargetUser,
      null,
      "Target traveller should be deleted",
    );
    assert.strictEqual(
      foundTargetBooking,
      null,
      "Target traveller's booking should be deleted",
    );
    assert.strictEqual(
      foundTargetWishlist,
      null,
      "Target traveller's wishlist should be deleted",
    );

    // Assert: Unrelated traveller, their booking, their wishlist, and the property remain untouched
    const foundUnrelatedUser = await User.findById(unrelatedTraveller._id);
    const foundUnrelatedBooking = await Booking.findById(unrelatedBooking._id);
    const foundUnrelatedWishlist = await Wishlist.findById(
      unrelatedWishlist._id,
    );
    const foundSharedHome = await Home.findById(sharedHome._id);

    assert.ok(foundUnrelatedUser, "Unrelated traveller must remain intact");
    assert.ok(
      foundUnrelatedBooking,
      "Unrelated traveller's booking must remain intact",
    );
    assert.ok(
      foundUnrelatedWishlist,
      "Unrelated traveller's wishlist must remain intact",
    );
    assert.ok(foundSharedHome, "Shared home must remain intact");
  });

  it("should cascade delete homes, bookings, and wishlists when Host is deleted, leaving unrelated host records intact", async () => {
    const traveller = await createTestUser({ role: "traveller" });

    // Target host and their home/bookings/wishlists
    const targetHost = await createTestUser({ role: "host" });
    const targetHome = await createTestHome(targetHost._id, {
      name: "Host A Stay",
    });
    const bookingOnTargetHome = await createTestBooking(
      targetHome._id,
      traveller._id,
    );
    const wishlistOnTargetHome = await createTestWishlist(
      targetHome._id,
      traveller._id,
    );

    // Unrelated host and their home/bookings/wishlists
    const unrelatedHost = await createTestUser({ role: "host" });
    const unrelatedHome = await createTestHome(unrelatedHost._id, {
      name: "Host B Stay",
    });
    const bookingOnUnrelatedHome = await createTestBooking(
      unrelatedHome._id,
      traveller._id,
    );
    const wishlistOnUnrelatedHome = await createTestWishlist(
      unrelatedHome._id,
      traveller._id,
    );

    // Act: delete target host through findOneAndDelete
    const deletedHost = await User.findOneAndDelete({ _id: targetHost._id });
    assert.ok(
      deletedHost,
      "Target host should be returned by findOneAndDelete",
    );

    // Assert: Target host, their home, and reservations/wishlists on that home are removed
    const foundTargetHost = await User.findById(targetHost._id);
    const foundTargetHome = await Home.findById(targetHome._id);
    const foundBookingOnTargetHome = await Booking.findById(
      bookingOnTargetHome._id,
    );
    const foundWishlistOnTargetHome = await Wishlist.findById(
      wishlistOnTargetHome._id,
    );

    assert.strictEqual(foundTargetHost, null, "Target host should be deleted");
    assert.strictEqual(
      foundTargetHome,
      null,
      "Target host's home should be deleted",
    );
    assert.strictEqual(
      foundBookingOnTargetHome,
      null,
      "Booking on target host's home should be deleted",
    );
    assert.strictEqual(
      foundWishlistOnTargetHome,
      null,
      "Wishlist on target host's home should be deleted",
    );

    // Assert: Unrelated host, their home, and reservations/wishlists on that home remain untouched
    const foundUnrelatedHost = await User.findById(unrelatedHost._id);
    const foundUnrelatedHome = await Home.findById(unrelatedHome._id);
    const foundBookingOnUnrelatedHome = await Booking.findById(
      bookingOnUnrelatedHome._id,
    );
    const foundWishlistOnUnrelatedHome = await Wishlist.findById(
      wishlistOnUnrelatedHome._id,
    );

    assert.ok(foundUnrelatedHost, "Unrelated host must remain intact");
    assert.ok(foundUnrelatedHome, "Unrelated host's home must remain intact");
    assert.ok(
      foundBookingOnUnrelatedHome,
      "Booking on unrelated host's home must remain intact",
    );
    assert.ok(
      foundWishlistOnUnrelatedHome,
      "Wishlist on unrelated host's home must remain intact",
    );
  });
});
