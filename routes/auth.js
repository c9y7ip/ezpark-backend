const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Auth Route is working')
});

let users = []; // TODO: Connect to mongodb
router.get('/users', (req, res) => {
  res.json(users);
})

router.post('/register', async (req, res) => {
  try {
    let pass = await bcrypt.hash(req.body.password, 10); // TODO: Generate user session
    let user = req.body.username;
    users.push({username: user, password: pass})
    console.log(user, pass);
    res.redirect('/users'); // Admin control panel
  } catch (error){
    console.log(error);
    res.redirect('/'); // Error Page
  }
})

router.post('/login', (req, res) => {
  let user = req.body.username;
})






module.exports = router;