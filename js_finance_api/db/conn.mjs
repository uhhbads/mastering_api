import dotenv from "dotenv";
dotenv.config();

import { MongoClient } from "mongodb";

const connectionString = process.env.CONNECTION_STRING;

if (!connectionString) {
  console.error("❌ CONNECTION_STRING is undefined. Check your .env file.");
  process.exit(1);
}

const client = new MongoClient(connectionString);


let conn;
try {
  conn = await client.connect();
  console.log("✅ MongoDB connected");
} catch (err) {
  console.error("❌ MongoDB connection failed", err);
  process.exit(1);
}

export function getDb(dbName) {
  return client.db(dbName);
}

export default client;