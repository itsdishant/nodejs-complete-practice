const express = require("express");
const path = require("path");
const contactRouter = express.Router();

contactRouter.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/home.html"));
});

contactRouter.get("/contact-us", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/new-contact.html"));
});

contactRouter.post("/contact-us", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/success-contact.html"));
});

module.exports = contactRouter;
