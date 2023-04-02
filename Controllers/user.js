const mongoose = require('mongoose')
const User = require('../models/user.js')
const Swipe = require('../models/swipe');
const get = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findOne({ _id: userId });
        //get the users already been swiped
        let swipedList = await Swipe.find({ swipedBy: userId }, { _id: 0, swipedOn: 1 });
        swipedList = swipedList.map(swipe => {
            return swipe.swipedOn.toString();
        })
        console.log(swipedList);
        const query = {
            gender: user.genderInterestedIn,
            genderInterestedIn: { $in: ["both", user.gender] },
            _id: { $nin: [swipedList], $ne: userId },
            location: {

                $near:
                {
                    $geometry: user.location,
                    $maxDistance: 80467.2
                }

            },
            "$or":[{"interestedAgeRange.maxAge":{ $gte: user.age }},{"interestedAgeRange.maxAge":null}],
            "$or":[{"interestedAgeRange.minAge":{ $lte: user.age }},{"interestedAgeRange.minAge":null}],
        }


        if (!user?.name || !user?.genderInterestedIn || !user?.location) {
            return res.json({ status: 'error', err: "user information incomplete" })
        }

        if (user?.interestedAgeRange) {
            const maxAge = user?.interestedAgeRange?.maxAge;
            const minAge = user?.interestedAgeRange?.minAge || 19;
            if (maxAge) {
                query.age = { $lte: maxAge, $gte: minAge }
            } else {
                query.age = { $gte: minAge }
            }
        }
        console.log(query);
        const users = await User.find(query).sort({ lastActive: -1 })

        return res.json({ status: 'ok', users: users });
    } catch (err) {
        console.log(err);
    }

}

const post = async (req, res) => {
    try {
        const userId = req.userId;
        const { name, age, gender, genderInterestedIn, bio, location } = req.body;
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
        const userId = req.userId;
        const { name, age, gender, genderInterestedIn, bio, location, interestedAgeRange } = req.body;

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
        } if (interestedAgeRange) {
            update.interestedAgeRange = interestedAgeRange
        }

        const user = await User.findOneAndUpdate(filter, update);

        res.json({ status: 'ok', data: "updated successfully" });
    }
    catch (err) {
        res.json({ status: 'error', err: err.message })
    }
}

module.exports = { get, post, patch };