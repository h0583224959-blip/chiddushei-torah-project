const express = require('express');
const router = express.Router();
const {
    getItems,
    getItemById,
    openItemFile,
    downloadItemFile,
    createItem,
    updateItem,
    deleteItem
} = require('../controllers/itemController');
const upload = require('../middlewares/uploadMiddleware');
const { protect, admin } = require('../middlewares/authMiddleware');

// קריאה וצפייה בפריטים זמינות גם למבקרים ללא התחברות
router.get('/', getItems);
router.get('/:id', getItemById);
router.get('/:id/open', openItemFile);
router.get('/:id/download', downloadItemFile);

// נתיבים שדורשים גם התחברות וגם הרשאת מנהל (רק מנהל יכול להעלות/לערוך/למחוק)
router.post(
  '/',
  protect,
  admin,
  upload.single('file'), // מעלה קובץ יחיד מכל סוג
  createItem
);

router.put('/:id', protect, admin, updateItem);
router.delete('/:id', protect, admin, deleteItem);

module.exports = router;