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

// Import Music Command functions
const music = require("./music");

const { randomDadJoke, GreetDad } = require("./dadjokes.js");
const database = require("./database.js");
const { randomCookie } = require("./fortune.js");

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
    ssss;
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
        dadjokes.randomDadJoke(msg);
        break;
      case "d":
        diceRoll(msg);
        break;
      case "fortune":
        randomCookie(msg);
        break;
      default:
        msg.reply("Invalid Command");
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
  console.log(`Logged in as ${self.user.username}`);
  console.log(`Servers: ${self.guilds.cache.array().length}`);
});

// Login using token
self.login(bot_login_token);
