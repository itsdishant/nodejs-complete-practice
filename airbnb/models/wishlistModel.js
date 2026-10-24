const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    homeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Home",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { versionKey: false },
);

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

module.exports = Wishlist;
