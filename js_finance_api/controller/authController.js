import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { hashPassword, comparePasswords } from '../jwt_services/hashService.js';
import { generateToken } from '../jwt_services/jwtService.js';
import mongoose from '../db/conn.mjs';

export const register = async (req, res) => {
    try{
        const { username, password } = req.body;

        //check if user alr exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return  res.status(400).json({ error: 'Username already taken' });
        };

        //hash password using hashService
        const hashedPassword = await hashPassword(password);

        //save user to db
        const user = new User({ username, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: `${username} registered successfully` });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to register' });
    }

};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        //find user by username
        const user = await User.findOne({ username });
        if (!user || user.isDeleted) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        //password comparison from db (user.password) and input password (password)
        const isMatch = await comparePasswords(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        //generate JWT token
        const token = generateToken({id: user._id, username: user.username});

        res.status(200).json({ message: "Login successful", token: token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to login' });
    }
};

export const profile = async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await Transaction
      .find({ userId })
      .sort({ date: -1 });

    const balance = transactions.reduce((total, tx) => {
      return tx.type === 'income'
        ? total + tx.amount
        : total - tx.amount;
    }, 0);

    res.status(200).json({
      message: "User profile accessed",
      user: req.user,
      balance,
      transactions
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load profile' });
  }
};

/* DELETE /users/me */
export const deleteUser = async (req, res) => {
  try {
    const userId = req.user.id;

    // Mark user as deleted
    const user = await User.findByIdAndUpdate(
      userId,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: 'User not found' });

    await Transaction.updateMany(
      { userId },
      { isDeleted: true, deletedAt: new Date() }
    );

    res.status(200).json({ message: 'Account marked as deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};

/* GET /transactions */
export const getTransactions = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find({ userId: req.user.id, isDeleted: false })
        .populate("userId", "username")
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),

      Transaction.countDocuments({ userId: req.user.id, isDeleted: false })
    ]);

    res.status(200).json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: skip + transactions.length < total,
      data: transactions
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};


/* GET /transactions/:id */
export const getTransactionId = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
        .populate('userId', 'username')
        .sort({ date: -1 });

    res.status(200).json(transaction);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
};

/* POST /transactions */
export const createTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const type = req.body.type;
    const amount = Number(req.body.amount);
    const description = req.body.description;

    if (!["income", "expense"].includes(type))
      return res.status(400).json({ error: "Invalid type" });

    if (isNaN(amount) || amount <= 0)
      return res.status(400).json({ error: "Invalid amount" });

    const userId = req.user.id;

    const user = await User.findById(userId).session(session);

    if (!user) throw new Error("User not found");

    if (type === "expense" && user.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    const delta = type === "income" ? amount : -amount;

    // Update user balance
    user.balance += delta;
    await user.save({ session });

    const transaction = new Transaction({
      userId,
      type,
      amount,
      description
    });

    await transaction.save({ session });

    await session.commitTransaction();
    res.status(201).json({ transaction, balance: user.balance });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ error: "Transaction failed" });
  } finally {
    session.endSession();
  }
};

/* PUT /transactions/:id */
export const updateTransaction = async (req, res) => {
  try {
    const updated = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: {_id: req.user.id, username: req.user.username} },
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Transaction not found' });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};

/* DELETE /transactions/:id */
export const deleteTransaction = async (req, res) => {
  try {
    const deleted = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!deleted) return res.status(404).json({ error: 'Transaction not found' });

    res.status(200).json({ message: 'Transaction marked as deleted', transaction: deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};

/* GET /balance */
export const getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("balance isDeleted");

    if (!user || user.isDeleted)
      return res.status(404).json({ error: "User not found" });

    res.status(200).json({ balance: user.balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get balance" });
  }
};



export default {
    register,
    login,
    profile,
    deleteUser,
    getTransactions,
    getTransactionId,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getBalance
};