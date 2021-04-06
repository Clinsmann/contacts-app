require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/contacts_app',
	{ useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
	() => console.log('application successfully connected to database...'));
