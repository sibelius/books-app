import mongoose from 'mongoose';

export default async function connect(url: string) {
  await mongoose.connect(url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });
  const client = require('mongoose').connection;
  const { db } = client;
  return db;
}
