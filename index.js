const express = require('express');
const app = express();

const cors = require('cors')
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer(); // for parsing multipart/form-data

// Dependencies
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');

app.use(cors());

// Middleware
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Add AMP Headers for API Requests
// https://stackoverflow.com/questions/50533654/configuring-amp-cors-with-express
const addAmpHeaders = (req, res) => {
  if (!req || !req.header || !req.header('origin')) {
    return;
  }
  
  let origin = req.header('origin').toLowerCase();
  res.set("Access-Control-Allow-Origin", origin);
  res.set("AMP-Access-Control-Allow-Source-Origin", origin);
  res.set("Access-Control-Expose-Headers", "AMP-Access-Control-Allow-Source-Origin");
  res.set("Access-Control-Allow-Credentials", true);
}

// Serve static files from public
let staticRequest = undefined;
app.use((req, res, next) => {
    staticRequest = req;
    next();
  }, express.static('public', {
  setHeaders: function (res, path, stat) {
    addAmpHeaders(staticRequest, res);
  }
}));

const port = 8000;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
