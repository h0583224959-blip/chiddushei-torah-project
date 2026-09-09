const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// נתיב רישום משתמש חדש
router.post('/register', userController.register);

// נתיב התחברות משתמש קיים
router.post('/login', userController.login);

module.exports = router;