const db = require("../utils/database");

// which renders an error notice instead of silently reporting success.
module.exports = class Home {
  constructor(homeName, location, price, photo, isFavourite = false) {
    this.homeId = Math.random().toString(36).substring(2, 15);
    this.homeName = homeName;
    this.location = location;
    this.price = price;
    this.photo = photo;
    this.isFavourite = isFavourite;
  }

  async save() {
    const [rows] = await db.execute(
      "INSERT INTO homes (id, name, location, price, url) VALUES (?, ?, ?, ?, ?)",
      [this.homeId, this.homeName, this.location, this.price, this.photo],
    );
    if (rows.affectedRows > 0) {
      await db.execute(
        "INSERT INTO favourites (homeId, isFavourite) VALUES (?, ?)",
        [this.homeId, this.isFavourite],
      );
      return rows;
    }
  }

  static async getAllHomes() {
    const [rows] = await db.execute(
      "SELECT h.*, f.isFavourite FROM homes h JOIN favourites f ON h.id = f.homeId",
    );
    return rows;
  }

  static async getAllFavouriteHomes() {
    const [rows] = await db.execute(
      "SELECT h.*, f.isFavourite FROM homes h JOIN favourites f ON h.id = f.homeId WHERE f.isFavourite = 1",
    );
    return rows;
  }

  static async toggleFavouriteHome(homeId) {
    return await db.execute(
      "UPDATE favourites SET isFavourite = NOT isFavourite WHERE homeId = ?",
      [homeId],
    );
  }

  static async getHomeById(id) {
    const [rows] = await db.execute(
      "SELECT h.*, f.isFavourite FROM homes h JOIN favourites f ON h.id = f.homeId WHERE h.id = ?",
      [id],
    );
    return rows[0];
  }

  static async updateHome(id, updatedData) {
    const [rows] = await db.execute(
      "UPDATE homes SET name = ?, location = ?, price = ?, url = ? WHERE id = ?",
      [
        updatedData.homeName,
        updatedData.location,
        updatedData.price,
        updatedData.photo,
        id,
      ],
    );
    return rows;
  }

  static async deleteHome(id) {
    const [rows] = await db.execute("DELETE FROM homes WHERE id = ?", [id]);
    return rows;
  }
};
