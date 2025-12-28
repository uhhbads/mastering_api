var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// POST
router.post('/', (req, res) => {
  /*
  res.status(201).json({
    message: "User created successfully",
    data: req.body
  });
  */

  console.log("BODY RECEIVED:", req.body);

  res.json({
    message: "Data successfully received",
    data: req.body
  });

});

// PUT
router.put('/:id', (req, res) => {
  res.json({
    message: "User updated",
    id: req.params.id,
    data: req.body
  });
});

// DELETE
router.delete('/:id', (req, res) => {
  res.json({
    message: "User deleted",
    id: req.params.id
  });
});

module.exports = router;
