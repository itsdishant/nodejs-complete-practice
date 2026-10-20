const mongo = require("mongodb");
const dotenv = require("dotenv");

dotenv.config();

const MongoClient = mongo.MongoClient;

let _db;

const mongoConnect = async (callback) => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set in the environment or .env file.");
  }

  const client = await MongoClient.connect(uri);
  _db = client.db("airbnb");
  callback();
};

const getDatabase = () => {
  if (!_db) {
    throw new Error("Database not initialized. Call mongoConnect first.");
  }
  return _db;
};

exports.mongoConnect = mongoConnect;
exports.getDatabase = getDatabase;
