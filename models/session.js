const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
    sessionId: {type:String,required},
    userId: {type:mongoose.Types.ObjectId},
});

const session = mongoose.model('session', SessionSchema);

module.exports = session;