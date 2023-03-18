const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const { session } = require("./middleware/session");
const { logging } = require("./middleware/logging");
const {
  searchMovie,
  poster,
  letterboxdWatchlist,
  alternativeSearch,
  proxy,
} = require("./controllers");
const { isHealthy } = require("./helpers/redis");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public")); // serve static files

// anonymous session
app.use(session);

// logging
app.use(logging);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.get("/healthcheck", (req, res) => {
  res.status(200).send("OK");
});

// redis healthcheck endpoint
app.get("/redis-healthcheck", async (req, res) => {
  if (await isHealthy()) {
    res.status(200).send("OK");
  } else {
    res.status(500).send("Redis is not healthy");
  }
});

app.post("/api/search-movie", async (req, res) => {
  return searchMovie(req, res);
});

app.post("/api/poster", async (req, res) => {
  return poster(req, res);
});

app.post("/api/letterboxd-watchlist", async (req, res) => {
  return letterboxdWatchlist(req, res);
});

app.post("/api/alternative-search", async (req, res) => {
  return alternativeSearch(req, res);
});

app.all("/proxy/:url(*)", async (req, res) => {
  return proxy(req, res);
});

app.listen(port, () =>
  console.log(`app listening on port http://localhost:${port}`)
);
