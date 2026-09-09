const express = require('express');
const router = express.Router();
const { getItems } = require('../controllers/itemController');

// נתיב לקבלת כל הפריטים
router.get('/', getItems);

module.exports = router;