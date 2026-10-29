const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["traveller", "host"],
      default: "traveller",
    },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

userSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    const Home = mongoose.model("Home");
    const Booking = mongoose.model("Booking");
    const Wishlist = mongoose.model("Wishlist");

    const hostHomes = await Home.find({ hostId: doc._id }).select("_id");
    const homeIds = hostHomes.map((h) => h._id);

    await Promise.all([
      Home.deleteMany({ hostId: doc._id }),
      Booking.deleteMany({
        $or: [
          { userId: doc._id },
          { userId: doc._id.toString() },
          { homeId: { $in: homeIds } },
        ],
      }),
      Wishlist.deleteMany({
        $or: [
          { userId: doc._id },
          { userId: doc._id.toString() },
          { homeId: { $in: homeIds } },
        ],
      }),
    ]);
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
