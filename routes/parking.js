const express = require('express');
const Parking = require('../models/parking');
const Session = require('../models/session');
const router = express.Router();
const QRCode = require('qrcode');
const SessionStrategy = require('passport/lib/strategies/session');
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

function deletefromCache() {

}

function addToCache() {

}

// update parking cache to include new session object
function updateCache() {

}

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
      address: address,

    })
    QRCode.toDataURL(parking.id, { width: 300 }, function (err, url) {
      if (err) {
        return res.status(500).send("failed to create qrcode");
      }
      // If qrcode generated successfully, we save the document for the space.
      parking.qrCodeUrl = url;
      parking.save()
        .then(parking => res.send(200))
        .catch(err => res.status(400).send(`create parking failed ${err}`))
    })
  } catch (err) {
    console.log(err)
    res.status(400).send(`create parking failed ${err}`)
  }
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

})

router.put('/:parkingId', async (req, res) => {

})

module.exports = router;