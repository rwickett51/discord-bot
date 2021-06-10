const dad_joke_api_key = require("./config.js").dad_joke_api_key;
const axios = require("axios");
const url = require("./config.json").dad_joke_api_url;
const database = require("./database.js");

/**
 * Fetches a random Dad Joke and prints it out.
 *
 * @param {Object} msg User message object
 */
async function randomDadJoke(msg) {
  let data = {};
  try {
    // Set Headers
    const config = {
      headers: {
        "x-rapidapi-key": dad_joke_api_key,
      },
    };

    // Request from Dad Jokes API
    const response = await axios.get(url, config);
    data = response.data.body[0];

    if (database.isConnected) {
      // If new joke is not in database, add it
      const db = database.db("discordBot");
      const dadjokesdb = db.collection("dadjokes");
      InsertJokeIntoDatabase(dadjokesdb, data);
    }
  } catch (error) {
    // Instead pull from database
    if (database.isConnected) {
      const db = database.db("discordBot");
      const dadjokesdb = db.collection("dadjokes");
      data = await FetchFromDatabase(dadjokesdb, data);
    }
  }

  //If a Joke was found, send it
  if (data && Object.keys(data).length !== 0 && data.constructor === Object) {
    msg.channel.send(data.setup + " ||" + data.punchline + "||");
  }
}

/**
 * Inserts a new Joke into the Database
 *
 * @param {Collection} dadjokesdb MongoDB Database Reference
 * @param {Object} data Joke Type, Setup, and Punchline
 */
async function InsertJokeIntoDatabase(dadjokesdb, data) {
  try {
    const x = await dadjokesdb.findOne({ setup: data.setup });
    if (x === null) {
      dadjokesdb.insertOne({
        type: data.type,
        setup: data.setup,
        punchline: data.punchline,
      });
    }
  } catch (error) {
    console.error("Error adding new joke to Database.");
    console.error(error);
  }
}

/**
 * Fetches a Joke from the Mongo Database
 *
 * @param {Collection} dadjokesdb MongoDB Database Reference
 * @param {Object} data Joke Type, Setup, and Punchline
 * @returns
 */
async function FetchFromDatabase(dadjokesdb, data) {
  const options = {
    _id: 0,
    type: 1,
    setup: 1,
    punchline: 1,
  };

  try {
    const joke = await dadjokesdb.findOne({}, options);
    return joke;
  } catch (error) {
    console.error("Error fetching joke from Database");
    console.error(error);
  }
}

module.exports = { randomDadJoke };
