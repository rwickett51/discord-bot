//Grab Discord API
const Discord = require("discord.js");

//Get fetch api
const fetch = require("node-fetch");

//Grab JSONs
const {
  bot_login_token,
  max_dice,
  default_user_role,
  default_bot_role,
} = require("./config.js");
const config = require("./config.json");
//const meme_api = require("./meme_api.json");

const { performance } = require("perf_hooks");

// Import Music Command functions
const music = require("./music");

const { randomDadJoke, GreetDad, getRoastedLeaderboard } = require("./dadjokes.js");
const database = require("./database.js");
const { randomCookie } = require("./fortune.js");
const { getFullDate } = require("./util.js");
const { type } = require("os");

//Create Bot instance
const self = new Discord.Client();

/**
 * Generates random dice and returns them as a message.
 *
 * @param {Object} msg User message object
 * @returns
 */
async function diceRoll(msg) {
  // Get message parameters
  const content = msg.content.substring(config.prefix.length).split(" ");

  // If only 2 parameters, only generate 1 dice.
  if (content.length === 2) {
    const diceAmount = parseInt(content[1]);
    msg.channel.send((Math.floor(Math.random() * diceAmount) + 1).toString());
  } else if (content.length === 3) {
    // Parse parameters
    const diceAmount = parseInt(content[1]);
    const numberOfDice = parseInt(content[2]);

    // Set max number of dice
    if (numberOfDice > max_dice) {
      return msg.reply(`Too many dice. Max number is ${max_dice}`);
    }

    // Construct dice message
    let message = `${numberOfDice}x d${diceAmount} - `;
    let total = 0;
    for (let i = 0; i < numberOfDice; i++) {
      await new Promise((resolve) => {
        setTimeout(() => {
          let value = Math.floor(Math.random() * diceAmount) + 1;
          message += "`" + value.toString() + "` ";
          total += value;
          resolve();
        }, 50);
      });
    }
    message += "- **Total: **" + total;
    msg.channel.send(message);
  }
}

/**
 * Event listener that prints whenever a message is posted.
 */
self.on("message", (msg) => {
  //Check if bot created message
  if (msg.author.bot) {
    return;
  }
  if (msg.content[0] === config.prefix) {
    const content = msg.content.substring(config.prefix.length).split(" ");

    // Analytics Values
    const command = content[0];
    const user_id = msg.member.id;
    const t0 = performance.now();
    const created_at = getFullDate();
    let invalid = false;

    switch (content[0]) {
      case "crab":
        msg.channel.send(
          `:crab: ${
            content[1] != undefined ? content[1].replace(/-/g, " ") : " "
          } Is Dead :crab:`
        );
        break;
      case "play":
        music.add(msg);
        break;
      case "pause":
        music.pause(msg);
        break;
      case "skip":
        music.skip(msg);
        break;
      case "q":
        music.q(msg);
        break;
      case "dc":
        music.dc(msg);
        break;
      case "h":
        msg.channel.send(
          "*Music commands*:\n`.play  : add a url to queue\n.pause : pause or play\n.skip  : skip current track\n.q     : print queue\n.r     : remove song at index in the queue \n.dc    : disconnect bot`"
        );
        break;
      case "r":
        music.remove(msg);
        break;
      case "dad":
        randomDadJoke(msg);
        break;
      case "d":
        diceRoll(msg);
        break;
      case "fortune":
        randomCookie(msg);
        break;
      case "roasted":
        getRoastedLeaderboard(msg, self)
        break;
      default:
        invalid = true;
        msg.reply("Invalid Command");
    }
    const t1 = performance.now();
    const response_time = (t1 - t0) / 1000;
    const analyticsObj = {
      command,
      response_time,
      created_at,
      invalid,
    };
    console.log(analyticsObj);

    try {
      const db = database.db("discordBot");
      const requestsdb = db.collection("requests");
      requestsdb.insertOne(analyticsObj);
    } catch (error) {
      console.error("Error adding analytics to database");
    }
    return;
  }

  // Parse user text for a dad joke opprotunity
  GreetDad(msg);
});

//     _         _                  _
//    / \  _   _| |_ ___  _ __ ___ | | ___
//   / _ \| | | | __/ _ \| '__/ _ \| |/ _ \
//  / ___ \ |_| | || (_) | | | (_) | |  __/
// /_/   \_\__,_|\__\___/|_|  \___/|_|\___|

/**
 * Event listener that triggers when a new member joins a guild. Automatically assigns a role to them.
 */
self.on("guildMemberAdd", async (member) => {
  // Get Preferred Role Name (Human or Bot)
  const rolename = member.user.bot ? default_bot_role : default_user_role;

  // Fetch available roles on server
  const guildRoles = await member.guild.roles.fetch();

  // Get information about role to add
  const [roleInfo] = guildRoles.cache.filter((role) => role.name === rolename);

  // If role exists, add user to role
  if (roleInfo !== undefined) {
    let roles = member._roles;
    roles.push(roleInfo.id);
    member.edit({
      roles,
    });
  }
});

/**
 * Event listener that triggers when the bot successfully logs in.
 */
self.on("ready", async () => {
  const servers = self.guilds.cache.array().length;
  const startTime = new Date().toISOString();

  console.log(`Logged in as ${self.user.username}`);
  console.log(`Servers: ${servers}`);

  // Set General Information
  const users = self.guilds.cache
    .map((guild) => guild.memberCount)
    .reduce((total, count) => total + count);

  setGeneralInformation(servers, startTime, users);
});

/**
 *
 * @param {number} servers number of servers bot services
 * @param {String} startTime server start time in ISO format
 * @param {number} users number of users bot services
 */
async function setGeneralInformation(servers, startTime, users) {
  try {
    // Get General Collection
    const generaldb = database.db("discordBot").collection("general");

    // Check if db contains document
    const response = await generaldb.findOne({ id: "startUp" });
    if (response === null) {
      generaldb.insertOne({
        servers,
        startTime,
        users,
        id: "startUp",
      });
    } else {
      generaldb.updateOne(
        { id: "startUp" },
        {
          $set: { servers, startTime, users },
        }
      );
    }
  } catch (error) {
    console.error("Error setting General Information:", error.message);
  }
}

// self.on("voiceStateUpdate", async (oldState, newState) => {
//   if (oldState.member.user.bot) return;

//   const whitelist = ["858034325886468106"];

//   if (newState.channelID === null) {
//     console.log("user left channel", oldState.channelID);
//     const channel = await self.channels.fetch(oldState.channelID);

//     try {
//       await channel.leave();
//       console.log("Successfully disconnected.");
//     } catch (error) {
//       console.error(e);
//     }
//   } else if (oldState.channelID === null) {
//     console.log("user joined channel", newState.channelID);
//     const channel = await self.channels.fetch(newState.channelID);
//     try {
//       await channel.join();
//       console.log("Successfully connected.");
//     } catch (error) {
//       console.error(e);
//     }
//   } else {
//     console.log("user moved channels", oldState.channelID, newState.channelID);
//   }
// });

// Login using token
self.login(bot_login_token);

module.exports = self;
