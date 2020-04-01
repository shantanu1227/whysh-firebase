const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors())
   .options('*', cors())
   .use(bodyParser.json())
   .use(bodyParser.urlencoded({extended: false}))
   .use("/v1", require('./routes/v1'))
   .get('*', (_, res) => res.status(404)
                              .json({success: false, data: "Endpoint not found."}));

module.exports = app;