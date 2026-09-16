const express = require('express');
const router = express.Router();
const {
    getItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem
} = require('../controllers/itemController');
const upload = require('../middlewares/uploadMiddleware');

// נתיב לקבלת כל הפריטים
router.get('/', getItems);

// נתיב לקבלת פריט בודד לפי מזהה
router.get('/:id', getItemById);

// נתיב ליצירת פריט חדש כולל העלאת קובץ
router.post('/', upload.single('audio'), createItem);

// נתיב לעדכון פריט
router.put('/:id', updateItem);

// נתיב למחיקת פריט
router.delete('/:id', deleteItem);

module.exports = router;