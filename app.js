const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const User = require('./models/users');
const authHelper = require('./routes/auth-helper');

// connect mongoDB
mongoose.connect(
    'mongodb://localhost:27017',
    { useNewUrlParser: true, useUnifiedTopology: true }
);

// Passport Authentication
const initializePassport = require('./passport-config');

initializePassport(
    passport,
    async email => {return User.findOne({email: email})},
    async id => {return User.findById(id)});


/**
 * middleware
 * note: middleware is running in sequence, from top to bottom
 */
app.use(bodyParser.json()); // parse client request data to json format
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(flash());
app.use(session({secret: 'secret', resave:false, saveUninitialized: false})); // TODO: Need to randomly generate secret on sever
app.use(passport.initialize());
app.use(passport.session());

// import routers
const auth = require('./routes/auth');
const car = require('./routes/car');
const parking = require('./routes/parking');
const payment = require('./routes/payment');


// apply router middleware
app.use('/auth', auth);
app.use('/car', authHelper.checkAuth, car);
app.use('/parking', authHelper.checkAuth, parking);
app.use('/payment', authHelper.checkAuth, payment);


/**
 * Get port from environment and store in Express.
 */
const PORT = process.env.PORT || 5000;

/**
 * Listen on provided PORT, on all network interfaces.
 */
app.listen(PORT, ()=>{
  console.log(`Server running on http://localhost:${PORT}`)
});