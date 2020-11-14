const express = require('express');
const Parking = require('../models/parking');
const Session = require('../models/session');
const router = express.Router();
const QRCode = require('qrcode');
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
    console.log(cachedParkingLots)
    console.log("Parking Lot Data Cached")
  })
}

function deletefromCache(parkingLotId) {
  delete cachedParkingLots[parkingLotId];
}

function addToCache(parkingLot) {
  cachedParkingLots[parkingLot.id] = parkingLot;
}

// update parking cache to include new session object
function updateSessionInCache() {

}

router.get('/', (req, res) => {
  res.send('parking Route is working')
});

router.post('/create-parking', async (req, res) => {
  const { name, number, rate, address } = req.body

  if (!name || !number || !rate || !address) {
    return res.status(400).send('Missing parameter')
  }

  const parking = new Parking({
    name: name,
    number: number,
    rate: rate,
    address: address,

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
        res.send(200)
      })
      .catch(err => res.status(400).send(`create parking failed ${err}`))
  })
})

router.get('/all', async (req, res) => {
  res.send(cachedParkingLots);
})

// router.put('/session', async (req, res) => {

//   // emits map with key: parking-id, value: session object
//   io.sockets.emit("session-map", sessionMap)
// })

// io.on("connection", socket => {
//   console.log("New client connected: " + socket.id);
// })

router.delete('/:parkingId', async (req, res) => {
  Parking.findByIdAndDelete(req.params.parkingId).exec()
    .then(parking => this.deletefromCache(req.params.parkingId))
    .catch(err => res.status(400).send(`delete parking failed ${err}`))
})

router.put('/:parkingId', async (req, res) => {
  const { name, number, rate, address, sessions } = req.body

  if (!name || !number || !rate || !address || !sessions) {
    return res.status(400).send('Missing parameter')
  }

  const parkingLot = { name, number, rate, address, sessions }

  Parking.findOneAndReplace({ _id: req.params.parkingId }, parkingLot, function (err, parkingLot) {
    if (err) {
      return res.status(400).send(`failed to update parking lot: ${err}`);
    }

    // replace cached parking lot with the same id
    addToCache(parkingLot.toObject())
    res.send(200)
  })

})

module.exports = router;