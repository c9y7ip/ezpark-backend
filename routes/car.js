const express = require('express');
const router = express.Router();
const Car = require('../models/car');
const User = require('../models/user');
const jwtDecode = require('jwt-decode');

router.get('/', (req, res) => {
    res.send('car Route is working')
});


router.post('/add', async (req, res) => {
    try {
        const {_id} = jwtDecode(req.header('authorization'))['user'];
        const user = await User.findOne({_id: _id})
        if (user !== null || user !== 'undefined') {
            const car = await Car.findOne({createdBy: _id, license: req.body.license})
            if (car === null) {
                const newCar = await new Car({createdBy: _id, ...req.body}).save();
                console.log('New car saved')
                user.cars.push(newCar._id)
                user.save()
                res.json(req.body)
            } else {
                console.log("Car already exists")
                res.status(409).json(req.body)
            }
        }
    } catch (error) {
        console.log(error)
        res.status(400).send("A Server Error Has Occurred")
    }
})


router.post('/delete', async (req, res) => {
    try {
        const payload = jwtDecode(req.header('authorization'));
        const car = await Car.findOneAndDelete({license: req.body.license, createdBy: payload['user']['_id']})
        if (car === null) {
            res.status(404).json(req.body) // Could not find document
        } else {
            const user = await User.findOne({_id: car.createdBy})
            user.cars.splice(user.cars.indexOf(car._id), 1)
            user.save().then((r) => {
                res.json(car)
            })
        }
    } catch (error) {
        console.log(error)
        res.status(400).send("A Server Error Has Occurred")
    }
})


router.put('/edit', async (req, res) => {
    const payload = jwtDecode(req.header('authorization'));
    await Car.update({license: req.body.license, createdBy: payload['user']['_id']}, req.body).then((success) => {
        if (success.nModified === 0) {
            console.log("No documents modified")
            res.status(404).json(req.body) // No changes
        } else {
            res.json(req.body); // Document updated
        }
    }, (error) => {
        res.status(404).json(req.body); // Server error
    })
})


router.get('/get', async (req, res) => {
    const user = jwtDecode(req.header('authorization'))['user']['_id'];
    await Car.find({createdBy: user}).then((success) => {
        if (success){
            res.json(success);
        }
    }, (error) => {
        console.log(error)
        res.status(404).send()
    })
})

module.exports = router;