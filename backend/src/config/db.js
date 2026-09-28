const mongoose = require('mongoose');
const config = require('./index');

async function connectDb() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongoUri);
  console.log('MongoDB connected');
}

module.exports = { connectDb };
