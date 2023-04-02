const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    from: { type: mongoose.Types.ObjectId, required: true },
    to: { type: mongoose.Types.ObjectId, required: true },
    message: { type: String, required: true }
}, {
    timestamps: true
});

const message = mongoose.model('message', MessageSchema);

module.exports = message;