const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
    userId1:{type:mongoose.Types.ObjectId,required:true},
    userId2:{type:mongoose.Types.ObjectId,required:true},
}, {
    timestamps: true
});

const match = mongoose.model('match', MatchSchema);

module.exports = match;