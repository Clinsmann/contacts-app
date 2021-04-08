import mongoose from 'mongoose';

mongoose.connect(process.env.MONGO_DATABASE_URL, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
}, () => console.log('application successfully connected to database...'));
