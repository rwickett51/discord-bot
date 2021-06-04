const dad_joke_api_key = require("./config.js").dad_joke_api_key;
const axios = require("axios");
const url = require("./config.json").dad_joke_api_url;

async function randomDadJoke(msg) {
  const config = {
    headers: {
      "x-rapidapi-key": dad_joke_api_key,
    },
  };

  const response = await axios.get(url, config);
  console.log(response.data);
  msg.channel.send(
    response.data.body[0].setup + " ||" + response.data.body[0].punchline + "||"
  );
  msg.channel.send();
}

module.exports = { randomDadJoke: randomDadJoke };
