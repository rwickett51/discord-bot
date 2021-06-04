const dad_joke_api_key = require("./config.js").dad_joke_api_key;
const axios = require("axios");
const url = require("./config.json").dad_joke_api_url;

/**
 * Fetches a random Dad Joke and prints it out.
 *
 * @param {Object} msg User message object
 */
async function randomDadJoke(msg) {
  // Set Headers
  const config = {
    headers: {
      "x-rapidapi-key": dad_joke_api_key,
    },
  };

  // Request from Dad Jokes API
  const response = await axios.get(url, config);
  msg.channel.send(
    response.data.body[0].setup + " ||" + response.data.body[0].punchline + "||"
  );
}

module.exports = { randomDadJoke: randomDadJoke };
