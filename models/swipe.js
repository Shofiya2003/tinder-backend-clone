const mongoose = require('mongoose');

const SwipeSchema = new mongoose.Schema({
    swipedBy: { type: mongoose.Types.ObjectId, required: true },
    swipedOn: { type: mongoose.Types.ObjectId, required: true },
    swiped: { type: Boolean, required: true }
});

const swipe = mongoose.model('swipe', SwipeSchema);

module.exports = swipe;