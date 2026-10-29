const mongoose = require("mongoose");
const Home = require("./homeModel");
const { formatInr } = require("../utils/formatter");

const wishlistSchema = new mongoose.Schema(
  {
    homeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Home",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

wishlistSchema.index({ userId: 1, homeId: 1 }, { unique: true });

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

Wishlist.getAllWishlists = async function (userId) {
  const wishlist = await Wishlist.find({ userId }).populate("homeId");
  if (!wishlist) return [];

  const seen = new Set();
  const uniqueWishlist = [];

  for (const item of wishlist) {
    if (!item.homeId) continue;
    const homeIdStr = item.homeId._id.toString();
    if (seen.has(homeIdStr)) continue;
    seen.add(homeIdStr);

    const home = item.homeId;
    uniqueWishlist.push({
      _id: homeIdStr,
      hostId: home.hostId,
      name: home.name,
      location: home.location,
      price: home.price,
      url: home.url,
      formattedPrice: formatInr.format(home.price),
      isFavourite: true,
    });
  }

  return uniqueWishlist;
};

module.exports = Wishlist;
