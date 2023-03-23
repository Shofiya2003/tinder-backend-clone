const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user')

router.post('/signin', async (req, res) => {
    try {

        const { username, password } = req.body
        const user = await User.findOne({ username }).lean();
        if (!user) {
            return res.json({ status: 'error', error: 'Invalid username or password' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)

        if (isPasswordCorrect) {


            console.log(req.session);
            // Password,username combination is successful
            const token = jwt.sign({
                id: user._id,
                username: user.username
            }, process.env.JWT_SECRET)
            console.log(user);
            console.log(req.session);
            req.session.userid = user._id;
            req.session.token = token
            res.json({ status: 'ok' });
        }
        else {
            console.log(err)
            res.status(400).json({ status: 'error', error: 'Invalid username or password' });
        }
    } catch (err) {
        return res.status(500).json({ status: 'error', msg: err.msg })
    }

})

router.post('/signup', async (req, res) => {
    try {
        console.log(req.body.username)
        const { username, password: plaintextpassword } = req.body
        console.log(username)
        console.log(plaintextpassword)
        const password = await bcrypt.hash(plaintextpassword, 10);
        const user = await User.create({
            username,
            password
        })
        const token = jwt.sign({
            id: user._id,
            username: user.username
        }, process.env.JWT_SECRET)
        console.log(user);
        console.log(req.session);
        req.session.userid = user._id;
        req.session.token = token
        return res.json({ status: 'ok' });
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: 'error', msg: err.msg })
    }
})

module.exports = router;