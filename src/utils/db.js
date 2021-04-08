import mongoose from 'mongoose';

mongoose.connect(process.env.MONGO_DATABASE_URL,
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
  () => console.log('application successfully connected to database...'));
