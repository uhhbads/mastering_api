import express from 'express';
import User from '../models/User.js';
import authController from '../controller/authController.js';
import authMiddleware from '../jwt_middleware/authMiddleware.js';

var router = express.Router();

/* GET for DEFAULT */
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, '-password'); 

    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/* POST for REGISTER */
router.post('/register', authController.register);

/* POST for LOGIN */
router.post('/login', authController.login);

/* GET for USER */
router.get('/profile', authMiddleware, authController.profile);

/* DELETE for USER */
router.delete('/users/me', authMiddleware, authController.deleteUser);

/* GET for TRANSACTIONS */
router.get('/transactions', authMiddleware, authController.getTransactions);

/* POST for TRANSACTIONS */
router.post('/transactions', authMiddleware, authController.createTransaction);

/* PUT for TRANSACTION ITEMS */
router.put('/transactions/:id', authMiddleware, authController.updateTransaction);

/* DELETE for TRANSACTION ITEMS */
router.delete('/transactions/:id', authMiddleware, authController.deleteTransaction);

/* GET for BALANCE */
router.get('/balance', authMiddleware, authController.getBalance);

//module.exports = router;
export default router;