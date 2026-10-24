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

// GET: Display login page
userRouter.get("/login", (req, res) => {
  userController(res, "login", "Login to Airbnb", req.path);
});

// POST: Handle login form submission
userRouter.get("/signup", (req, res) => {
  userController(res, "signup", "Signup to Airbnb", req.path);
});

// POST: Handle signup form submission
userRouter.post("/signup", async (req, res) => {
  const { fullName, email, password } = req.body;

  const emailExists = await User.exists({ email: email });

  if (emailExists) {
    return res.status(400).send("Email address already exists.");
  }

  if (!fullName || !email || !password) {
    return res.status(400).send("Please provide name, email, and password.");
  }

  const newUser = new User({
    fullName,
    email,
    password,
  });

  newUser
    .save()
    .then(() => {
      userController(
        res,
        "signup-success",
        "Airbnb | Signup Success",
        req.path,
        {
          fullName,
          email,
          password,
        },
      );
    })
    .catch((error) => {
      console.error(error);
    });
});

// GET: Display user's favourite / saved homes
userRouter.get("/wishlist", async (req, res) => {
  const wishlist = (await Home.getAllHomes()).filter(
    (home) => home.isFavourite,
  );

  userController(res, "wishlist", "Airbnb | Wishlist", req.path, {
    wishlist,
  });
});

// POST: Save or remove favourite / saved home
userRouter.post("/wishlist/:id", async (req, res) => {
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

  await Home.findByIdAndUpdate(id, {
    isFavourite: !home[0].isFavourite,
  });

  res.redirect("/wishlist");
});

module.exports = userRouter;
