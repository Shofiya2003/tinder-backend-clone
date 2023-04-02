const User = require('../models/user')

class UserStore {
    async updateUser(userId, updatedDetails) {
        try {
            await User.findOneAndUpdate({ _id: userId}, updatedDetails);
        } catch (err) {
            throw new Error(err.message);
        }
    }
}

module.exports = new UserStore()