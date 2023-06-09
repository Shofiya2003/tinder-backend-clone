const Swipe = require('../models/swipe')
const Match = require('../models/match')
class MatchStore {
    async checkMatch(swipedByUserId, swipedOnUserId) {
        try {
            const swipe = await Swipe.findOne({
                swipedBy: swipedByUserId,
                swipedOn: swipedOnUserId,
                swiped: "right"
            })

            return swipe;
        } catch (err) {
            throw new Error(err.message)
        }

    }

    async createMatch({ userId1, userId2 }) {
        try {
            const match = await Match.create({
                userId1: userId1,
                userId2: userId2
            })

        } catch (err) {
            throw new Error(err.message)
        }
    }

    async createRightSwipe(swipedByUserId, swipedOnUserId) {
        try {
            const swipe = await Swipe.create({
                swipedBy: swipedByUserId,
                swipedOn: swipedOnUserId,
                swiped: "right"
            });

            return swipe;
        } catch (err) {
            throw new Error(err.message);
        }
    }

    async createLeftSwipe(swipedByUserId, swipedOnUserId) {
        try {
            const swipe = await Swipe.create({
                swipedBy: swipedByUserId,
                swipedOn: swipedOnUserId,
                swiped: "left"
            });

            return swipe;
        } catch (err) {
            throw new Error(err.message)
        }
    }

    async getMatches(userId) {
        try {
            const matches = await Match.find({ "$or": [{ userId1: userId }, { userId2: userId }] });
            return matches

        } catch (err) {
            throw new Error(err.message)
        }
    }

    async getMatchesNotNotified(userId, lastActive) {
        try {
            const matches = await Match.find({ "$or": [{ userId1: userId }, { userId2: userId }], createdAt: { '$gte': lastActive } });
            return matches
        } catch (err) {
            throw new Error(err.message)
        }
    }

}


module.exports = new MatchStore();