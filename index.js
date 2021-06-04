//Grab Discord API
const Discord = require("discord.js");

//Get fetch api
const fetch = require("node-fetch");

//Grab JSONs
const bot_login_token = require("./config.js").bot_login_token;
const config = require("./config.json");
const meme_api = require("./meme_api.json");

// Import Music Command functions
const music = require("./music");

const dadjokes = require("./dadjokes.js");

//Create Bot instince
const self = new Discord.Client();

async function diceRoll(msg) {
  const content = msg.content.substring(config.prefix.length).split(" ");
  if (content.length === 2) {
    const diceAmount = content[1];
    msg.channel.send(
      (Math.floor(Math.random() * parseInt(content[1])) + 1).toString()
    );
  } else if (content.length === 3) {
    const diceAmount = parseInt(content[1]);
    const numberOfDice = parseInt(content[2]);
    if (numberOfDice > 10) {
      return msg.reply("Too many dice. Max Number is 10");
    }
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
      default:
        msg.reply("Invalid Command");
    }
  }
});

//     _         _                  _
//    / \  _   _| |_ ___  _ __ ___ | | ___
//   / _ \| | | | __/ _ \| '__/ _ \| |/ _ \
//  / ___ \ |_| | || (_) | | | (_) | |  __/
// /_/   \_\__,_|\__\___/|_|  \___/|_|\___|

self.on("guildMemberAdd", async (member) => {
  // Get Preffered Role Name (Human or Bot)
  rolename = config.default_user_role;
  if (member.user.bot) {
    rolename = config.default_bot_role;
  }

  // Fetch available roles on server
  const roles = await member.guild.roles.fetch();

  roles.cache.forEach((role) => {
    // If current role is of chosen role
    if (role.name === rolename) {
      userRoles = member._roles;
      userRoles.push(role.id);
      member.edit({
        roles: userRoles,
      });
    }
  });
});

//Upon Bot logging in
self.on("ready", () => {
  console.log(`Logged in as ${self.user.username}`);
  console.log(`Servers: ${self.guilds.cache.array().length}`);
});

// Login using token
self.login(bot_login_token);
