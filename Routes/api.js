
const express = require('express');
const router = express.Router();

// importing the authentication route
const auth = require('./auth');
const user = require('./user')


router.use('/auth', auth);
router.use('/user', user);


router.get('/', (req, res) => {
    res.send("we are logically blessed");
});

module.exports = router;