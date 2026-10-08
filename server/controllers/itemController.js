const Item = require('../models/itemModel');
const fs = require('fs');
const path = require('path');

// @desc    קבלת כל הפריטים מהמסד
// @route   GET /api/items
// @access  Public
const getItems = async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: 'שגיאה בשליפת הפריטים', error: error.message });
  }
};

// @desc    קבלת פריט בודד לפי מזהה
// @route   GET /api/items/:id
// @access  Public
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'הפריט לא נמצא' });
    }

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: 'שגיאה בשליפת הפריט', error: error.message });
  }
};

const downloadItemFile = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'הפריט לא נמצא' });
    }

    if (!item.fileUrl) {
      return res.status(404).json({ message: 'לקובץ אין כתובת שמורה' });
    }

    if (/^https?:\/\//i.test(item.fileUrl) && !item.fileUrl.includes('localhost')) {
      const cloudResponse = await fetch(item.fileUrl);

      if (!cloudResponse.ok || !cloudResponse.body) {
        return res.status(502).json({ message: 'לא ניתן לקרוא את הקובץ מהענן' });
      }

      res.setHeader('Content-Type', item.fileMimeType || cloudResponse.headers.get('content-type') || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(item.originalFileName || path.basename(new URL(item.fileUrl).pathname))}"`);

      const { Readable } = require('stream');
      return Readable.fromWeb(cloudResponse.body).pipe(res);
    }

    const fileName = path.basename(new URL(item.fileUrl, 'http://localhost').pathname);
    const filePath = path.join(__dirname, '..', 'uploads', fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: 'הקובץ המקורי אינו נמצא בתיקיית ההעלאות. יש להעלות אותו מחדש.',
      });
    }

    return res.download(filePath, item.originalFileName || fileName);
  } catch (error) {
    return res.status(500).json({ message: 'שגיאה בהורדת הקובץ', error: error.message });
  }
};

// @desc    יצירת פריט חדש
// @route   POST /api/items
// @access  Public

const createItem = async (req, res) => {
  try {
    console.log('נתוני הקובץ שהתקבל:', req.file);
console.log('נתוני הגוף:', req.body);
    const { title, author, description, coverImage } = req.body;

    // בדיקת תקינות העלאת הקובץ
    if (!req.file) {
      return res.status(400).json({ message: 'נא להעלות קובץ' });
    }

    // בדיקת שדות חובה בטופס
    if (!title || !author) {
      return res.status(400).json({ message: 'נא למלא את כל שדות החובה: כותרת ומחבר' });
    }

    // שמירת הקישור הישיר מהענן (Cloudinary)
    const fileUrl = req.file.path;

    // יצירת המסמך במסד הנתונים
    const newItem = await Item.create({
      title,
      author,
      description,
      fileUrl,
      originalFileName: req.file.originalname,
      fileMimeType: req.file.mimetype,
      fileFormat: req.file.format,
      coverImage,
      user: req.user ? req.user._id : null,
    });

res.status(201).json(newItem);
  } catch (error) {
    console.error('פירוט השגיאה המלאה בשרת:', error);
    res.status(500).json({ message: 'שגיאה ביצירת הפריט', error: error.message });
  }
};

// @desc    עדכון פריט
// @route   PUT /api/items/:id
// @access  Public
const updateItem = async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'הפריט לא נמצא לעדכון' });
    }

    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: 'שגיאה בעדכון הפריט', error: error.message });
  }
};

// @desc    מחיקת פריט
// @route   DELETE /api/items/:id
// @access  Public
const deleteItem = async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      return res.status(404).json({ message: 'הפריט לא נמצא למחיקה' });
    }

    res.status(200).json({ message: 'הפריט נמחק בהצלחה', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'שגיאה במחיקת הפריט', error: error.message });
  }
};

module.exports = {
  getItems,
  getItemById,
  downloadItemFile,
  createItem,
  updateItem,
  deleteItem,
};