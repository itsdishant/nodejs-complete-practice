const express = require("express");
const hostController = require("../controllers/appController").hostController;
const homeController = require("../controllers/appController").homeController;
const sharedController =
  require("../controllers/appController").sharedController;
const Home = require("../models/homeModel");
const renderAddHomeError = require("../helpers/error-render");
const { formatInr } = require("../utils/formatter");
const { forCode, error } = require("../utils/notification");

const hostRouter = express.Router();

// GET: Render "Add Home" form
hostRouter.get("/add-home", (req, res) => {
  hostController(res, "add-home", "Airbnb | List your home", req.path);
});

// POST: Validate and save a new home listing
hostRouter.post("/add-home", async (req, res) => {
  const { homeName, location, price, photo } = req.body;
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return renderAddHomeError(
      res,
      req.body,
      "Enter a valid price greater than ₹0.",
    );
  }

  let photoUrl;

  try {
    photoUrl = new URL(photo);
  } catch {
    return renderAddHomeError(res, req.body, "Enter a valid photo URL.");
  }

  if (!["http:", "https:"].includes(photoUrl.protocol) || !photoUrl.hostname) {
    return renderAddHomeError(
      res,
      req.body,
      "Photo URLs must begin with http:// or https://.",
    );
  }

  await new Home(homeName, location, numericPrice, photoUrl.toString()).save();

  sharedController(
    res,
    "add-edit-home-success",
    "Airbnb | Listing published",
    req.path,
    {
      homeName,
      location,
      formattedPrice: formatInr.format(numericPrice),
      photo: photoUrl.toString(),
      isEdit: false,
      notice: forCode("listing-published"),
    },
  );
});

// GET: Display edit home form
hostRouter.get("/edit-home/:id", async (req, res) => {
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

  hostController(res, "edit-home", `Edit ${home.name} | Airbnb`, req.path, {
    homeId: home.homeId,
    formValues: home,
  });
});

// POST: Validate and save an edited home listing
hostRouter.post("/edit-home/:id", async (req, res) => {
  const { id } = req.params;
  const { homeName, location, price, photo } = req.body;
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return renderAddHomeError(
      res,
      req.body,
      "Enter a valid price greater than ₹0.",
    );
  }

  let photoUrl;

  try {
    photoUrl = new URL(photo);
  } catch {
    return renderAddHomeError(res, req.body, "Enter a valid photo URL.");
  }

  if (!["http:", "https:"].includes(photoUrl.protocol) || !photoUrl.hostname) {
    return renderAddHomeError(
      res,
      req.body,
      "Photo URLs must begin with http:// or https://.",
    );
  }

  await Home.updateHome(id, {
    homeName,
    location,
    price: numericPrice,
    photo: photoUrl.toString(),
  });

  sharedController(
    res,
    "add-edit-home-success",
    "Airbnb | Listing updated",
    req.path,
    {
      homeName,
      location,
      formattedPrice: formatInr.format(numericPrice),
      photo: photoUrl.toString(),
      isEdit: true,
      notice: forCode("listing-updated"),
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
      req.path,
      { notice: error("That listing no longer exists.") },
    );
  }

  await Home.deleteHome(id);

  res.redirect("/host/host-homes-list?notice=listing-deleted");
});

// GET: Display host homes list table
hostRouter.get("/host-homes-list", async (req, res) => {
  const homes = (await Home.getAllHomes()).map((home) => ({
    ...home,
    formattedPrice: formatInr.format(home.price),
  }));

  hostController(res, "host-home-list", "Airbnb | Your listings", req.path, {
    homes,
  });
});

// GET: Display catalog of all homes
hostRouter.get("/homes-list", async (req, res) => {
  const homes = (await Home.getAllHomes()).map((home) => ({
    ...home,
    formattedPrice: formatInr.format(home.price),
  }));

  hostController(res, "homes-list", "Airbnb | Explore stays", req.path, {
    homes,
  });
});

// GET: Display details for a specific home
hostRouter.get("/home-detail/:id", async (req, res) => {
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

  const formattedHome = {
    ...home,
    formattedPrice: formatInr.format(home.price),
  };

  hostController(res, "home-detail", `${home.name} | Airbnb`, req.path, {
    home: formattedHome,
  });
});

// GET: Display user's favourite / saved homes
hostRouter.get("/favourites", async (req, res) => {
  const favouriteList = (await Home.getAllFavouriteHomes()).map((home) => {
    return {
      ...home,
      formattedPrice: formatInr.format(home.price),
    };
  });

  hostController(res, "favourites", "Airbnb | Saved homes", req.path, {
    favouriteList,
  });
});

// POST: Save or remove favourite / saved home
hostRouter.post("/favourites/:id", async (req, res) => {
  const { id } = req.params;
  const home = await Home.getHomeById(id);

  if (!home) {
    return homeController(
      res.status(404),
      "404",
      "Airbnb | Page not found",
      req.path,
      { notice: error("That listing no longer exists.") },
    );
  }

  await Home.toggleFavouriteHome(id);

  const notice = home.isFavourite ? "favourite-removed" : "favourite-saved";
  res.redirect(`/host/favourites?notice=${notice}`);
});

module.exports = hostRouter;
