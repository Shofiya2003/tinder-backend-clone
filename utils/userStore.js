const User = require('../models/user')

class UserStore {
    async updateUser(userId, updatedDetails) {
        try {
            await User.findOneAndUpdate({ _id: userId }, updatedDetails);
        } catch (err) {
            throw new Error(err.message);
        }
    }

    async checkStatus(userId) {
        try {
            const user = await User.findOne({ _id: userId }, { online: 1 });
            console.log(user);
            return user.online;
        } catch (err) {
            throw new Error(err.message);
        }
    }
}

module.exports = new UserStore()