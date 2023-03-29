const mongoose = require('mongoose')
const User = require('../models/user.js')
const get = async (req, res) => {
    if (req.session) { console.log(req.session.cookie.userid) };
    const { id } = req.params;

    if (!mongoose.isValidObjectId(Number(id))) {
        res.json({ status: 'error', error: "Incorrect user id" });
        return;
    }
    try {
        const developer = await Developer.findOne({ userId: id });

        if (!developer) {
            res.json({ status: 'error', error: "Developer not found" });
        }
        else
            res.json({ status: 'ok', data: developer });
    } catch (err) {
        res.json({ status: 'err', err: err });
    }

}

const post = async (req, res) => {
    try {
        const { userId, name, age, gender, genderInterestedIn, bio, location } = req.body;
        if (!mongoose.isValidObjectId(userId)) {
            return res.json({ status: 'error', error: 'invalid user id' });
        }
        const filter = {
            _id: userId
        };

        const update = {
            name: name,
            age: age,
            gender: gender,
            genderInterestedIn: genderInterestedIn,
            bio: bio,
            location: location
        }
        const user = await User.findOneAndUpdate(filter, update);
        return res.json({ status: 'ok', user: { _id: user._id, username: user.username, ...update, } })

    } catch (err) {
        return res.json({ status: 'error', err: err.message })
    }
}


const patch = async (req, res) => {
    try {
        const { userId, name, age, gender, genderInterestedIn, bio, location } = req.body;

        if (!mongoose.isValidObjectId(userId)) {
            return res.json({ status: 'error', error: 'invalid user id' });
        }

        const filter = {
            _id: userId
        };

        const update = {

        }

        if (name) {
            update.name = name;
        }
        if (age) {
            update.age = age;
        }

        if (gender) {
            update.gender = gender;
        }
        if (genderInterestedIn) {
            update.genderInterestedIn = genderInterestedIn;
        }
        if (bio) {
            update.bio = bio;
        }
        if (location) {
            update.location = location;
        }

        const user = await User.findOneAndUpdate(filter, update);

        res.json({ status: 'ok', data: "updated successfully" });
    }
    catch (err) {
        res.json({ status: 'error', err: err.message })
    }
}

module.exports = { get, post, patch };