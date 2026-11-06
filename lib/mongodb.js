import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable buffering to fail fast if connection is down
      dbName: "bbtopup",
      // Connection pooling options to avoid Atlas connection spikes
      maxPoolSize: process.env.MONGODB_MAX_POOL_SIZE
        ? parseInt(process.env.MONGODB_MAX_POOL_SIZE, 10)
        : 10, // Maintain up to 10 socket connections per container/instance
      minPoolSize: 2, // Keep 2 connections warm for immediate queries
      serverSelectionTimeoutMS: 5000, // Fail fast after 5s instead of hanging for 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      maxIdleTimeMS: 30000, // Release idle sockets after 30s to stay under Atlas limits
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("✅ MongoDB Connected Successfully");
      return mongoose;
    }).catch((err) => {
      console.error("❌ MongoDB Connection Error:", err);
      cached.promise = null; // Reset promise so we can retry
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
