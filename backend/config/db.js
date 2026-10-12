const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  try {
    // If a remote MongoDB Atlas or non-local URI is provided, use it directly
    const isLocal = !uri || uri.includes('127.0.0.1') || uri.includes('localhost');
    
    if (!isLocal) {
      const conn = await mongoose.connect(uri);
      console.log(`[MongoDB] Connected to Remote MongoDB Atlas: ${conn.connection.host}`);
      return conn;
    }

    // Attempt local mongod first with a quick 1.5s timeout
    try {
      const conn = await mongoose.connect(uri || 'mongodb://127.0.0.1:27017/workzo', {
        serverSelectionTimeoutMS: 1500,
      });
      console.log(`[MongoDB] Connected to local MongoDB instance: ${conn.connection.host}`);
      return conn;
    } catch (localErr) {
      console.log('[MongoDB] Local MongoDB daemon not active. Initializing built-in MongoMemoryServer...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create({
        instance: {
          dbName: 'workzo',
        },
      });
      const memoryUri = mongodInstance.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[MongoDB] MongoMemoryServer successfully initialized at: ${memoryUri}`);
      return conn;
    }
  } catch (error) {
    console.error(`[MongoDB Error] ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
  } catch (err) {
    console.error('Error during DB disconnect:', err);
  }
};

module.exports = { connectDB, disconnectDB };
