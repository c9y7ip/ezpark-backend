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
        await Session.findById({ sessionId }).exec();
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
  console.log(cachedParkingLots)
}

function addToCache(parkingLot) {
  cachedParkingLots[parkingLot._id] = parkingLot;
  console.log("cached updated: ")
  console.log(cachedParkingLots)
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

  const {_id} = jwtDecode(req.header('authorization'))['user'];

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
        res.sendStatus(200)
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

  if (!name || !number || !rate || !address ) {
    return res.status(400).send('Missing parameter')
  }

  const parkingLot = { name, number, rate, address }

  console.log(parkingLot)
  Parking.findOneAndUpdate({ "_id": ObjectId(req.params.parkingId) }, parkingLot, function (err, parkingLot) {
    if (err) {
      return res.status(400).send(`failed to update parking lot: ${err}`);
    }

    // replace cached parking lot with the same id
    addToCache(parkingLot.toObject())
    res.sendStatus(200)
  })

})

router.get('/allLots', async (req, res) => {
  try {
    const parkinglots = await Parking.find()
    res.json(parkinglots)
  } catch (e) {
    res.status(500).json({ 'message': e.message });
  }
})

router.post('/getOneLot', async (req, res) => {
  try {
    const lot = await Parking.find({ number: req.body.number })
    console.log(lot)
    res.json(lot)
  } catch (e) {
    res.status(500).json({ 'message': e.message });
  }
})



module.exports = router;