const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('car Route is working')
});

module.exports = router;