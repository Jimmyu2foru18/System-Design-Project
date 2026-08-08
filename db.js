const mongoose = require('mongoose');
let dbConnected = false;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    dbConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    console.log('Continuing without database for static file serving...');
    dbConnected = false;
  }
};

const isDbConnected = () => dbConnected;

module.exports = { connectDB, isDbConnected };
