//Grab Discord API
var Discord = require("discord.js");

//Import Music Bot Packages
const ytdl = require("ytdl-core");

//Get fetch api
const fetch = require("node-fetch");

//Get Youtube API
var search = require("youtube-search");

//Grab JSONs
const config = require("./config.json");
const meme_api = require("./meme_api.json");

//Create Bot instince
const self = new Discord.Client();

//Functions

////////////////////////////////////////////////////////////////////////////////
/*                                                                            */
/*                         MEME FUNCTIONS                                     */
/*                                                                            */
////////////////////////////////////////////////////////////////////////////////
function get_meme(msg, content, meme) {
  return fetch(
    `https://api.imgflip.com/caption_image?template_id=${meme.id}&username=${
      config.meme_username
    }&password=${config.meme_password}&text0=${
      content[1] != undefined ? content[1].replace(/-/g, " ") : " "
    }&text1=${content[2] != undefined ? content[2].replace(/-/g, " ") : " "}`
  )
    .then(captionedmeme => {
      return captionedmeme.json();
    })
    .then(captionedmemeJson => {
      return captionedmemeJson;
    });
}

////////////////////////////////////////////////////////////////////////////////
/*                                                                            */
/*                         MUSIC FUNCTIONS                                    */
/*                                                                            */
////////////////////////////////////////////////////////////////////////////////

const queue = new Map(); //Music queue

opts = {
  maxResults: 10,
  key: config.YouTube_API_Key
};

function validURL(str) {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
    "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
    "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
    "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
    "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return !!pattern.test(str);
}

function remove(msg, serverQueue) {
  index = parseInt(msg.content.substr(msg.content.indexOf(" ") + 1));
  index--;
  //removal funciton
  if (index > 0 && index < serverQueue.songs.length) {
    //assures song is in the songs array, and removes
    console.log(serverQueue.songs[index]);
    /*if (index == 0) {
      skip(msg, serverQueue);
  } else {*/
    serverQueue.songs.splice(index, 1);
    //}
  } else if (index == 0) {
    msg.channel.send("This song is currently playing and cannot be removed.");
  } else {
    //catches error in the index and tells the user
    msg.channel.send("There is no song in the queue at " + index + ".");
  }
}

async function add(message, serverQueue) {
  searchTerm = message.content.substr(message.content.indexOf(" ") + 1);

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel)
    return message.channel.send(
      "You need to be in a voice channel to play music!"
    );
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return message.channel.send(
      "I need the permissions to join and speak in your voice channel!"
    );
  }

  search(searchTerm, opts, async function(err, results) {
    if (err) {
      return "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    }
    url = "";
    if (validURL(searchTerm)) {
      url = searchTerm;
    } else {
      url = results[0].link;
    }
    const songInfo = await ytdl.getInfo(url);
    const song = {
      title: songInfo.title,
      url: songInfo.video_url
    };

    if (!serverQueue) {
      const queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true
      };

      queue.set(message.guild.id, queueContruct);

      queueContruct.songs.push(song);
      try {
        var connection = await voiceChannel.join();
        queueContruct.connection = connection;

        play(message.guild, queueContruct.songs[0]);
      } catch (err) {
        queue.delete(message.guild.id);
        return message.channel.send(err);
      }
    } else {
      serverQueue.songs.push(song);
      return message.channel.send(`${song.title} has been added to the queue!`);
    }
  });
}

function skip(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  if (!serverQueue)
    return message.channel.send("There is no song that I could skip!");
  serverQueue.connection.dispatcher.end();
}

function pause(msg, serverQueue) {
  if (!msg.member.voice.channel)
    return msg.channel.send(
      "You have to be in a voice channel to pause the music!"
    );
  if (serverQueue) {
    if (serverQueue.connection.dispatcher.paused) {
      return serverQueue.connection.dispatcher.resume();
    } else {
      return serverQueue.connection.dispatcher.pause();
    }
  }
  return msg.channel.send("There is no song that I can pause!");
}

function scrub(msg, serverQueue) {}

function q(msg, serverQueue) {
  if (serverQueue == undefined) {
    msg.channel.send("Queue is empty");
  } else {
    str = "```";
    serverQueue.songs.forEach((obj, index) => {
      str += `${index + 1}: **${obj.title}** - ${obj.url}\n`;
    });
    msg.channel.send(str + "```");
  }
}

function dc(msg, serverQueue) {
  // leave channel
  try {
    if (msg.guild.me.voice.connection.status == 0) {
      if (serverQueue.connection.dispatcher.paused) {
        serverQueue.connection.dispatcher.resume();
      }
      serverQueue.songs = [];
      serverQueue.connection.dispatcher.end();
      var messages = [
        "Later loser",
        "It's been poggers",
        "No tears, only dreams"
      ];
      msg.channel.send(messages[Math.floor(Math.random() * messages.length)]);
    }
  } catch (err) {
    msg.channel.send("Oi I'm already gone");
  }
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);

  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  } else {
    serverQueue.textChannel.send("Now playing " + song.title);
  }
  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => {
      console.error(error);
    });

  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  //serverQueue.textChannel.send(`Start playing: **${song.title}**`);
}

