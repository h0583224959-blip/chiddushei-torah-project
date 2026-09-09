const express = require('express');
const router = express.Router();
const { getItems, getItemById, createItem } = require('../controllers/itemController');

// נתיב לקבלת כל הפריטים
router.get('/', getItems);
router.get('/:id', getItemById);
router.post('/', createItem);
module.exports = router;