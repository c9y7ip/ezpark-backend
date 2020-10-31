const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsersSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: String,
    email: { type: String, required: true },
    phone: String,
    isAdmin: { type: Boolean, default: false },
    stripeId: { type: String }, // this is for payment processing
    cars: [{ type: Schema.Types.ObjectId, ref: 'Cars' }],
    sessions: [{ type: Schema.Types.ObjectId, ref: 'Sessions' }],
    // admin fields
    parkings: [{ type: Schema.Types.ObjectId, ref: 'Parkings' }],
}, {
    timestamps: true
});

const Users = mongoose.model('Users', UsersSchema);

module.exports = Users;