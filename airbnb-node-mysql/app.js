const express = require("express");
const bodyParser = require("body-parser");
const userRouter = require("./routes/userRouter");
const hostRouter = require("./routes/hostRouter");
const path = require("path");
const homeController = require("./controllers/appController").homeController;
const reserveRouter = require("./routes/reserveRouter");
const { forCode, error } = require("./utils/notification");

const app = express();
const port = 3003;

app.use(express.static(path.join(__dirname, "public")));
// ponytail: served straight from the installed package so it can't drift from npm.
app.use(
  "/vendor/notyf",
  express.static(path.join(__dirname, "node_modules/notyf")),
);
app.use(bodyParser.urlencoded({ extended: false }));

// Redirecting POSTs stash their notice in ?notice=<code>; every render picks it up.
app.use((req, res, next) => {
  res.locals.notice = forCode(req.query.notice);
  next();
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(userRouter);
app.use("/host", hostRouter);
app.use(reserveRouter);

app.use((req, res) => {
  homeController(res.status(404), "404", "Airbnb | Page not found", req.path);
});

// Any thrown error (almost always a failed query) lands here as an error notice.
app.use((err, req, res, next) => {
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
      notice: error(message),
    },
  );
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
