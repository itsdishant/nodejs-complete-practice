const mongoose = require("mongoose");
const { formatInr } = require("../utils/formatter");
const reserve = require("./reserveModel");

const homeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    url: { type: String, required: true },
    isFavourite: { type: Boolean, default: false },
  },
  { versionKey: false },
);

// Delete all associated bookings when a home is deleted
homeSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await reserve.deleteMany({
      $or: [{ homeId: doc._id }, { homeId: doc._id.toString() }],
    });
  }
});

const Home = mongoose.model("Home", homeSchema);

Home.getAllHomes = async function () {
  const homes = await Home.find().sort({ _id: -1 });
  return homes.map((home) => ({
    _id: home._id.toString(),
    name: home.name,
    location: home.location,
    price: home.price,
    url: home.url,
    isFavourite: home.isFavourite,
    formattedPrice: formatInr.format(home.price),
  }));
};

Home.getHomeById = async function (id) {
  const home = await Home.findById(id);
  return [
    {
      _id: home._id.toString(),
      name: home.name,
      location: home.location,
      price: home.price,
      url: home.url,
      isFavourite: home.isFavourite,
      formattedPrice: formatInr.format(home.price),
    },
  ];
};

module.exports = Home;
