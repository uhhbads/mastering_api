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
router.post('/register', function(req, res, next) {
  res.send('POST for REGISTER');
});

/* POST for LOGIN */
router.post('/login', function(req, res, next) {
  res.send('POST for LOGIN');
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