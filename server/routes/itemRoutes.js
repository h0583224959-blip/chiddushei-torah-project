const express = require('express');
const router = express.Router();
const { getItems, getItemById, createItem } = require('../controllers/itemController');
const upload = require('../middlewares/uploadMiddleware');

// נתיב לקבלת כל הפריטים
router.get('/', getItems);

// נתיב לקבלת פריט בודד לפי מזהה
router.get('/:id', getItemById);
router.post('/', upload.single('audio'), createItem);
module.exports = router;