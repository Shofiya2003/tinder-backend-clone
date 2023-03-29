const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Developer = require('../models/userInfo');

const authMiddleware = require('../middleware/auth')

const { get, post, patch } = require('../Controllers/user');

router.get('/', authMiddleware, (req, res) => {
    return res.json({ status: "ok" })
});

router.post('/', authMiddleware, post)

router.patch('/', authMiddleware, patch)



module.exports = router;