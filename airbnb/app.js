const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const { homeController } = require("./controllers/appController");
const userRouter = require("./routes/userRouter");
const reserveRouter = require("./routes/reserveRouter");
const hostRouter = require("./routes/hostRouter");

dotenv.config();

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Expose cookies and authentication state to all views
app.use((req, res, next) => {
  res.locals.isLoggedIn =
    req.cookies?.isLoggedIn === "true" || !!req.cookies?.isLoggedIn;
  res.locals.userDetails = req.cookies?.userDetails || null;
  res.locals.cookies = req.cookies || {};
  next();
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(userRouter);
app.use(reserveRouter);
app.use("/host", hostRouter);

app.use((req, res) => {
  homeController(res.status(404), "404", "Airbnb | Page not found", req.path);
});

// Login guard for all routes except login, signup pages
app.use((req, res, next) => {
  const isLoggedIn = req.cookies.isLoggedIn;
  if (!isLoggedIn && req.path !== "/login" && req.path !== "/signup") {
    return res.redirect("/login");
  }
  next();
});

// Any thrown error (almost always a failed query) is rendered as an error page.
app.use((err, req, res) => {
  // AggregateError (a refused connection) has no message of its own.
  const message =
    err.message || err.errors?.[0]?.message || err.code || "Please try again.";
  homeController(
    res.status(500),
    "error",
    "Airbnb | Something went wrong",
    req.path,
    {
      heading: "Something went wrong.",
      message,
    },
  );
});

mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: "airbnb-prod",
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });
