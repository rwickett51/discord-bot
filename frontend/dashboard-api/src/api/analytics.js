const express = require("express");
const router = express.Router();

const axios = require("axios");

const database = require("../database.js");

router.get("/", async (req, res) => {
  try {
    console.log("Connection has been established successfully.");
    return res.json({
      message: "Connection has been established successfully.",
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    return res.json({
      message: `Unable to connect to the database: ${error}`,
    });
  }
});

router.get("/uptime", async (req, res) => {
  try {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5000");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "POST,GET,OPTIONS,PUT,DELETE"
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Accept");
    console.log("Requesting uptime");
    // Get General Collection
    const generaldb = database.db("discordBot").collection("general");
    // Get Start Up Document from db
    const response = await generaldb.findOne({ id: "startUp" });

    // Check if Document exists
    if (response !== null) {
      const { startTime } = response;
      const t = Math.floor((new Date() - Date.parse(startTime)) / 1000);
      res.json({ time: secondsToDhms(t), seconds: t });
    } else {
      throw new Error("No Startup Document found in database");
    }
  } catch (error) {
    res.sendStatus(400);
  }
});

router.get("/users", async (req, res) => {
  try {
    // Get General Collection
    const generaldb = database.db("discordBot").collection("general");
    // Get Start Up Document from db
    const response = await generaldb.findOne({ id: "startUp" });

    // Check if Document exists
    if (response !== null) {
      res.json({ users: response.users });
    } else {
      throw new Error("No Startup Document found in database");
    }
  } catch (error) {
    res.sendStatus(400);
  }
});

router.get("/servers", async (req, res) => {
  try {
    // Get General Collection
    const generaldb = database.db("discordBot").collection("general");
    // Get Start Up Document from db
    const response = await generaldb.findOne({ id: "startUp" });

    // Check if Document exists
    if (response !== null) {
      res.json({ servers: response.servers });
    } else {
      throw new Error("No Startup Document found in database");
    }
  } catch (error) {
    res.sendStatus(400);
  }
});

router.get("/requests", async (req, res) => {
  try {
    // Get General Collection
    const requestsdb = database.db("discordBot").collection("requests");
    const response = await requestsdb.countDocuments();
    console.log(response);
    res.json({ requests: response });
  } catch (e) {
    res.sendStatus(400);
  }
});

router.get("/dailyrequests", async (req, res) => {
  try {
    // Get General Collection
    const requestsdb = database.db("discordBot").collection("requests");

    const pipeline = [
      {
        $group: {
          _id: {
            $toLower: "$created_at",
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
      {
        $group: {
          _id: null,
          counts: {
            $push: {
              k: "$_id",
              v: "$count",
            },
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $arrayToObject: "$counts",
          },
        },
      },
    ];

    requestsdb.aggregate(pipeline, (error, data) => {
      if (error) throw new Error(error);
      data.forEach((d) => {
        const response = [];
        for (const [date, count] of Object.entries(d)) {
          response.push({ date, count });
        }
        return res.send(response);
      });
    });
    //console.log(response);
  } catch (e) {
    console.error(e.message);
    res.sendStatus(400);
  }
});

router.get("/dailysums", async (req, res) => {
  try {
    // Get General Collection
    const requestsdb = database.db("discordBot").collection("requests");

    const pipeline = [
      {
        $group: {
          _id: {
            $toLower: "$created_at",
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
      {
        $group: {
          _id: null,
          counts: {
            $push: {
              k: "$_id",
              v: "$count",
            },
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $arrayToObject: "$counts",
          },
        },
      },
    ];

    requestsdb.aggregate(pipeline, (error, data) => {
      if (error) throw new Error(error);
      data.forEach((d) => {
        let total = 0;
        const response = [];
        for (const [date, count] of Object.entries(d)) {
          response.push({ date, count: count + total });
          total += count;
        }
        return res.send(response);
      });
    });
    //console.log(response);
  } catch (e) {
    console.error(e.message);
    res.sendStatus(400);
  }
});

router.get("/dadjokes", async (req, res) => {
  try {
    // Get General Collection
    const dadjokesdb = database.db("discordBot").collection("dadjokes");
    const response = await dadjokesdb.countDocuments();
    console.log(response);
    res.json({ dadjokes: response });
  } catch (e) {
    res.sendStatus(400);
  }
});

/**
 * Convert number of seconds into 'dd hh mm ss'
 *
 * @param {number} seconds number of seconds since bot started
 * @returns formatted time since bot started
 */
function secondsToDhms(seconds) {
  seconds = Number(seconds);

  const result = [];
  // Longer than a Day
  if (seconds > 86400) {
    const d = Math.floor(seconds / (3600 * 24));
    result.push((d > 0 ? (d < 10 ? "0" + d : d) : "00") + "d");
  }
  // Longer than an hour
  if (seconds > 3600) {
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    result.push((h > 0 ? (h < 10 ? "0" + h : h) : "00") + "h");
  }
  // Longer than a minute
  if (seconds > 60) {
    const m = Math.floor((seconds % 3600) / 60);
    result.push((m > 0 ? (m < 10 ? "0" + m : m) : "00") + "m");
  }
  const s = Math.floor(seconds % 60);
  result.push((s > 0 ? (s < 10 ? "0" + s : s) : "00") + "s");

  return result.join(" ");
}

module.exports = router;
