const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
    sessionId: { type: String, required:true },
    userId: { type: mongoose.Types.ObjectId, required:true },
    username: { type: String, required:true },
    connected: { type: Boolean, default: true },
}, {
    timestamps: true
});

const session = mongoose.model('session', SessionSchema);

module.exports = session;