const express = require("express");
const homeController = require("../controllers/appController").homeController;
const reserveController =
  require("../controllers/appController").reserveController;
const Home = require("../models/homeModel");
const Booking = require("../models/bookingModel");
const { formatInr } = require("../utils/formatter");
const { ObjectId } = require("mongodb");
const { body, validationResult } = require("express-validator");
const { renderFormError } = require("../helpers/error-render");

const { CLEANING_FEE, SERVICE_FEE } = Booking;

const reserveRouter = express.Router();

// Redirect /reserve to /homes
reserveRouter.get("/reserve", (req, res) => {
  res.redirect("/homes");
});

reserveRouter.post("/reserve", (req, res) => {
  res.redirect("/homes");
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
      req.baseUrl + req.path,
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
    req.baseUrl + req.path,
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
reserveRouter.post(
  "/reserve/:id",
  [
    body("guestName").custom((value, { req }) => {
      const name = (value || req.body.fullName || "").trim();
      if (!name) {
        throw new Error("Full name is required.");
      }
      return true;
    }),
    body("guestEmail").custom((value, { req }) => {
      const email = (value || req.body.email || "").trim();
      if (!email) {
        throw new Error("Email address is required.");
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address.");
      }
      return true;
    }),
    body("guestPhone").custom((value, { req }) => {
      const phone = (value || req.body.phoneNumber || "").trim();
      if (!phone) {
        throw new Error("Phone number is required.");
      }
      const digits = phone.replace(/\D/g, "");
      if (digits.length !== 10) {
        throw new Error("Phone number must be 10 digits.");
      }
      return true;
    }),
  ],
  async (req, res) => {
    const { id } = req.params;
    const home = await Home.getHomeById(id);
    const { userDetails } = req.session;

    if (!home[0]) {
      return homeController(
        res.status(404),
        "404",
        "Airbnb | Page not found",
        req.baseUrl + req.path,
      );
    }

    const checkIn = req.body.checkIn || req.query.checkIn || "";
    const checkOut = req.body.checkOut || req.query.checkOut || "";
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

    const formattedHome = {
      ...home[0],
      formattedPrice: formatInr.format(home[0].price),
    };

    const reservationDetails = {
      checkIn,
      checkOut,
      guests,
      nights,
      nightsTotal: formatInr.format(nightsTotal),
      cleaningFee: formatInr.format(cleaningFee),
      serviceFee: formatInr.format(serviceFee),
      totalAmount: formatInr.format(totalAmount),
    };

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return renderFormError(
        res,
        "reserve",
        `Reserve ${home[0].name} | Airbnb`,
        "reserve",
        errors.array()[0].msg,
        req,
        {
          home: formattedHome,
          reservationDetails,
        },
      );
    }

    const guestName = (req.body.guestName || req.body.fullName || "").trim();
    const guestEmail = (req.body.guestEmail || req.body.email || "").trim();
    const guestPhone = (
      req.body.guestPhone ||
      req.body.phoneNumber ||
      ""
    ).trim();

    const newBooking = new Booking({
      fullName: guestName,
      email: guestEmail,
      phoneNumber: guestPhone,
      homeId: new ObjectId(home[0]._id),
      userId: new ObjectId(userDetails.id),
      checkIn,
      checkOut,
      numberOfGuests: guests,
      totalPrice: totalAmount,
      paymentMethod: req.body.paymentMethod || "upi",
    });

    const savedBooking = await newBooking.save();

    res.redirect(`/bookings/${savedBooking._id}`);
  },
);

// GET: Display user's bookings
reserveRouter.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.getBookingsByUserId(
      req.session.userDetails.id,
    );

    reserveController(
      res,
      "bookings",
      "Airbnb | Your bookings",
      req.baseUrl + req.path,
      {
        bookings,
      },
    );
  } catch (err) {
    reserveController(
      res,
      "bookings",
      "Airbnb | Your bookings",
      req.baseUrl + req.path,
      {
        bookings: [],
      },
    );
  }
});

// GET: Booking details page
reserveRouter.get("/bookings/:id", async (req, res) => {
  const { id } = req.params;
  let singleBooking;

  try {
    singleBooking = await Booking.getBookingById(id);
  } catch {
    singleBooking = null;
  }

  if (!singleBooking) {
    return homeController(
      res.status(404),
      "404",
      "Airbnb | Page not found",
      req.baseUrl + req.path,
    );
  }

  reserveController(
    res,
    "booking-details",
    `Booking Details | Airbnb`,
    req.baseUrl + req.path,
    {
      booking: singleBooking,
    },
  );
});

module.exports = reserveRouter;
