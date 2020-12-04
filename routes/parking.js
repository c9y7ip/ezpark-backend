const express = require('express');
const Parking = require('../models/parking');
const Session = require('../models/session');
const jwtDecode = require('jwt-decode');
const router = express.Router();
const QRCode = require('qrcode');
var mongoose = require('mongoose');
var Types = mongoose.Types,
  ObjectId = Types.ObjectId;
// const io = require('socket.io').listen(app)

// Cached Data
var cachedParkingLots = {}

onInit();

function onInit() {
  createCache();
}

function createCache() {
  Parking.find({}, async (err, parkingLots) => {

    // Map session id to session object for each parking lot object.
    await Promise.all(parkingLots.map(async parkingLot => {
      parkingLot.sessions = await Promise.all(parkingLot.sessions.map(async sessionId => {
        await Session.findById(sessionId).exec();
      }))
      return parkingLot
    }))

    cachedParkingLots = parkingLots.reduce((parkingMap, item) => {
      // Parking lots get aggregated into a map with key: _id, value: parkingLot.
      parkingMap[item.id] = item
      return parkingMap
    }, {})
    // console.log(cachedParkingLots)
    console.log("Parking Lot Data Cached")
  })
}

function deleteFromCache(parkingLotId) {
  delete cachedParkingLots[parkingLotId];
  console.log("cached updated: ")
}

function addToCache(parkingLot) {
  console.log(`currently cached is ${cachedParkingLots._id}`)
  console.log(parkingLot)
  cachedParkingLots[parkingLot._id] = parkingLot;
  console.log("cached updated: ")
  console.log(cachedParkingLots[parkingLot._id])
}

// update parking cache to include new session object
function updateSessionInCache() {
  //TODO: complete when sessions endpoint is added if we want to view sessions from the admin side
}

router.get('/', (req, res) => {
  res.send('parking Route is working')
});

router.post('/create-parking', async (req, res) => {
  const { name, number, rate, address } = req.body

  if (!name || !number || !rate || !address) {
    return res.status(400).send('Missing parameter')
  }

  const { _id } = jwtDecode(req.header('authorization'))['user'];

  const parking = new Parking({
    name: name,
    number: number,
    rate: rate,
    address: address,
    createdBy: _id
  })
  QRCode.toDataURL(parking.id, { width: 300 }, function (err, url) {
    if (err) {
      return res.status(500).send("failed to create qrcode");
    }
    // If qrcode generated successfully, we save the document for the space.
    parking.qrCodeUrl = url;
    parking.save()
      .then(parking => {
        addToCache(parking.toObject())
        res.send(parking.toObject())
      })
      .catch(err => res.status(400).send(`create parking failed ${err}`))
  })
})

router.get('/all', async (req, res) => {
  res.send(cachedParkingLots);
})

router.get('/:parkingId', async (req, res) => {
  Parking.findById(req.params.parkingId)
    .select('rate name number address')
    .then(parking => res.send(parking))
    .catch(err => res.status(400).send(`parking lot not available ${err}`))
})

router.delete('/:parkingId', async (req, res) => {
  Parking.findByIdAndDelete(req.params.parkingId).exec()
    .then(parking => deleteFromCache(req.params.parkingId))
    .catch(err => res.status(400).send(`delete parking failed ${err}`))
})

router.put('/:parkingId', async (req, res) => {
  const { name, number, rate, address } = req.body

  if (!name || !number || !rate || !address) {
    return res.status(400).send('Missing parameter')
  }

  const parkingLot = { name, number, rate, address }

  console.log(`updating with ${name} ${number} ${rate}`)

  console.log(parkingLot)

  // NOTE: if you dont pass new:true, it will return the unaltered document in the callback function
  Parking.findOneAndUpdate({ "_id": ObjectId(req.params.parkingId) }, parkingLot, { new: true }, function (err, savedParkingLot) {
    if (err) {
      return res.status(400).send(`failed to update parking lot: ${err}`);
    }

    // replace cached parking lot with the same id
    deleteFromCache(req.params.parkingId)
    addToCache(savedParkingLot.toObject())
    res.sendStatus(200)
  })

})

module.exports = router;