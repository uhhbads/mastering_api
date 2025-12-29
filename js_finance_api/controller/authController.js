import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { hashPassword, comparePasswords } from '../jwt_services/hashService.js';
import { generateToken } from '../jwt_services/jwtService.js';

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
        if (!user) {
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

    await Transaction.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete account' });
  }
};

/* GET /transactions */
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id })
        .populate('userId', 'username')
        .sort({ date: -1 });

    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

/* POST /transactions */
export const createTransaction = async (req, res) => {
  try {
    const { type, amount, description } = req.body;

    const transaction = await Transaction.create({
      userId: req.user.id,
      type,
      amount,
      description
    });

    const populated = await Transaction.findById(transaction._id)
      .populate('userId', 'username');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create transaction' });
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
    const deleted = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!deleted) return res.status(404).json({ error: 'Transaction not found' });
    res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};

/* GET /balance */
export const getBalance = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id });

    const balance = transactions.reduce((total, t) => {
      return t.type === 'income' ? total + t.amount : total - t.amount;
    }, 0);

    res.status(200).json({ balance });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate balance' });
  }
};

export default {
    register,
    login,
    profile,
    deleteUser,
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getBalance
};