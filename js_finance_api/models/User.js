// models/User.js
import mongoose from '../db/conn.mjs';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },

  // Soft delete fields
  isDeleted: { type: Boolean, default: false }, // user marked as deleted
  deletedAt: { type: Date }                    // timestamp of deletion
});

// Optional: add a query helper to automatically exclude deleted users
userSchema.query.active = function() {
  return this.where({ isDeleted: false });
};

const User = mongoose.model('User', userSchema);

export default User;
