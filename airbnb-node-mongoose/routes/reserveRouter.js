const express = require("express");
const homeController = require("../controllers/appController").homeController;
const reserveController =
  require("../controllers/appController").reserveController;
const Home = require("../models/homeModel");
const Booking = require("../models/reserveModel");
const { formatInr } = require("../utils/formatter");
const { ObjectId } = require("mongodb");

const { CLEANING_FEE, SERVICE_FEE } = Booking;

const reserveRouter = express.Router();

// GET: Display reservation start/selection page (when no home ID is provided)
reserveRouter.get("/reserve", async (req, res) => {
  const { homeId, checkIn, checkOut, guests } = req.query;
  if (homeId) {
    const query = new URLSearchParams();
    if (checkIn) query.set("checkIn", checkIn);
    if (checkOut) query.set("checkOut", checkOut);
    if (guests) query.set("guests", guests);
    const queryString = query.toString() ? `?${query.toString()}` : "";
    return res.redirect(`/reserve/${homeId}${queryString}`);
  }

  const homes = (await Home.getAllHomes()).map((home) => ({
    ...home,
    formattedPrice: formatInr.format(home.price),
  }));

  reserveController(res, "reserve", "Airbnb | Reserve a stay", req.path, {
    home: null,
    homes,
    reservationDetails: null,
  });
});

// POST: Forward reservation form if submitted from selection page
reserveRouter.post("/reserve", (req, res) => {
  const { homeId, checkIn, checkOut, guests } = req.body;
  if (homeId) {
    const query = new URLSearchParams();
    if (checkIn) query.set("checkIn", checkIn);
    if (checkOut) query.set("checkOut", checkOut);
    if (guests) query.set("guests", guests);
    const queryString = query.toString() ? `?${query.toString()}` : "";
    return res.redirect(`/reserve/${homeId}${queryString}`);
  }
  res.redirect("/reserve");
});

// GET: Display reservation checkout page for a specific home
reserveRouter.get("/reserve/:id", async (req, res) => {
  const { id } = req.params;
  const home = await Home.getHomeById(id);

  if (!home[0]) {
    return homeController(
      res.status(404),
      "404",
      "Airbnb | Page not found",
      req.path,
    );
  }

  const { checkIn, checkOut, guests } = req.query;

  // Calculate duration in nights (default 5 nights if unspecified or invalid)
  let nights = 5;
  if (checkIn && checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
      nights = diffDays;
    }
  }

  const cleaningFee = CLEANING_FEE;
  const serviceFee = SERVICE_FEE;
  const nightsTotal = (home[0].price || 0) * nights;
  const totalAmount = nightsTotal + cleaningFee + serviceFee;

  const formattedHome = {
    ...home[0],
    formattedPrice: formatInr.format(home[0].price),
  };

  reserveController(
    res,
    "reserve",
    `Reserve ${home[0].name} | Airbnb`,
    req.path,
    {
      home: formattedHome,
      reservationDetails: {
        checkIn: checkIn || "",
        checkOut: checkOut || "",
        guests: guests || "1",
        nights,
        nightsTotal: formatInr.format(nightsTotal),
        cleaningFee: formatInr.format(cleaningFee),
        serviceFee: formatInr.format(serviceFee),
        totalAmount: formatInr.format(totalAmount),
      },
    },
  );
});

// POST: Confirm reservation and redirect to the booking it created
reserveRouter.post("/reserve/:id", async (req, res) => {
  const { id } = req.params;
  const home = await Home.getHomeById(id);

  if (!home[0]) {
    return homeController(
      res.status(404),
      "404",
      "Airbnb | Page not found",
      req.path,
    );
  }

  const checkIn = req.body.checkIn || req.query.checkIn;
  const checkOut = req.body.checkOut || req.query.checkOut;
  const guests = req.body.guests || req.query.guests || "1";

  let nights = 5;
  if (checkIn && checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
      nights = diffDays;
    }
  }

  const cleaningFee = CLEANING_FEE;
  const serviceFee = SERVICE_FEE;
  const nightsTotal = (home[0].price || 0) * nights;
  const totalAmount = nightsTotal + cleaningFee + serviceFee;

  const newBooking = new Booking({
    fullName: req.body.fullName || req.body.guestName,
    email: req.body.email || req.body.guestEmail,
    phoneNumber: req.body.phoneNumber || req.body.guestPhone,
    homeId: new ObjectId(home[0]._id),
    checkIn,
    checkOut,
    numberOfGuests: guests,
    totalPrice: totalAmount,
    paymentMethod: req.body.paymentMethod || "upi",
  });

  const savedBooking = await newBooking.save();

  res.redirect(`/bookings/${savedBooking._id}`);
});

// GET: Display user's bookings
reserveRouter.get("/bookings", async (req, res) => {
  try {
    const rawBookings = await Booking.find().sort({ createdAt: -1 });
    const bookings = await Promise.all(
      rawBookings.map(async (booking) => {
        let home = null;
        try {
          home = await Home.findById(booking.homeId);
        } catch {
          home = null;
        }

        const bookingObj = booking.toObject ? booking.toObject() : booking;

        return {
          ...bookingObj,
          _id: booking._id.toString(),
          bookingId: booking._id.toString(),
          homeName: home ? home.name : "Stay",
          location: home ? home.location : "Location unavailable",
          photo: home ? home.url : "",
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
        };
      }),
    );

    reserveController(res, "bookings", "Airbnb | Your bookings", req.path, {
      bookings,
    });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    reserveController(res, "bookings", "Airbnb | Your bookings", req.path, {
      bookings: [],
    });
  }
});

// GET: Booking details page
reserveRouter.get("/bookings/:id", async (req, res) => {
  const { id } = req.params;

  let singleBooking;
  try {
    singleBooking = await Booking.findById(id);
  } catch {
    singleBooking = null;
  }

  if (!singleBooking) {
    return homeController(
      res.status(404),
      "404",
      "Airbnb | Page not found",
      req.path,
    );
  }

  let home = null;
  try {
    home = await Home.findById(singleBooking.homeId);
  } catch {
    home = null;
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
  const nightlyRate = paidNightly > 0 ? paidNightly : home?.price || 0;
  const paymentLabels = {
    upi: "UPI",
    card: "Card",
    arrival: "Pay at arrival",
  };
  const money = (n) => formatInr.format(n || 0);

  const formattedBooking = {
    ...bookingObj,
    _id: singleBooking._id.toString(),
    bookingId: singleBooking._id.toString(),
    homeName: home ? home.name : "Stay",
    location: home ? home.location : "Location unavailable",
    photo: home ? home.url : "",
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
      paymentLabels[singleBooking.paymentMethod] || singleBooking.paymentMethod,
  };

  reserveController(
    res,
    "booking-details",
    `Booking Details | Airbnb`,
    req.path,
    {
      booking: formattedBooking,
    },
  );
});

module.exports = reserveRouter;
