// import path from 'path';
// import dotenv from 'dotenv';
const mongoose = require('mongoose');
// dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import './envConfig';

mongoose.connect(process.env.MONGO_DATABASE_URL,
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
  () => console.log('application successfully connected to database...'));
