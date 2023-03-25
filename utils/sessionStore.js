const Session = require('../models/session')

class SessionStore {

    async findSession(sessionId) {
        try {
            const session = await Session.findOne({ sessionId: sessionId })
            if (session) {
                return session;
            }
            return null
        } catch (err) {
            throw new Error(err.message)
        }

    }

    async createSession(session) {
        try {
            const newSession = await Session.create(session);
            return newSession;
        } catch (err) {
            throw new Error(err.message)
        }
    }

}

module.exports = new SessionStore()