const express = require('express');
const router = express.Router();
const Car = require('../models/car');
const jwtDecode = require('jwt-decode');

router.get('/', (req, res) => {
  res.send('car Route is working')
});


router.post('/add', async (req, res) => {
  const payload = jwtDecode(req.header('authorization'));
  await Car.create(Object.assign({createdBy: payload['user']['_id']}, req.body)).then((success) => {
    res.json(req.body);
  }, (error) => {
    res.status(400)
  })
})

router.delete('/delete', async (req, res) => {
  const payload = jwtDecode(req.header('authorization'));
  await Car.delete({license: req.body.license, createdBy: payload['user']['_id']}).then((success) => {
    res.json(req.body)
  }, (error) => {
    res.status(409).json(req.body);
  })
})

router.put('/edit', async (req, res) => {
  const payload = jwtDecode(req.header('authorization'));
  await Car.update({license: req.body.license, createdBy: payload['user']['_id']}, req.body).then((success) => {
    console.log(success)
    res.json(req.body);
  }, (error) => {
    res.status(409).json(req.body);
  })
})


module.exports = router;