const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const dotenv = require("dotenv");
const { homeController } = require("./controllers/appController");
const User = require("./models/userModel");
const userRouter = require("./routes/userRouter");
const reserveRouter = require("./routes/reserveRouter");
const hostRouter = require("./routes/hostRouter");

dotenv.config();

const app = express();
const port = 3000;
const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  databaseName: "airbnb-prod",
  collection: "sessions",
});

store.on("error", (error) => {
  console.error("Session store error:", error);
});

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(
  session({
    secret: "airbnb-prod-app",
    resave: false,
    saveUninitialized: false,
    store: store,
  }),
);

app.use(async (req, res, next) => {
  res.locals.isLoggedIn = Boolean(req.session && req.session.isLoggedIn);
  if (req.session && req.session.userDetails) {
    if (!req.session.userDetails.fullName && req.session.userDetails.id) {
      try {
        const u = await User.findById(req.session.userDetails.id).select("fullName");
        if (u) {
          req.session.userDetails.fullName = u.fullName;
        }
      } catch (err) {
        console.error("Session user fetch error:", err);
      }
    }
    res.locals.userDetails = req.session.userDetails;
  } else {
    res.locals.userDetails = null;
  }
  res.locals.session = req.session;
  next();
});

app.use(userRouter);
app.use(reserveRouter);
app.use("/host", hostRouter);

app.use((req, res) => {
  homeController(res.status(404), "404", "Airbnb | Page not found", req.path);
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
