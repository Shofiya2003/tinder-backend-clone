const Message = require('../models/message')

class MessageStore {
    async createMessage(from, to, content) {
        try {
            const message = await Message.create({
                from: from,
                to: to,
                message: content
            })
            console.log(message)
            return message
        } catch (err) {
            throw new Error(err.message)
        }

    }

    async getAllUserMessages(userId) {
        try {
            const messages = await Message.find({ "$or": [{ from: userId }, { to: userId }] });
            return messages;
        } catch (err) {
            throw new Error(err.message)
        }
    }

    async markAsRead(fromUserId, toUserId) {
        try {
            const messages = await Message.updateMany({ from: fromUserId, to: toUserId, read: false }, { read: true }).then()
            console.log(messages)
        } catch (err) {
            console.log(err);
            throw new Error(err.message)
        }
    }
}

module.exports = new MessageStore()