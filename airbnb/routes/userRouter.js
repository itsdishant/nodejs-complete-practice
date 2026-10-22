const express = require("express");
const {
  userController,
  homeController,
} = require("../controllers/appController");
const Home = require("../models/homeModel");
const { formatInr } = require("../utils/formatter");

const userRouter = express.Router();

userRouter.get("/", async (req, res) => {
  const allHomes = await Home.getAllHomes();
  const featuredHomes = allHomes.slice(0, 4).map((home) => ({
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

userRouter.get("/login", (req, res) => {
  userController(res, "login", "Login to Airbnb", req.path);
});

userRouter.get("/signup", (req, res) => {
  userController(res, "signup", "Signup to Airbnb", req.path);
});

module.exports = userRouter;
