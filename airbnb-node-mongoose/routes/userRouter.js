const express = require("express");
const homeController = require("../controllers/appController").homeController;
const Home = require("../models/homeModel");
const { formatInr } = require("../utils/formatter");
const userRouter = express.Router();

userRouter.get("/", async (req, res) => {
  const allHomes = await Home.getAllHomes();
  const featuredHomes = allHomes.slice(0, 3).map((home) => ({
    ...home,
    formattedPrice: formatInr.format(home.price),
  }));

  homeController(
    res,
    "home",
    "Airbnb | Vacation Rentals & Places to Stay",
    req.path,
    {
      featuredHomes,
      totalHomesCount: allHomes.length,
    },
  );
});

module.exports = userRouter;
