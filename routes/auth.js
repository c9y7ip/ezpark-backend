const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const passport = require('passport')
const User = require('../models/user')
const jwt = require('jsonwebtoken');

router.get('/', (req, res) => {
  res.send('Auth Route is working')
});


router.get('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const users = await User.find()
    res.json(users)
  } catch (e) {
    res.status(500).json({ 'message': e.message });
  }
})

router.post('/register', async (req, res) => {
  try {
    let userExists = await User.find({ email: req.body.email });
    if (Array.isArray(userExists) && userExists.length) {
      res.redirect('/login'); // TODO: notify user existence
    } else {
      const user = new User({
        name: req.body.name,
        password: await bcrypt.hash(req.body.password, 10),
        email: req.body.email,
        phone: req.body.phone,
        isAdmin: JSON.parse(req.body.isAdmin) // Convert admin to boolean
      });

      const newUser = await user.save();
      res.status(201).json(newUser)
    }
  } catch (error) {
    console.log(error);
    res.redirect('/'); // Error Page
  }
})

router.post('/login',
  async (req, res, next) => {
    passport.authenticate(
      'local',
      async (err, user, info) => {
        try {
          if (err || !user) {
            res.redirect('/login');
            return next(err);
          }

          req.login(
            user,
            { session: false },
            async (error) => {
              if (error) return next(error);
              const body = { _id: user._id, email: user.email };
              const token = jwt.sign({ user: body }, process.env.SECRET || 'secretKey');
              console.log(token)

              const name = user.name

              res.json({ token: `Bearer ${token}`, name: name });
            }
          );
        } catch (error) {
          return next(error);
        }
      }
    )(req, res, next);
  }
);


router.post('/logout', ((req, res) => {
  res.cookie('jwt', { expires: Date.now() });
  res.redirect('/login');
}))


module.exports = router;