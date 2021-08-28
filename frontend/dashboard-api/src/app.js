// Install Express
const express = require("express");
const app = express();

// Ability to parse cookies
const cookieParser = require("cookie-parser");

// Compression reduces file sizes of transactions making them faster
const compression = require("compression");

const path = require("path");

app.use("/", express.static(path.join(__dirname, "../build")));

// Middleware
app.use(compression());
app.use(cookieParser());
app.use(express.json());

// Endpoints
app.use("/api/analytics", require("./api/analytics"));

module.exports = app;
