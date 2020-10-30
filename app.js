const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// connect mongoDB
mongoose.connect(
  'mongodb://localhost:27017',
  { useNewUrlParser: true, useUnifiedTopology: true }
);

/**
 * middleware
 * note: middleware is running in sequence, from top to bottom
 */
app.use(bodyParser.json()); // parse client request data to json format
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// import routers
const auth = require('./routes/auth');
const car = require('./routes/car');
const parking = require('./routes/parking');
const payment = require('./routes/payment');


// apply router middleware
app.use('/auth', auth);
app.use('/car', car);
app.use('/parking', parking);
app.use('/payment', payment);


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