const express = require("express");
const homeController = require("../controllers/appController").homeController;
const reserveController =
  require("../controllers/appController").reserveController;
const Home = require("../models/homeModel");
const Reserve = require("../models/reserveModel");
const { formatInr } = require("../utils/formatter");
const { error } = require("../utils/notification");

const { CLEANING_FEE, SERVICE_FEE } = Reserve;

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

  if (!home) {
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
  const nightsTotal = (home.price || 0) * nights;
  const totalAmount = nightsTotal + cleaningFee + serviceFee;

  const formattedHome = {
    ...home,
    formattedPrice: formatInr.format(home.price),
  };

  reserveController(res, "reserve", `Reserve ${home.name} | Airbnb`, req.path, {
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
  });
});

// POST: Confirm reservation and redirect to the booking it created
reserveRouter.post("/reserve/:id", async (req, res) => {
  const { id } = req.params;
  const home = await Home.getHomeById(id);

  if (!home) {
    return homeController(
      res.status(404),
      "404",
      "Airbnb | Page not found",
      req.path,
      { notice: error("That stay is no longer available.") },
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
  const nightsTotal = (home.price || 0) * nights;
  const totalAmount = nightsTotal + cleaningFee + serviceFee;

  const reservation = new Reserve(
    req.body.fullName || req.body.guestName,
    req.body.email || req.body.guestEmail,
    req.body.phoneNumber || req.body.guestPhone,
    id,
    checkIn,
    checkOut,
    totalAmount,
    req.body.paymentMethod || "upi",
    guests,
  );

  await reservation.makeReservation();

  res.redirect(`/bookings/${reservation.bookingId}?notice=booking-confirmed`);
});

// GET: Display user's bookings
reserveRouter.get("/bookings", async (req, res) => {
  const bookings = await Reserve.getAllBookings();
  reserveController(res, "bookings", "Airbnb | Your bookings", req.path, {
    bookings,
  });
});

// GET: Booking details page
reserveRouter.get("/bookings/:id", async (req, res) => {
  const { id } = req.params;
  const booking = await Reserve.getBookingById(id);

  if (!booking) {
    return homeController(
      res.status(404),
      "404",
      "Airbnb | Page not found",
      req.path,
    );
  }

  reserveController(
    res,
    "booking-details",
    `Booking Details | Airbnb`,
    req.path,
    {
      booking,
    },
  );
});

module.exports = reserveRouter;
