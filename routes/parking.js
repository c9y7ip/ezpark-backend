const express = require('express');
const Parking = require('../models/parking');
const router = express.Router();
const QRCode = require('qrcode')

router.get('/', (req, res) => {
  res.send('parking Route is working')
});

router.post('/create-parking', async (req, res) => {
  const { name, number, rate, address } = req.body

  if (!name || !number || !rate || !address) {
    return res.status(400).send('Missing parameter')
  }

  try {
    const parking = new Parking({
      name: name,
      number: number,
      rate: rate,
      address: address
    })
    QRCode.toDataURL(parking.id, { width: 300 }, function (err, url) {
      if (err) {
        return res.status(500).send("failed to create qrcode");
      }
      // If qrcode generated successfully, we save the document for the space.
      // console.log(url);
      parking.qrCodeUrl = url;
    })
    parking.save()
  } catch (err) {
    console.log(err)
    res.status(400).send(`create parking failed ${err}`)
  }
})

router.get('/all', async (req, res) => {
  Parking.find({}, (err, parkingLots) =>
    res.send(parkingLots.reduce((parkingMap, item) => {
      parkingMap[item.id] = item
      return parkingMap
    }, {}))
  )
})


router.get('/:parkingId', async (req, res) => {

})

router.delete('/:parkingId', async (req, res) => {

})

router.put('/:parkingId', async (req, res) => {

})

module.exports = router;