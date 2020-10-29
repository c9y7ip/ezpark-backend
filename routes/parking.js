const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('parking Route is working')
});

module.exports = router;