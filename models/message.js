const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    from: { type: mongoose.Types.ObjectId, required: true },
    to: { type: mongoose.Types.ObjectId, required: true },
    message: { type: String},
    type: {type: String,required: true},
    read: { type: Boolean, default: false },
    delivered: { type: Boolean, default: false }
}, {
    timestamps: true
});

const message = mongoose.model('message', MessageSchema);

module.exports = message;