//
self.on("message", msg => {
  if (msg.author.bot) return; //Check if bot created message
  if (msg.content[0] === config.prefix) {
    let content = msg.content.substring(config.prefix.length).split(" ");
    const serverQueue = queue.get(msg.guild.id);
    switch (content[0]) {
      case "users":
        msg.channel.send(
          `Number of users on ${self.guilds.resolve(msg.guild).name}: **${
            self.guilds.resolve(msg.guild).memberCount
          }**`
        );
        break;
      case "owner":
        msg.channel.send(
          `Owner of ${self.guilds.resolve(msg.guild).name}: **${
            self.guilds.resolve(msg.guild).owner.displayName
          }**`
        );
        break;

      ///////////////////////////////////////////////////////////////////////////
      /*                                                                       */
      /*                         MEME CALLS                                    */
      /*                                                                       */
      ///////////////////////////////////////////////////////////////////////////
      case "meme": //Random Meme
        meme =
          meme_api.data.memes[
            Math.floor(Math.random() * Math.floor(meme_api.data.memes.length))
          ];
        get_meme(msg, content, meme).then(data => {
          msg.channel.send(data.data.url);
        });
        break;
      case "mocking": // Mocking Spongebob
        meme = meme_api.data.memes[4];
        get_meme(msg, content, meme).then(data => {
          msg.channel.send(data.data.url);
        });
        break;
      case "uno": //Uno Draw 25
        meme = meme_api.data.memes[9];
        get_meme(msg, content, meme).then(data => {
          msg.channel.send(data.data.url);
        });
        break;
      case "nut":
        meme = meme_api.data.memes[16];
        get_meme(msg, content, meme).then(data => {
          msg.channel.send(data.data.url);
        });
        break;
      case "buttons": //Two Buttons
        meme = meme_api.data.memes[2];
        get_meme(msg, content, meme).then(data => {
          msg.channel.send(data.data.url);
        });
        break;
      case "cmm": // Change my mind
        meme = meme_api.data.memes[3];
        get_meme(msg, content, meme).then(data => {
          msg.channel.send(data.data.url);
        });
        break;
      case "cat": // Woman Yelling at Cat
        meme = meme_api.data.memes[8];
        get_meme(msg, content, meme).then(data => {
          msg.channel.send(data.data.url);
        });
        break;
      case "bigbrain": // PENDING 4 BOX
        meme = meme_api.data.memes[11];
        get_meme(msg, content, meme).then(data => {
          msg.channel.send(data.data.url);
        });
        break;
      case "think": // Roll Safe Think About it
        meme = meme_api.data.memes[14];
        get_meme(msg, content, meme).then(data => {
          msg.channel.send(data.data.url);
        });
        break;
      case "hannibal": // Who killed hannibal?
        meme = meme_api.data.memes[39];
        get_meme(msg, content, meme).then(data => {
          msg.channel.send(data.data.url);
        });
        break;
      case "crab":
        msg.channel.send(
          `:crab: ${
            content[1] != undefined ? content[1].replace(/-/g, " ") : " "
          } Is Dead :crab:`
        );
        break;
      case "certify":
        msg.channel.send(
          `Congratulations, you just posted ${
            content[1] != undefined ? content[1].replace(/-/g, " ") : " "
          }`
        );
        break;
      ///////////////////////////////////////////////////////////////////////////
      /*                                                                       */
      /*                         MUSIC CALLS                                   */
      /*                                                                       */
      ///////////////////////////////////////////////////////////////////////////
      case "play":
        add(msg, serverQueue);
        break;
      case "pause":
        pause(msg, serverQueue);
        break;
      case "skip":
        skip(msg, serverQueue);
        break;
      case "scrub":
        scrub(msg, serverQueue);
        break;
      case "q":
        q(msg, serverQueue);
        break;
      case "dc":
        dc(msg, serverQueue);
        //const serverQueue = queue.get(msg.guild.id);
        break;
      case "h":
        msg.channel.send(
          "*Music commands*:\n`.play  : add a url to queue\n.pause : pause or play\n.skip  : skip current track\n.q     : print queue\n.r     : remove song at index in the queue \n.dc    : disconnect bot`"
        );
        break;
      case "r":
        remove(msg, serverQueue);
        break;
      default:
        msg.reply("Invalid Command");
    }
  }
});

self.on("messageDelete", msg => {
  msg.channel.send("Don't delete your messages, pussy");
  msg.channel.send(`\`${msg}\``);
});

self.on("guildMemberAdd", member => {
  rolename = config.default_user_role;
  if (member.user.bot) {
    rolename = config.default_bot_role;
  }
  member.guild.roles.fetch().then(roles => {
    roles.cache.forEach(role => {
      if (role.name == rolename) {
        userRoles = member._roles;
        userRoles.push(role.id);
        member.edit({
          roles: userRoles
        });
      }
    });
  });
});

//Upon Bot logging in
self.on("ready", () => {
  Channels = self.channels;
  Users = self.users;
  console.log(
    `self has started, with ${self.users} users, in ${self} channels of ${self.guilds} guilds.`
  );
  console.log(`Logged in as ${self.user.username}`);
  console.log(`Servers: ${self.guilds.cache.array().length}`);
});

// Login using token
self.login(config.token);
