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

async function GreetDad(msg) {
  const temp = msg.content.split(" ");
  const lower = temp.map((str) => str.toLowerCase());

  const name = getNameFromMessage(temp, lower);
  if (name !== "") {
    msg.reply(`Hey ${name}, I'm Dad`);

    try {
      const db = database.db("discordBot");
      const roastdb = db.collection("roasted");
      const entry = await roastdb.findOne({ id: msg.author.id });
      if (entry === null) {
        roastdb.insertOne({id: msg.author.id, count: 1});
      } else {
        roastdb.updateOne({id: msg.author.id}, {$inc: {count: 1}})
      }
      
    } catch (error) {
      console.error("Error adding analytics to database:", error.message);
    }
  }
}

function getRoastedLeaderboard(msg, client) {

  const roastdb = database.db("discordBot").collection("roasted");
  const pipeline = [
  {
    '$sort': {
      'count': -1
    }
  }, {
    '$limit': 5
  }
]

  try  {
    const roastdb = database.db("discordBot").collection("roasted");
    roastdb.aggregate(pipeline, (error, data) => {
      if (error) throw new Error(error);
      const response = []
      let stars = 5
      const starEmoji = client.emojis.cache.find(emoji => emoji.name === "gtastar");
      response.push('Most Wanted:')
      data.forEach((d) => {
        const x = `${`${starEmoji}`.repeat(stars)}\t\`${client.users.cache.get(d.id).tag.split("#")[0]}\` -- \`${d.count}\``
        response.push(x)
        stars--
      }).then(() => msg.channel.send(response.join("\n")));
      
    });
  } catch(error) {
    console.error(error.message)
  }
}

function getNameFromMessage(temp, lower) {
  const splitters = ["i'm", "im", "i’m"];

  let index = temp.length;
  splitters.forEach((split) => {
    const tempIndex = lower.indexOf(split);
    console.log("TempIndex: " + tempIndex);
    if (tempIndex !== -1 && tempIndex < index) {
      index = tempIndex + 1;
    }
  });

  console.log("Earliest Index: " + index);
  if (index === temp.length) {
    return "";
  }

  return temp.slice(index, temp.length).join(" ").split(".")[0];
}

module.exports = { randomDadJoke, GreetDad, getRoastedLeaderboard };
