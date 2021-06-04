//  __  __           _
// |  \/  |_   _ ___(_) ___
// | |\/| | | | / __| |/ __|
// | |  | | |_| \__ \ | (__
// |_|  |_|\__,_|___/_|\___|

//Get Youtube API
var search = require("youtube-search");

//Grab JSONs
const YouTube_API_Key = require("./config.js").YouTube_API_Key;

//Fetch song data from URL
const ytdl = require("ytdl-core");

const queue = new Map(); //Music queue

// ytdl options. For YouTube Search API
opts = {
  maxResults: 1,
  key: YouTube_API_Key,
};

/**
 * Validate if a given string is a valid URL.
 *
 * @param  {string} str String to validate
 * @return {boolean}    Is a URL or not
 */
function validURL(str) {
  const pattern = new RegExp(
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

/**
 * Remove a song from song queue at given index.
 *
 * @param  {Object} msg User message object. Should hold integer value as argument
 */
function remove(msg) {
  // Fetch song queue
  const serverQueue = queue.get(msg.guild.id);

  // Get Index of song to remove
  let index = parseInt(msg.content.substr(msg.content.indexOf(" ") + 1)) - 1;
  if (isNaN(index)) {
    return msg.channel.send("Invalid argument");
  }

  // Check if song to skip exists and is not first
  if (index > 0 && index < serverQueue.songs.length) {
    serverQueue.songs.splice(index, 1);
  } else if (index == 0) {
    msg.channel.send("This song is currently playing and cannot be removed.");
  } else {
    msg.channel.send("There is no song in the queue at " + index + ".");
  }
}

/**
 * Request a song to play. If the queue is empty, create a new one and have bot
 * join the Voice Channel. If queue exists, append new song to queue.
 *
 * @param {Object} message User message object. contains information about voice
 * channel and song name/URL
 */
async function add(message) {
  // Fetch song queue
  const serverQueue = queue.get(message.guild.id);

  // Search Query
  searchTerm = message.content.substr(message.content.indexOf(" ") + 1);

  // Check if user is currently in a Voice Channel
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel)
    return message.channel.send(
      "You need to be in a voice channel to play music!"
    );

  // Check if bot has permission to join Voice Channel
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return message.channel.send(
      "I need the permissions to join and speak in your voice channel!"
    );
  }

  let url = "";

  //Check if provided search term is link or song title
  if (validURL(searchTerm)) {
    url = searchTerm;
  } else {
    // Search for song using YouTube API
    // :youtube: Searching :mag_right:
    message.channel.send(`**Searching** :mag_right: \`${searchTerm}\``);
    await new Promise((resolve, reject) => {
      search(searchTerm, opts, async (error, results) => {
        if (error) {
          console.error(error);
          message.channel.send("Error searching for song.");
          reject(error);
        }
        url = results[0].link;
        resolve();
      });
    });
  }

  // Fetch youtube data using URL
  const songInfo = await ytdl.getInfo(url);

  const song = {
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url,
  };

  // If there are no songs in the queue yet
  if (!serverQueue) {
    const queueConstruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true,
    };

    // Create and set template for song queue
    queue.set(message.guild.id, queueConstruct);

    // Add song to new queue
    queueConstruct.songs.push(song);

    try {
      //Have bot join Voice Channel and establish connection
      const connection = await voiceChannel.join();
      queueConstruct.connection = connection;

      // Play new song
      play(message.guild, queueConstruct.songs[0]);
    } catch (err) {
      queue.delete(message.guild.id);
      return console.log(err); //message.channel.send(err.message);
    }
  } else {
    // Add song to existing queue
    serverQueue.songs.push(song);
    return message.channel.send(
      `\`${song.title}\` has been added to the queue!`
    );
  }
}

/**
 * Skip currently playing song in the queue.
 *
 * @param  {Object} msg User message object
 */
function skip(msg) {
  // Fetch song queue
  const serverQueue = queue.get(msg.guild.id);

  // Check if use is in a voice channel
  if (!msg.member.voice.channel) {
    return msg.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  }

  // Check if there is a song in queue to skip
  if (!serverQueue) {
    return msg.channel.send("There is no song that I could skip!");
  }

  // End song
  serverQueue.connection.dispatcher.end();
}

/**
 * Toggles pause state of the currently playing song.
 *
 * @param  {Object} msg User message object.
 */
function pause(msg) {
  // Fetch song queue
  const serverQueue = queue.get(msg.guild.id);

  // Check if user is in a Voice Channel
  if (!msg.member.voice.channel)
    return msg.channel.send(
      "You have to be in a voice channel to pause the music!"
    );

  // Check if queue has active song
  if (serverQueue) {
    // Toggle Pause state
    if (serverQueue.connection.dispatcher.paused) {
      return serverQueue.connection.dispatcher.resume();
    } else {
      return serverQueue.connection.dispatcher.pause();
    }
  } else {
    return msg.channel.send("There is no song that I can pause!");
  }
}

/**
 * Print the songs in the queue.
 *
 * @param  {Object} msg User message object.
 */
function q(msg) {
  // Fetch song queue
  const serverQueue = queue.get(msg.guild.id);

  //Check if there are songs in the queue
  if (!serverQueue) {
    msg.channel.send("Queue is empty");
  } else {
    str = "```";
    serverQueue.songs.forEach((obj, index) => {
      str += `${index + 1}: **${obj.title}** - ${obj.url}\n`;
    });
    str += "```";
    msg.channel.send(str);
  }
}

/**
 * Forces the bot to disconnect from a Voice Channel and clear song queue.
 * @param  {Object} msg User message object.
 */
function dc(msg) {
  // Fetch song queue
  const serverQueue = queue.get(msg.guild.id);

  // leave channel
  try {
    if (msg.guild.me.voice.connection.status == 0) {
      // Reset Pause State
      if (serverQueue.connection.dispatcher.paused) {
        serverQueue.connection.dispatcher.resume();
      }

      // Clear Songs
      serverQueue.songs = [];
      serverQueue.connection.dispatcher.end();

      // Lovely leaving message
      const messages = [
        "Later loser",
        "It's been poggers",
        "No tears, only dreams",
      ];
      msg.channel.send(messages[Math.floor(Math.random() * messages.length)]);
    }
  } catch (err) {
    msg.channel.send("Oi I'm already gone");
  }
}

/**
 * Start playing song through bot.
 *
 * @param  {number} guild Current User's Guild ID (Server)
 * @param  {Object} song  Song Title and URL
 */
function play(guild, song) {
  // Fetch song queue
  const serverQueue = queue.get(guild.id);

  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  } else {
    serverQueue.textChannel.send(
      `**Playing** :notes: \`${song.title}\` - Now!`
    );
  }

  // Create dispatcher to play song through bot
  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", (error) => {
      console.error(error);
    });

  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}

module.exports = { remove, add, skip, pause, q, dc };
