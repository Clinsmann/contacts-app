/*
START HERE
NOTE:
Don't forget to implement user authentication for the
contact resource
*/

// const path = require('path');
// import dotenv from 'dotenv';
import express from 'express';
import expressWinston from 'express-winston';

import winston from 'winston';
// import logger from './utils/logger';
import AuthRouter from './resources/auth'
import ContactRouter from './resources/contact'
/* require('./utils/db'); */

// let envPath = '../.env';
// if (process.env.NODE_ENV !== 'test') envPath = '../.env.test';
// dotenv.config({ path: path.resolve(__dirname, envPath) });

const app = express();

// console.log({ process: process.env.NODE_ENV })

app.use(express.json());
app.use('/auth', AuthRouter);
app.use('/contact', ContactRouter);

app.use(expressWinston.logger({
  transports: [new winston.transports.Console({ json: true, colorize: true })],
  meta: true, // optional: control whether you want to log the meta data about the request (default to true)
  msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
  expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
  colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
  ignoreRoute: function (req, res) { return false; } // optional: allows to skip some log messages based on request and/or response
}));

export default app;

// module.exports = app;





// /*
// START HERE
// NOTE:
// Don't forget to implement user authentication for the
// contact resource
// */

// const path = require('path');
// const dotenv = require('dotenv');
// const express = require('express');
// const expressWinston = require('express-winston');

// const winston = require('winston');
// // import logger from './utils/logger';
// const AuthRouter = require('./resources/auth')
// const ContactRouter = require('./resources/contact')
// /* require('./utils/db'); */

// let envPath = '../.env';
// if (process.env.NODE_ENV !== 'test') envPath = '../.env.test';
// dotenv.config({ path: path.resolve(__dirname, envPath) });

// const app = express();

// // console.log({ process: process.env.JWT_SECRET })

// app.use(express.json());
// app.use('/auth', AuthRouter);
// app.use('/contact', ContactRouter);

// app.use(expressWinston.logger({
//   transports: [new winston.transports.Console({ json: true, colorize: true })],
//   meta: true, // optional: control whether you want to log the meta data about the request (default to true)
//   msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
//   expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
//   colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
//   ignoreRoute: function (req, res) { return false; } // optional: allows to skip some log messages based on request and/or response
// }));

// // export default app;

// module.exports = app;