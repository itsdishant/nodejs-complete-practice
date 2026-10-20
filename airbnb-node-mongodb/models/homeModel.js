const { getDatabase } = require("../utils/database");
const { ObjectId } = require("mongodb");

module.exports = class Home {
  constructor(name, location, price, url, isFavourite = false) {
    this.name = name;
    this.location = location;
    this.price = price;
    this.url = url;
    this.isFavourite = isFavourite;
  }

  async save() {
    getDatabase().collection("homes").insertOne(this);
  }

  static async getAllHomes() {
    return getDatabase().collection("homes").find().toArray();
  }

  static async getAllFavouriteHomes() {
    return getDatabase()
      .collection("homes")
      .find({ isFavourite: true })
      .toArray();
  }

  static async toggleFavouriteHome(homeId, isFavourite) {
    return getDatabase()
      .collection("homes")
      .updateOne(
        { _id: new ObjectId(homeId) },
        { $set: { isFavourite: !isFavourite } },
        { upsert: true },
      );
  }

  static async getHomeById(id) {
    return getDatabase()
      .collection("homes")
      .find({
        _id: new ObjectId(id),
      })
      .toArray();
  }

  static async updateHome(id, updatedData) {
    return getDatabase()
      .collection("homes")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData },
        { upsert: true },
      );
  }

  static async deleteHome(id) {
    return getDatabase()
      .collection("homes")
      .deleteOne({ _id: new ObjectId(id) });
  }
};
