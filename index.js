const express = require("express");
const app = express();

const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const upload = multer(); // for parsing multipart/form-data

// Dependencies
const fetch = require("node-fetch");
const { URLSearchParams } = require("url");

// HTML Parser
const cheerio = require("cheerio");

app.use(cors());

// Middleware
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Add AMP Headers for API Requests
// https://stackoverflow.com/questions/50533654/configuring-amp-cors-with-express
const addAmpHeaders = (req, res) => {
  if (!req || !req.header || !req.header("origin")) {
    return;
  }

  let origin = req.header("origin").toLowerCase();
  res.set("Access-Control-Allow-Origin", origin);
  res.set("AMP-Access-Control-Allow-Source-Origin", origin);
  res.set(
    "Access-Control-Expose-Headers",
    "AMP-Access-Control-Allow-Source-Origin"
  );
  res.set("Access-Control-Allow-Credentials", true);
};

// Serve static files from public
let staticRequest = undefined;
app.use(
  (req, res, next) => {
    staticRequest = req;
    next();
  },
  express.static("public", {
    setHeaders: function(res, path, stat) {
      addAmpHeaders(staticRequest, res);
    }
  })
);

// Serve amp page with the benchmarking script injected
app.get("/benchmark", (req, res) => {
  const asyncTask = async () => {
    // Get the url for the query parameter
    const pageUrl = req.query.page;

    if (!pageUrl) {
      res.status(400).send("No Page in query!");
      return;
    }

    const response = await fetch(pageUrl).then(res => res.text());

    // Inject our script into the bottom of the body
    const $ = cheerio.load(response);
    $("body").append('<script>console.log("Benchmark Injected!")</script>');

    const injectedPage = $.html();

    res.status(200).send(injectedPage);
  };
  asyncTask();
});

const port = 8000;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
