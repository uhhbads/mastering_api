import express from 'express';
import { getDb } from '../db/conn.mjs'; // import getDb from '../db/conn.mjs';

var router = express.Router();

/* GET for DEFAULT */
router.get('/', async function(req, res, next) {
  try{
    const db = getDb('sample_mflix');
    const collection = db.collection("comments");
    
    const results = await collection.find({})
      .limit(50)
      .toArray();

    res.send(results).status(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

/* POST for REGISTER */
router.post('/register', async (req, res) => {
  try {
    const db = getDb('users');
    const collection = db.collection("test");

    let newDocument = { ...req.body, date: new Date() };

    const result = await collection.insertOne(newDocument);

    newDocument._id = result.insertedId;

    res.status(201).json(newDocument); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to register' });
  }
});


/* POST for LOGIN */
router.post('/login', function(req, res, next) {
  res.send('POST for LOGIN');
});

/* DELETE for USER */
router.delete('/user/:id', async (req, res) => {
  try {
    const db = getDb('users');
    const collection = db.collection("test");

    const result = await collection.deleteOne({ username: req.params.id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: `${req.params.id} user deleted successfully` });
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