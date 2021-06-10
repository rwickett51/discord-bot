const { mongodb_uri } = require("./config.js");

//Connect to MongoDB db
const { MongoClient } = require("mongodb");
const client = new MongoClient(mongodb_uri, {
  useUnifiedTopology: true,
});

client.connect();

module.exports = client;
