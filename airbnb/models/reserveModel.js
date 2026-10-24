const mongoose = require("mongoose");

const CLEANING_FEE = 1200;
const SERVICE_FEE = 850;

const bookingSchema = new mongoose.Schema(
  {
    homeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Home",
      required: true,
      index: true,
    },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    numberOfGuests: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

const Booking = mongoose.model("Booking", bookingSchema);

Booking.CLEANING_FEE = CLEANING_FEE;
Booking.SERVICE_FEE = SERVICE_FEE;

module.exports = Booking;
