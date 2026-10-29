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
const { body, validationResult } = require("express-validator");
const { routeGuard } = require("../middlewares/route-guard");

const userRouter = express.Router();

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
userRouter.post("/login", [
  body("email")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Email is not valid.")
    .custom(async (email) => {
      const emailExists = await User.findOne({ email: email });
      if (!emailExists) {
        throw new Error("User not found. Please check your email address.");
      }
    }),
  body("password")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Password is required.")
    .custom(async (password, { req }) => {
      const user = await User.findOne({
        password: password,
        email: req.body.email,
      });
      if (!user) {
        throw new Error("Incorrect password. Please try again.");
      }
    }),
  async (req, res) => {
    const { email, rememberMe } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return renderFormError(
        res,
        "login",
        "Login to Airbnb",
        "user",
        errors.array()[0].msg,
        req,
      );
    }

    const user = await User.findOne({ email });
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
  },
]);

// GET: Display signup page
userRouter.get("/signup", (req, res) => {
  userController(res, "signup", "Signup to Airbnb", req.baseUrl + req.path);
});

// POST: Handle signup form submission
userRouter.post("/signup", [
  body("fullName")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Full name is required.")
    .matches(/^[a-zA-Z ]+$/)
    .withMessage("Full name can only contain letters and spaces."),
  body("email")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Email is not valid.")
    .custom(async (email) => {
      const emailExists = await User.exists({ email: email });
      if (emailExists) {
        throw new Error(
          "Email address already exists. Please use another email address.",
        );
      }
    }),
  body("password")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),
  body("role")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Role is required.")
    .isIn(["host", "traveller"])
    .withMessage("Role must be host or traveller."),
  async (req, res) => {
    const { fullName, email, password, role } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return renderFormError(
        res,
        "signup",
        "Signup to Airbnb",
        "user",
        errors.array()[0].msg,
        req,
      );
    }

    const newUser = new User({
      fullName,
      email,
      password,
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
  },
]);

// GET: Display user's favourite / saved homes
userRouter.get("/wishlist", routeGuard("traveller"), async (req, res) => {
  const userDetails = req.session.userDetails;
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
userRouter.post("/wishlist/:id", routeGuard("traveller"), async (req, res) => {
  const { id } = req.params;
  const userDetails = req.session.userDetails;

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
