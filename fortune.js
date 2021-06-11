const { fortune_cookie_url } = require("./config.json");
const axios = require("axios");

async function randomCookie(msg) {
  try {
    const response = await axios.get(fortune_cookie_url);
    msg.channel.send(response.data.fortune);
  } catch (error) {
    console.error(error);
    msg.channel.send("Error fetching fortune.");
  }
}

module.exports = { randomCookie };
