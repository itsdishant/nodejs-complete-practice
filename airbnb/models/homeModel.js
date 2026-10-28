const mongoose = require("mongoose");
const { formatInr } = require("../utils/formatter");
const Booking = require("./bookingModel");

const homeSchema = new mongoose.Schema(
  {
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    url: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

homeSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Booking.deleteMany({
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
    formattedPrice: formatInr.format(home.price),
  }));
};

Home.getHomeById = async function (id) {
  const home = await Home.findById(id).populate("hostId");
  if (!home) return [];
  return [
    {
      _id: home._id.toString(),
      name: home.name,
      location: home.location,
      price: home.price,
      url: home.url,
      formattedPrice: formatInr.format(home.price),
      host: home.hostId
        ? {
            id: home.hostId._id.toString(),
            fullName: home.hostId.fullName || "Verified Host",
            email: home.hostId.email,
            createdAt: home.hostId.createdAt,
          }
        : null,
    },
  ];
};

module.exports = Home;
