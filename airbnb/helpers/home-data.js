const Home = require("../models/homeModel");
const Wishlist = require("../models/wishlistModel");

/**
 * Every home, newest first, with the signed-in traveller's wishlist state attached.
 * Shared by the home page and the listings page so both render the same hearts.
 */
async function homesFor(req) {
  const homes = await Home.getAllHomes();
  const session = req.session || {};
  const user = session.userDetails;

  if (!session.isLoggedIn || !user || !user.id) return homes;

  const saved = await Wishlist.find({ userId: user.id }).select("homeId");
  const savedIds = new Set(saved.map((item) => item.homeId.toString()));

  return homes.map((home) => ({
    ...home,
    isFavourite: savedIds.has(home._id),
  }));
}

module.exports = { homesFor };
