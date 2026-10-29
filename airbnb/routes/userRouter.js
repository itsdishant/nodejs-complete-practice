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
const { homesFor } = require("../helpers/home-data");

const userRouter = express.Router();

// A home counts as international when its location ends in a country other
// than India ("Ubud, Bali, Indonesia"). Indian listings read "Siolim, Goa".
const FOREIGN_COUNTRY =
  /,\s*(Indonesia|Thailand|Japan|Portugal|Greece|Italy|Spain|France|Sri Lanka|Nepal|Bhutan|Maldives|Malaysia|Singapore|Vietnam|UAE|United Arab Emirates)$/i;

userRouter.get("/", async (req, res) => {
  const homes = await homesFor(req);
  const internationalHomes = homes.filter((home) =>
    FOREIGN_COUNTRY.test(home.location),
  );
  const indianHomes = homes.filter(
    (home) => !FOREIGN_COUNTRY.test(home.location),
  );

  // Destinations are the city part of "City, Region" / "City, Region, Country",
  // ordered by how many homes each one has.
  const counts = new Map();
  for (const home of homes) {
    const city = home.location.split(",")[0].trim();
    counts.set(city, (counts.get(city) || 0) + 1);
  }
  const destinations = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([city]) => city);

  homeController(
    res,
    "home",
    "Airbnb | Vacation Rentals & Places to Stay",
    req.baseUrl + req.path,
    {
      indianHomes,
      internationalHomes,
      destinations,
      totalHomesCount: homes.length,
    },
  );
});

// GET: Display login page
userRouter.get("/login", (req, res) => {
  userController(res, "login", "Login to Airbnb", req.baseUrl + req.path);
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

  req.session.cookie.maxAge = maxAge;
  req.session.isLoggedIn = true;
  req.session.userDetails = {
    id: user._id.toString(),
    role: user.role,
    fullName: user.fullName,
    email: user.email,
  };

  res.redirect("/");
});

// GET: Display signup page
userRouter.get("/signup", (req, res) => {
  userController(res, "signup", "Signup to Airbnb", req.baseUrl + req.path);
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
    // Anything other than an explicit host choice is a traveller account.
    role: role === "host" ? "host" : "traveller",
  });

  newUser
    .save()
    .then(() => {
      userController(
        res,
        "signup-success",
        "Airbnb | Signup Success",
        req.baseUrl + req.path,
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
  const userDetails = req.session.userDetails;
  const isLoggedIn = req.session.isLoggedIn;

  if (!isLoggedIn || userDetails.role !== "traveller") {
    return res.redirect("/");
  }

  const wishlistHomes = await Wishlist.getAllWishlists(userDetails.id);

  userController(res, "wishlist", "Airbnb | Wishlist", req.baseUrl + req.path, {
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
      req.baseUrl + req.path,
    );
  }

  let isFavourite = false;
  const userDetails = req.session.userDetails;
  if (req.session.isLoggedIn && userDetails && userDetails.id) {
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

  userController(
    res,
    "home-detail",
    `${home[0].name} | Airbnb`,
    req.baseUrl + req.path,
    {
      home: formattedHome,
    },
  );
});

// POST: Save or remove favourite / saved home
userRouter.post("/wishlist/:id", async (req, res) => {
  const { id } = req.params;
  const userDetails = req.session.userDetails;
  const isLoggedIn = req.session.isLoggedIn;

  if (!isLoggedIn || !userDetails || userDetails.role !== "traveller") {
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
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
});

userRouter.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
});

// GET: Display catalog of all homes, optionally filtered by ?q=
userRouter.get("/homes", async (req, res) => {
  const query = String(req.query.q || "").trim();
  const homes = await homesFor(req);
  const needle = query.toLowerCase();
  const matches = needle
    ? homes.filter((home) =>
        `${home.name} ${home.location}`.toLowerCase().includes(needle),
      )
    : homes;

  userController(
    res,
    "homes-list",
    "Airbnb | Explore stays",
    req.baseUrl + req.path,
    {
      homes: matches,
      query,
    },
  );
});

module.exports = userRouter;
