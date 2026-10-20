import express from 'express';
const router = express.Router();
import {
    getItems,
    getItemById,
    openItemFile,
    downloadItemFile,
    createItem,
    updateItem,
    deleteItem
} from '../controllers/itemController.js';
import upload from '../middlewares/uploadMiddleware.js';
import { protect, admin } from '../middlewares/authMiddleware.js';
import { validate, validateItemCreate, itemUpdateSchema, itemIdSchema } from '../middlewares/validationMiddleware.js';

// קריאה וצפייה בפריטים דורשות התחברות
router.get('/', protect, getItems);
router.get('/:id', protect, validate(itemIdSchema, 'params'), getItemById);
router.get('/:id/open', protect, validate(itemIdSchema, 'params'), openItemFile);
router.get('/:id/download', protect, validate(itemIdSchema, 'params'), downloadItemFile);

// נתיבים שדורשים גם התחברות וגם הרשאת מנהל (רק מנהל יכול להעלות/לערוך/למחוק)
router.post(
  '/',
  protect,
  admin,
  upload.single('file'), // מעלה קובץ יחיד מכל סוג
  validateItemCreate,
  createItem
);

router.put('/:id', protect, admin, validate(itemIdSchema, 'params'), validate(itemUpdateSchema), updateItem);
router.delete('/:id', protect, admin, validate(itemIdSchema, 'params'), deleteItem);

export default router;