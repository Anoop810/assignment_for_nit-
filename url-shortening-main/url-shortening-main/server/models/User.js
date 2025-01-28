const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() }, // Auto-generated ID
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    temp: { type: String, default: '' }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
