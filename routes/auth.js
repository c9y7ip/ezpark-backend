const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const passport = require('passport')
const User = require('../models/user')
const authHelper = require('./auth-helper');

router.get('/', (req, res) => {
  res.send('Auth Route is working')
});


router.get('/users', authHelper.checkAuth, async (req, res) => {
  try{
    const users = await User.find()
    res.json(users)
  } catch (e) {
    res.status(500).json({'message': e.message});
  }
})

router.post('/register', authHelper.checkNotAuth, async (req, res) => {
  try {
    let userExists = await User.find({email: req.body.email});
    if(Array.isArray(userExists) && userExists.length){
      res.redirect('/login'); // TODO: notify user existence
    } else{
        const user = new User({
          name: req.body.name,
          password: await bcrypt.hash(req.body.password, 10),
          email: req.body.email,
          phone: req.body.phone,
          isAdmin: true
        });

        const newUser = await user.save();
        res.status(201).json(newUser)
      }
    } catch (error){
    console.log(error);
    res.redirect('/'); // Error Page
  }
})

router.post('/login', authHelper.checkNotAuth, passport.authenticate('local', {
  successRedirect: '/users', // TODO: change to homepage
  failureRedirect: '/login',
  failureFlash: true
}))


router.post('/logout', ((req, res) => {
  req.logOut();
  res.redirect('/login');
}))


module.exports = router;