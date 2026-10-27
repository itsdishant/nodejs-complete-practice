const express = require("express");
const {
  userController,
  homeController,
} = require("../controllers/appController");
const Home = require("../models/homeModel");
const { formatInr } = require("../utils/formatter");
const User = require("../models/userModel");
const { renderFormError } = require("../helpers/error-render");
const Wishlist = require("../models/wishlistModel");

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
userRouter.post("/login", async (req, res) => {
  const { email, password, rememberMe } = req.body;
  const user = await User.findOne({ email });

  if (!email || !password) {
    return renderFormError(
      res,
      "login",
      "Login to Airbnb",
      "user",
      "Please provide email and password.",
      req,
    );
  }

  if (!user) {
    return renderFormError(
      res,
      "login",
      "Login to Airbnb",
      "user",
      "User not found. Please check your email address.",
      req,
    );
  }

  if (user.password !== password) {
    return renderFormError(
      res,
      "login",
      "Login to Airbnb",
      "user",
      "Incorrect password. Please try again.",
      req,
    );
  }

  const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000;

  res.cookie("isLoggedIn", "true", {
    httpOnly: true,
    maxAge,
    sameSite: "strict",
  });
  res.cookie(
    "userDetails",
    { id: user._id, role: user.role },
    {
      httpOnly: true,
      maxAge,
      sameSite: "strict",
    },
  );

  res.redirect("/");
});

// GET: Display signup page
userRouter.get("/signup", (req, res) => {
  userController(res, "signup", "Signup to Airbnb", req.path);
});

// POST: Handle signup form submission
userRouter.post("/signup", async (req, res) => {
  const { fullName, email, password, role } = req.body;

  const emailExists = await User.exists({ email: email });

  if (emailExists) {
    return renderFormError(
      res,
      "signup",
      "Signup to Airbnb",
      "user",
      "Email address already exists. Please use another email address.",
      req,
    );
  }

  if (!fullName || !email || !password) {
    return renderFormError(
      res,
      "signup",
      "Signup to Airbnb",
      "user",
      "Please provide full name, email and password.",
      req,
    );
  }

  const newUser = new User({
    fullName,
    email,
    password,
    role,
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
        },
      );
    })
    .catch((error) => {
      return renderFormError(
        res,
        "signup",
        "Signup to Airbnb",
        "user",
        error.message,
        req,
      );
    });
});

// GET: Display user's favourite / saved homes
userRouter.get("/wishlist", async (req, res) => {
  const userDetails = req.cookies.userDetails;
  const isLoggedIn = req.cookies.isLoggedIn;

  if (!isLoggedIn || userDetails.role !== "guest") {
    return res.redirect("/");
  }

  const wishlistHomes = await Wishlist.getAllWishlists(userDetails.id);

  userController(res, "wishlist", "Airbnb | Wishlist", req.path, {
    wishlist: wishlistHomes,
  });
});

// GET: Display details for a specific home
userRouter.get("/home-detail/:id", async (req, res) => {
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

  let isFavourite = false;
  const userDetails = req.cookies.userDetails;
  if (req.cookies.isLoggedIn && userDetails && userDetails.id) {
    const existingWishlist = await Wishlist.findOne({
      homeId: id,
      userId: userDetails.id,
    });
    isFavourite = Boolean(existingWishlist);
  }

  const formattedHome = {
    ...home[0],
    formattedPrice: formatInr.format(home[0].price),
    isFavourite,
  };

  userController(res, "home-detail", `${home[0].name} | Airbnb`, req.path, {
    home: formattedHome,
  });
});

// POST: Save or remove favourite / saved home
userRouter.post("/wishlist/:id", async (req, res) => {
  const { id } = req.params;
  const userDetails = req.cookies.userDetails;
  const isLoggedIn = req.cookies.isLoggedIn;

  if (!isLoggedIn || !userDetails || userDetails.role !== "guest") {
    return res.redirect("/login");
  }

  const existingWishlist = await Wishlist.findOne({
    homeId: id,
    userId: userDetails.id,
  });

  const backUrl = req.get("Referrer") || "/wishlist";

  if (existingWishlist) {
    await Wishlist.deleteOne({ homeId: id, userId: userDetails.id });
    return res.redirect(backUrl);
  } else {
    const newWishlist = new Wishlist({
      homeId: id,
      userId: userDetails.id,
    });

    newWishlist
      .save()
      .then(() => {
        return res.redirect(backUrl);
      })
      .catch((error) => {
        return renderFormError(
          res,
          "wishlist",
          "Airbnb | Wishlist",
          "user",
          error.message,
          req,
        );
      });
  }
});

// GET & POST: Handle user logout
userRouter.get("/logout", (req, res) => {
  res.clearCookie("isLoggedIn");
  res.clearCookie("userDetails");
  res.redirect("/login");
});

userRouter.post("/logout", (req, res) => {
  res.clearCookie("isLoggedIn");
  res.clearCookie("userDetails");
  res.redirect("/login");
});

module.exports = userRouter;
