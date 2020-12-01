const express = require('express');
const router = express.Router();
const jwtDecode = require('jwt-decode');

const Stripe = require('stripe');
const Parking = require('../models/parking');
const User = require('../models/user');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

router.get('/', (req, res) => {
  res.send('payment Route is working')
});

router.get('/price', async (req, res) => {
  const { duration, qrcode } = req.query

  try {
    const parking = await Parking.findById(qrcode)
    const cost = parking.rate * duration

    res.send(cost)
  } catch (err) {
    console.log(err)
    res.status(400).send('Failed to fetch price')
  }
})

router.post('/charge', async (req, res) => {
  const { totalCost } = req.body

  const userId = jwtDecode(req.header('authorization'))['user']['_id'];

  try {
    const user = await User.findById(userId)

    const charge = await stripe.charges.create({
      amount: totalCost * 100,  // stripe charge amount is in unit of cents
      currency: 'cad',
      customer: user.stripeId,
      description: `Parking paid for ${user.email}`,
    })

    res.send(charge)
  } catch (err) {
    console.log(err)
    res.status(400).send('Failed to process payment')
  }

})

router.post('/create-customer', async (req, res) => {
  const { token } = req.body
  const userId = jwtDecode(req.header('authorization'))['user']['_id'];

  if (!token) {
    return res.status(400).send('Payment token required');
  }
  try {
    const user = await User.findById(userId)
    const source = await stripe.sources.create({
      type: 'card',
      currency: 'cad',
      owner: {
        email: user.email    // to be replaced by real email
      },
      usage: 'reusable',
      token: token
    })
    const customer = await stripe.customers.create({
      email: user.email,
      source: source.id, // this is the payment source id generated from the token.
      metadata: { userId: user.id }
    })
    user.stripeId = customer.id
    user.save()

    res.send(user.id)
  } catch (err) {
    console.log(err)
    res.status(500).send('Failed to add credit card for customer')
  }
})


module.exports = router;