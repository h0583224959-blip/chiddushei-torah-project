const express = require('express');
const router = express.Router();
const {
    getItems,
    getItemById,
    downloadItemFile,
    createItem,
    updateItem,
    deleteItem
} = require('../controllers/itemController');
const upload = require('../middlewares/uploadMiddleware');
const { protect, admin } = require('../middlewares/authMiddleware');

// נתיב לקבלת כל הפריטים
router.get('/', getItems);

router.get('/:id/download', downloadItemFile);

// נתיב לקבלת פריט בודד לפי מזהה
router.get('/:id', getItemById);

// נתיב ליצירת פריט חדש כולל העלאת קובץ
router.post('/', protect, admin, upload.single('audio'), createItem);

// נתיב לעדכון פריט
router.put('/:id', protect, admin, updateItem);

// נתיב למחיקת פריט
router.delete('/:id', protect, admin, deleteItem);

module.exports = router;