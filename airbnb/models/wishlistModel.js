const mongoose = require("mongoose");
const Home = require("./homeModel");
const { formatInr } = require("../utils/formatter");

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
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

Wishlist.getAllWishlists = async function (userId) {
  const wishlist = await Wishlist.find({ userId: userId });
  if (!wishlist) return [];

  const wishlistHomes = await Home.find({
    _id: { $in: wishlist.map((item) => item.homeId) },
  });

  if (!wishlistHomes) return [];

  const finalWishlist = wishlistHomes.map((home) => {
    return {
      _id: home._id.toString(),
      hostId: home.hostId,
      name: home.name,
      location: home.location,
      price: home.price,
      url: home.url,
      formattedPrice: formatInr.format(home.price),
      isFavourite: true,
    };
  });

  return finalWishlist;
};

module.exports = Wishlist;
