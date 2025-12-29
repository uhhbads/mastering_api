import express from 'express';
import User from '../models/User.js';
import authController from '../controller/authController.js';
import authMiddleware from '../jwt_middleware/authMiddleware.js';

var router = express.Router();

/* GET for DEFAULT */
router.get('/', async (req, res) => {
  try {
    const results = await User.find({});

    res.send(results).status(200);
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
router.delete('/user/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ message: `${deletedUser.username} deleted successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

/* GET for TRANSACTIONS */
router.get('/transactions', function(req, res, next) {
  res.send('GET for TRANSACTIONS');
});

/* POST for TRANSACTIONS */
router.post('/transactions', function(req, res, next) {
  res.send('POST for TRANSACTIONS');
});

/* PUT for TRANSACTION ITEMS */
router.put('/transactions/:id', function(req, res, next) {
  res.send('PUT for TRANSACTION ITEMS');
});

/* DELETE for TRANSACTION ITEMS */
router.delete('/transactions/:id', function(req, res, next) {
  res.send('DELETE for TRANSACTION ITEMS');
});

/* GET for BALANCE */
router.get('/balance', function(req, res, next) {
  res.send('GET for BALANCE');
});

//module.exports = router;
export default router;