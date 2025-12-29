import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

const connectionString = process.env.CONNECTION_STRING;

if (!connectionString) {
  console.error("❌ CONNECTION_STRING is undefined. Check your .env file.");
  process.exit(1);
}

try {
  await mongoose.connect(connectionString);
  console.log("✅ MongoDB connected via Mongoose");
} catch (err) {
  console.error("❌ MongoDB connection failed", err);
  process.exit(1);
}

export default mongoose;