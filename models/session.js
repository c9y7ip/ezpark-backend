const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SessionSchema = new Schema({
    date: { type: Date, required: true },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true },
    duration: { type: Number, required: true },     // unit: hours
    cost: { type: Number, required: true },
    currency: { type: String, default: 'cad' },
    stall: { type: String },
    license: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'Users' },
    car: { type: Schema.Types.ObjectId, ref: 'Cars' },
    parking: { type: Schema.Types.ObjectId, ref: 'Parkings' }
}, {
    timestamps: true
});

const Session = mongoose.model('Session', SessionSchema);

module.exports = Session;