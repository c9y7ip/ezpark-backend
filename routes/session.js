const express = require('express');
const router = express.Router();
const jwtDecode = require('jwt-decode');
const Session = require('../models/session');
const moment = require('moment');
const Car = require('../models/car');
const Parking = require('../models/parking');
const User = require('../models/user');

router.post('/create', async (req, res) => {
    const { payload } = req.body

    const { carId, duration, parkingId, totalCost } = payload
    const userId = jwtDecode(req.header('authorization'))['user']['_id'];

    try {
        const user = await User.findById(userId)
        const car = await Car.findById(carId)
        const parking = await Parking.findById(parkingId)

        const newSession = new Session({
            date: new Date(),
            startTime: new Date(),
            endTime: moment().add(duration, 'hour'),
            duration: duration,     // unit: hours
            cost: totalCost,
            license: car.license,
            user: userId,
            car: carId,
            parking: parkingId
        })
        newSession.save()
        console.log(newSession)
        // add session id to car and parking
        car.sessions.push(newSession.id)
        car.save()
        user.sessions.push(newSession.id)
        user.save()
        parking.sessions.push(newSession.id)
        parking.save()

        res.send('Session Created')
    } catch (err) {
        console.log()
        res.status(400).send(`session create failed ${err}`)
    }
})


router.get('/sessionbylicense/:license', async (req, res) => {
    const license = req.params.license

    // find session for this license that ends after the current time (has not yet expired)
    Session.findOne({ license: license, endTime: { $gte: new Date() } })
        .then(session => {
            if (session) {
                res.send({ isExpired: false, session })
            } else {
                // If we didn't find a valid session, try and find an expired one
                // Warning: this may return null for session object, so check it in 
                // client-side
                Session.find({ license }).sort({ "endTime": -1 }).limit(1).then(
                    expiredSession => res.send({ isExpired: true, session: expiredSession[0] })
                )
            }

        })
        .catch(err => res.status(400).send(`session not found for license ${license}: ${err}`))
})

module.exports = router