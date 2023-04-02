const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String },
    name: { type: String },
    age: { type: Number },
    gender: { type: String, enum: ["male", "female"] },
    genderInterestedIn: { type: String, enum: ["male", "female", "both"] },
    bio: { type: String },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    interestedAgeRange: {
        minAge: {
            type: Number,
            default: 17,
            required: true
        },
        maxAge: {
            type: Number,
            default: 100,
            required: true
        }
    },
    lastActive: { type: Date, default: Date.now() }
}, { collection: 'users' });

UserSchema.index({ location: "2dsphere" })

const user = mongoose.model('user', UserSchema);

module.exports = user;