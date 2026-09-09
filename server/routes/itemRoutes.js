const express = require('express');
const router = express.Router();
const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} = require('../controllers/itemController');

// ייבוא פונקציות ההגנה וההרשאות
const { protect, admin } = require('../middlewares/authMiddleware');

// קבלת כל הפריטים - פתוח לכולם
router.get('/', getItems);

// קבלת פריט בודד לפי מזהה - פתוח לכולם
router.get('/:id', getItemById);

// יצירת פריט חדש - דורש משתמש מחובר בלבד
router.post('/', protect, createItem);

// עדכון פריט - דורש משתמש מחובר שהוא מנהל
router.put('/:id', protect, admin, updateItem);

// מחיקת פריט - דורש משתמש מחובר שהוא מנהל
router.delete('/:id', protect, admin, deleteItem);

module.exports = router;