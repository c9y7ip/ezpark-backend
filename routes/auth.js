const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/users')

router.get('/', (req, res) => {
  res.send('Auth Route is working')
});


router.get('/users', async (req, res) => {
  try{
    const users = await User.find()
    res.json(users)
  } catch (e) {
    res.status(500).json({'message': e.message});
  }
})

router.post('/register', async (req, res) => {
  try {
    const user = new User({
      username:req.body.username,
      name: "test",
      lastName: "test",
      password: await bcrypt.hash(req.body.password, 10),
      email: "test",
      phone: "542523",
      isAdmin: true
    })
      const newUser = await user.save();
      res.status(201).json(newUser)
    } catch (error){
    console.log(error);
    res.redirect('/'); // Error Page
  }
})

router.post('/login', (req, res) => {
  let user = req.body.username;
})






module.exports = router;