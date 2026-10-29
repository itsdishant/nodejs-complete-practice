const express = require("express");
const hostController = require("../controllers/appController").hostController;
const homeController = require("../controllers/appController").homeController;
const sharedController =
  require("../controllers/appController").sharedController;
const Home = require("../models/homeModel");
const { renderFormError } = require("../helpers/error-render");
const { formatInr } = require("../utils/formatter");

const hostRouter = express.Router();

// GET: Render "Add Home" form
hostRouter.get("/add-home", (req, res) => {
  const userDetails = req.session.userDetails;
  const isLoggedIn = req.session.isLoggedIn;

  if (!isLoggedIn || !userDetails || userDetails.role !== "host") {
    return res.redirect("/");
  }

  hostController(res, "add-home", "Airbnb | List your home", req.baseUrl + req.path);
});

// POST: Validate and save a new home listing
hostRouter.post("/add-home", (req, res) => {
  const { homeName, location, price, photo } = req.body;
  const userDetails = req.session.userDetails;
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return renderFormError(
      res,
      "add-home",
      "Airbnb | List your home",
      "host",
      "Enter a valid price greater than ₹0.",
      req,
    );
  }

  let photoUrl;

  try {
    photoUrl = new URL(photo);
  } catch {
    return renderFormError(
      res,
      "add-home",
      "Airbnb | List your home",
      "host",
      "Enter a valid photo URL.",
      req,
    );
  }

  if (!["http:", "https:"].includes(photoUrl.protocol) || !photoUrl.hostname) {
    return renderFormError(
      res,
      "add-home",
      "Airbnb | List your home",
      "host",
      "Photo URLs must begin with http:// or https://.",
      req,
    );
  }

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
});

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

  hostController(res, "edit-home", `Edit ${home[0].name} | Airbnb`, req.baseUrl + req.path, {
    homeId: home[0]._id,
    formValues: home[0],
  });
});

// POST: Validate and save an edited home listing
hostRouter.post("/edit-home/:id", async (req, res) => {
  const { id } = req.params;
  const { name, location, price, photo } = req.body;
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return renderFormError(
      res,
      "edit-home",
      "Airbnb | List your home",
      "host",
      "Enter a valid price greater than ₹0.",
      req,
    );
  }

  let photoUrl;

  try {
    photoUrl = new URL(photo);
  } catch {
    return renderFormError(
      res,
      "edit-home",
      "Airbnb | List your home",
      "host",
      "Enter a valid photo URL.",
      req,
    );
  }

  if (!["http:", "https:"].includes(photoUrl.protocol) || !photoUrl.hostname) {
    return renderFormError(
      res,
      "edit-home",
      "Airbnb | List your home",
      "host",
      "Photo URLs must begin with http:// or https://.",
      req,
    );
  }

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
});

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
  const isLoggedIn = req.session.isLoggedIn;

  if (!isLoggedIn || !userDetails || userDetails.role !== "host") {
    return res.redirect("/");
  }

  const homes = await Home.getHomesByHost(userDetails.id);

  hostController(
    res,
    "host-home-list",
    "Airbnb | Your listings",
    req.baseUrl + req.path,
    { homes },
  );
});

module.exports = hostRouter;
