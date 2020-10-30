const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsersSchema = new Schema({
    username: { type: String, required: true },
    name: String,
    lastName: String,
    password: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    isAdmin: { type: Boolean, default: false}
});

const Users = mongoose.model('Users', UsersSchema);

module.exports = Users;