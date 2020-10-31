const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CarSchema = new Schema({
    license: { type: String, required: true, index: true },   // Car lot number
    createdBy: { type: Schema.Types.ObjectId, ref: 'Users' },
    type: {
        type: String,
        enum: ['car', 'truck', 'motorcycle']
    },
    province: String, // unit $cad per hr
    description: String,
    sessions: [{ type: Schema.Types.ObjectId, ref: 'Sessions' }],
}, {
    timestamps: true
});

const Car = mongoose.model('Car', CarSchema);

module.exports = Car;