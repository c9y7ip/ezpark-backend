const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ParkingSchema = new Schema({
    number: { type: String, required: true, unique: true },   // parking lot number
    name: { type: String, required: true },     // parking lot name
    createdBy: { type: Schema.Types.ObjectId, ref: 'Users' },
    address: {
        street: { type: String },
        city: { type: String },
        province: { type: String },
        country: { type: String },
        postalCode: { type: String }
    },
    rate: { type: Number, required: true }, // unit $cad per hr
    sessions: [{ type: Schema.Types.ObjectId, ref: 'Sessions' }],
    qrCodeUrl: { type: String, required: true },
}, {
    timestamps: true
});

const Parking = mongoose.model('Parking', ParkingSchema);

module.exports = Parking;