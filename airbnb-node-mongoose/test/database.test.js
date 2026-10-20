const test = require("node:test");
const assert = require("node:assert/strict");
const { MongoClient } = require("mongodb");

test("connects with the configured MONGODB_URI", async () => {
  const previousMongoUri = process.env.MONGO_URI;
  const previousMongodbUri = process.env.MONGODB_URI;
  const previousConnect = MongoClient.connect;
  const expectedUri = "mongodb://localhost:27017/airbnb-test";
  const client = {};
  let connectedClient;
  let requestedUri;

  process.env.MONGODB_URI = expectedUri;
  delete process.env.MONGO_URI;
  MongoClient.connect = async (uri) => {
    requestedUri = uri;
    return client;
  };

  const modulePath = require.resolve("../utils/database");
  delete require.cache[modulePath];
  const connectToDatabase = require("../utils/database");

  try {
    await new Promise((resolve, reject) => {
      connectToDatabase((connected) => {
        connectedClient = connected;
        resolve();
      });
      setImmediate(() => {
        if (!connectedClient) reject(new Error("Database callback was not called"));
      });
    });

    assert.equal(requestedUri, expectedUri);
    assert.equal(connectedClient, client);
  } finally {
    MongoClient.connect = previousConnect;
    delete require.cache[modulePath];
    if (previousMongoUri === undefined) delete process.env.MONGO_URI;
    else process.env.MONGO_URI = previousMongoUri;
    if (previousMongodbUri === undefined) delete process.env.MONGODB_URI;
    else process.env.MONGODB_URI = previousMongodbUri;
  }
});
