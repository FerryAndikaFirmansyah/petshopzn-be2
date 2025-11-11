const express = require('express');
const router = express.Router();
const ac = require('../controllers/authController');

// Endpoint registrasi dan login
router.post('/register', ac.register);
router.post('/login', ac.login);

module.exports = router;