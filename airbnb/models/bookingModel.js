const mongoose = require("mongoose");
const { formatInr } = require("../utils/formatter");

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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

Booking.getBookingsByUserId = async (userId) => {
  try {
    const bookings = await Booking.find({ userId }).populate("homeId");
    return bookings.map((booking) => ({
      _id: booking._id.toString(),
      bookingId: booking._id.toString(),
      homeName: booking.homeId.name || "Stay",
      location: booking.homeId.location || "Location unavailable",
      photo: booking.homeId.url || "",
      checkIn: booking.checkIn
        ? new Date(booking.checkIn).toISOString().split("T")[0]
        : "",
      checkOut: booking.checkOut
        ? new Date(booking.checkOut).toISOString().split("T")[0]
        : "",
      numberOfGuests: booking.numberOfGuests || 1,
      totalPrice: booking.totalPrice,
      totalAmount: booking.totalPrice,
      formattedPrice: formatInr.format(booking.totalPrice || 0),
    }));
  } catch (error) {
    throw error;
  }
};

Booking.getBookingById = async (bookingId) => {
  try {
    const singleBooking = await Booking.findById(bookingId).populate("homeId");

    if (!singleBooking) {
      throw new Error("Booking not found");
    }

    const bookingObj = singleBooking.toObject
      ? singleBooking.toObject()
      : singleBooking;
    const nights =
      singleBooking.checkIn && singleBooking.checkOut
        ? Math.max(
            1,
            Math.round(
              (new Date(singleBooking.checkOut) -
                new Date(singleBooking.checkIn)) /
                86400000,
            ),
          )
        : 1;
    const paidNightly = Math.round(
      (singleBooking.totalPrice - CLEANING_FEE - SERVICE_FEE) / nights,
    );
    const nightlyRate =
      paidNightly > 0 ? paidNightly : singleBooking?.homeId?.price || 0;
    const paymentLabels = {
      upi: "UPI",
      card: "Card",
      arrival: "Pay at arrival",
    };
    const money = (n) => formatInr.format(n || 0);

    return {
      ...bookingObj,
      _id: singleBooking._id.toString(),
      bookingId: singleBooking._id.toString(),
      homeName: singleBooking?.homeId?.name || "Stay",
      location: singleBooking?.homeId?.location || "Location unavailable",
      photo: singleBooking?.homeId?.url || "",
      checkIn: singleBooking.checkIn
        ? new Date(singleBooking.checkIn).toISOString().split("T")[0]
        : "",
      checkOut: singleBooking.checkOut
        ? new Date(singleBooking.checkOut).toISOString().split("T")[0]
        : "",
      nights,
      numberOfGuests: singleBooking.numberOfGuests,
      totalAmount: singleBooking.totalPrice,
      formattedTotal: money(singleBooking.totalPrice),
      formattedNightlyRate: money(nightlyRate),
      formattedNightsTotal: money(nightlyRate * nights),
      formattedCleaningFee: money(CLEANING_FEE),
      formattedServiceFee: money(SERVICE_FEE),
      paymentMethod: singleBooking.paymentMethod,
      paymentMethodLabel:
        paymentLabels[singleBooking.paymentMethod] ||
        singleBooking.paymentMethod,
    };
  } catch (error) {
    throw error;
  }
};

module.exports = Booking;
