const express = require('express');
const router = express.Router();
const Car = require('../models/car');
const User = require('../models/user');
const jwtDecode = require('jwt-decode');

router.get('/', (req, res) => {
    res.send('car Route is working')
});


router.post('/add', async (req, res) => {
    const payload = jwtDecode(req.header('authorization'));
    const update = {$setOnInsert: Object.assign({createdBy: payload['user']['_id']}, req.body)}
    await Car.findOneAndUpdate({createdBy: payload['user']['_id'], license: req.body.license}, update,
        {upsert: true, new: true, runValidators: true, rawResult: true}).then(
        (result) => {
            if (result.lastErrorObject.updatedExisting) {
                console.log("Car already exists")
                res.status(409).json(req.body)
            } else {
                console.log("Successfully added a new car")
                res.status(200).json(req.body)
            }
        }, (error) => {
            res.status(400)
        })
})


router.delete('/delete', async (req, res) => {
    const payload = jwtDecode(req.header('authorization'));
    await Car.findOneAndDelete({license: req.body.license, createdBy: payload['user']['_id']}).then((success) => {
        if (success === null) {
            res.status(404).json(req.body) // Could not find document
        } else {
            res.json(success)
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
        console.log(success)
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