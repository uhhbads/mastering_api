// models/User.js
import mongoose from '../db/conn.mjs';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema); // 'User' → collection 'users' in MongoDB

export default User;
