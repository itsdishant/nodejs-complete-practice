const express = require("express");
const hostController = require("../controllers/appController").hostController;
const homeController = require("../controllers/appController").homeController;
const sharedController =
  require("../controllers/appController").sharedController;
const Home = require("../models/homeModel");
const Booking = require("../models/bookingModel");
const { renderFormError } = require("../helpers/error-render");
const { formatInr } = require("../utils/formatter");
const { body, validationResult } = require("express-validator");
const { routeGuard } = require("../middlewares/route-guard");

const hostRouter = express.Router();

// Apply RBAC route guard: host-only access for all host routes
hostRouter.use(routeGuard("host"));

// GET: Render "Add Home" form
hostRouter.get("/add-home", (req, res) => {
  hostController(
    res,
    "add-home",
    "Airbnb | List your home",
    req.baseUrl + req.path,
  );
});

// POST: Validate and save a new home listing
hostRouter.post(
  "/add-home",
  [
    body("homeName").trim().notEmpty().withMessage("Home name is required"),
    body("location").trim().notEmpty().withMessage("Location is required"),
    body("price")
      .trim()
      .notEmpty()
      .withMessage("Price is required")
      .isFloat({ gt: 0 })
      .withMessage("Price must be a valid number greater than ₹0."),
    body("photo")
      .trim()
      .notEmpty()
      .withMessage("Photo URL is required")
      .isURL({ protocols: ["http", "https"], require_protocol: true })
      .withMessage("Photo URL must begin with http:// or https://."),
  ],
  (req, res) => {
    const { homeName, location, price, photo } = req.body;
    const userDetails = req.session.userDetails;
    const numericPrice = Number(price);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return renderFormError(
        res,
        "add-home",
        "Airbnb | List your home",
        "host",
        errors.array()[0].msg,
        req,
      );
    }

    const photoUrl = new URL(photo);

    const newHome = new Home({
      hostId: userDetails.id,
      name: homeName,
      location,
      price: numericPrice,
      url: photoUrl.toString(),
    });

    newHome
      .save()
      .then(() => {
        sharedController(
          res,
          "add-edit-home-success",
          "Airbnb | Listing published",
          req.baseUrl + req.path,
          {
            homeName,
            location,
            formattedPrice: formatInr.format(numericPrice),
            photo: photoUrl.toString(),
            isEdit: false,
          },
        );
      })
      .catch((error) => {
        return renderFormError(
          res,
          "add-home",
          "Airbnb | List your home",
          "host",
          error.message,
          req,
        );
      });
  },
);

// GET: Display edit home form
hostRouter.get("/edit-home/:id", async (req, res) => {
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

  hostController(
    res,
    "edit-home",
    `Edit ${home[0].name} | Airbnb`,
    req.baseUrl + req.path,
    {
      homeId: home[0]._id,
      formValues: home[0],
    },
  );
});

// POST: Validate and save an edited home listing
hostRouter.post(
  "/edit-home/:id",
  [
    body("name").trim().notEmpty().withMessage("Home name is required"),
    body("location").trim().notEmpty().withMessage("Location is required"),
    body("price")
      .trim()
      .notEmpty()
      .withMessage("Price is required")
      .isFloat({ gt: 0 })
      .withMessage("Price must be a valid number greater than ₹0."),
    body("photo")
      .trim()
      .notEmpty()
      .withMessage("Photo URL is required")
      .isURL({ protocols: ["http", "https"], require_protocol: true })
      .withMessage("Photo URL must begin with http:// or https://."),
  ],
  async (req, res) => {
    const { id } = req.params;
    const { name, location, price, photo } = req.body;
    const numericPrice = Number(price);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return renderFormError(
        res,
        "edit-home",
        "Airbnb | Edit your listing",
        "host",
        errors.array()[0].msg,
        req,
      );
    }

    const photoUrl = new URL(photo);

    await Home.findByIdAndUpdate(id, {
      name,
      location,
      price: numericPrice,
      url: photoUrl.toString(),
    });

    sharedController(
      res,
      "add-edit-home-success",
      "Airbnb | Listing updated",
      req.baseUrl + req.path,
      {
        homeName: name,
        location,
        formattedPrice: formatInr.format(numericPrice),
        photo: photoUrl.toString(),
        isEdit: true,
      },
    );
  },
);

// DELETE: Delete a home listing
hostRouter.post("/delete-home/:id", async (req, res) => {
  const { id } = req.params;
  const home = await Home.getHomeById(id);

  if (!home) {
    return homeController(
      res.status(404),
      "404",
      "Airbnb | Page not found",
      req.baseUrl + req.path,
    );
  }

  await Home.findByIdAndDelete(id);

  res.redirect("/host/homes");
});

// GET: Display the signed-in host's own listings
hostRouter.get("/homes", async (req, res) => {
  const userDetails = req.session.userDetails;
  const homes = await Home.getHomesByHost(userDetails.id);

  hostController(
    res,
    "host-home-list",
    "Airbnb | Your listings",
    req.baseUrl + req.path,
    { homes },
  );
});

// GET: Display all bookings for the signed-in host's properties
hostRouter.get("/bookings", async (req, res) => {
  const userDetails = req.session.userDetails;
  const bookings = await Booking.getBookingsByHostId(userDetails.id);
  const totalRevenue = bookings.reduce(
    (sum, b) => sum + (b.totalPrice || 0),
    0,
  );
  const totalNights = bookings.reduce((sum, b) => sum + (b.nights || 0), 0);

  hostController(
    res,
    "host-bookings",
    "Airbnb | Property reservations",
    req.baseUrl + req.path,
    {
      bookings,
      stats: {
        totalBookings: bookings.length,
        totalRevenue: formatInr.format(totalRevenue),
        totalNights,
      },
    },
  );
});

// GET: Display detail page for a specific host booking
hostRouter.get("/bookings/:id", async (req, res) => {
  const userDetails = req.session.userDetails;
  const { id } = req.params;
  const booking = await Booking.getBookingByIdForHost(id, userDetails.id);

  if (!booking) {
    return homeController(
      res.status(404),
      "404",
      "Airbnb | Page not found",
      req.baseUrl + req.path,
    );
  }

  hostController(
    res,
    "host-booking-detail",
    `Reservation #${booking.bookingId.slice(-6)} | Airbnb`,
    req.baseUrl + req.path,
    { booking },
  );
});

module.exports = hostRouter;
