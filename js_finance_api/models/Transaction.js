// models/Transaction.js
import mongoose from '../db/conn.mjs';

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  amount: { type: Number, required: true },
  description: String,
  date: { type: Date, default: Date.now }
});

export default mongoose.model('Transaction', transactionSchema);
