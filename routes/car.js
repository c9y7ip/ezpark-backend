const express = require('express');
const router = express.Router();
const Car = require('../models/car');
const User = require('../models/user');
const jwtDecode = require('jwt-decode');

router.get('/', (req, res) => {
    res.send('car Route is working')
});


router.post('/add', async (req, res) => {
    const {_id} = jwtDecode(req.header('authorization'))['user'];

    await User.findOne({_id: _id}).then(async (user) => {
        if(user !== null || user !== 'undefined'){
            await Car.findOne({createdBy: _id, license: req.body.license}).then(async (car) => {
                if (car === null){
                    const newCar = new Car(Object.assign({createdBy: _id}, req.body))
                    await newCar.save().then((car) => {
                        console.log('New car saved')
                        user.cars.push(car._id)
                        user.save()
                        res.json(req.body)
                    })
                } else {
                    console.log("Car already exists")
                    res.status(409).json(req.body)
                }
            })
        }
    })
})


router.post('/delete', async (req, res) => {
    const payload = jwtDecode(req.header('authorization'));
    await Car.findOneAndDelete({license: req.body.license, createdBy: payload['user']['_id']}).then(async (car) => {
        if (car === null) {
            res.status(404).json(req.body) // Could not find document
        } else {
            await User.findOne({_id: car.createdBy}).then((user) => {
                user.cars.splice(user.cars.indexOf(car._id), 1)
                user.save().then((r) => {
                    res.json(car)
                })
            })
        }
    }, (error) => {
        res.status(404).json(req.body);
    })
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


router.post('/find', async (req, res) => {
    const payload = jwtDecode(req.header('authorization'));
    await User.findById(payload['user']['_id']).then(async (success) => {
        if (success.isAdmin === true) {
            await Car.findOne({license: req.body.license}).then((success) => {
                console.log(success)
                if (success !== null) {
                    res.status(200).json(success) // Car found with license
                } else {
                    res.status(204).send() // No car found with matching license
                }
            })
        } else {
            res.status(403).json(req.body) // User is not an admin
        }
    }, (error) => {
        res.status(404).json(req.body) // Server error
    })
})

module.exports = router;