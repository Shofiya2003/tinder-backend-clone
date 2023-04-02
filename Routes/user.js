const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth')

const { get, post, patch } = require('../Controllers/user');

router.get('/', authMiddleware, get);

router.post('/', authMiddleware, post)

router.patch('/', authMiddleware, patch)



module.exports = router;