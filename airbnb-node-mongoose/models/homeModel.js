module.exports = class Home {
  constructor(name, location, price, url, isFavourite = false) {
    this.name = name;
    this.location = location;
    this.price = price;
    this.url = url;
    this.isFavourite = isFavourite;
  }

  async save() {}

  static async getAllHomes() {}

  static async getAllFavouriteHomes() {}

  static async toggleFavouriteHome(homeId, isFavourite) {}

  static async getHomeById(id) {}

  static async updateHome(id, updatedData) {}

  static async deleteHome(id) {}
};
