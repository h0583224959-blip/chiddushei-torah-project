const Item = require('../models/itemModel');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

// @desc    קבלת כל הפריטים מהמסד
// @route   GET /api/items
// @access  Public
const getItems = async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    return res.status(200).json(items);
  } catch (error) {
    return res.status(500).json({ message: 'שגיאה בשליפת הפריטים', error: error.message });
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

    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: 'שגיאה בשליפת הפריט', error: error.message });
  }
};

const openItemFile = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'הפריט לא נמצא' });
    }

    if (!item.fileUrl) {
      return res.status(404).json({ message: 'לקובץ אין כתובת שמורה' });
    }

    if (/^https?:\/\//i.test(item.fileUrl) && !item.fileUrl.includes('localhost')) {
      return res.status(410).json({
        message: 'הקובץ שמור בכתובת חיצונית. יש להשיג את הקובץ המקורי ולהעלות אותו מחדש.',
      });
    }

    const normalizedFileUrl = item.fileUrl || '';
    const fileName = path.basename(
      normalizedFileUrl.startsWith('/uploads/')
        ? normalizedFileUrl
        : new URL(normalizedFileUrl, 'http://localhost').pathname
    );
    const filePath = path.join(__dirname, '..', 'uploads', fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'הקובץ המקורי אינו נמצא בתיקיית ההעלאות.' });
    }

    const originalFileName = item.originalFileName || fileName;
    res.setHeader('Content-Type', item.fileMimeType || mime.lookup(filePath) || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(originalFileName)}`);
    return res.sendFile(filePath);
  } catch (error) {
    return res.status(500).json({ message: 'שגיאה בפתיחת הקובץ', error: error.message });
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
      return res.status(410).json({
        message: 'הקובץ שמור בכתובת חיצונית. יש להשיג את הקובץ המקורי ולהעלות אותו מחדש.',
      });
    }

    const normalizedFileUrl = item.fileUrl || '';
    const fileName = path.basename(
      normalizedFileUrl.startsWith('/uploads/')
        ? normalizedFileUrl
        : new URL(normalizedFileUrl, 'http://localhost').pathname
    );
    const filePath = path.join(__dirname, '..', 'uploads', fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'הקובץ המקורי אינו נמצא בתיקיית ההעלאות.' });
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
    const { title, author, description } = req.body;
    const uploadedFile = req.file || req.files?.file?.[0] || req.files?.audio?.[0];

    if (!uploadedFile) {
      return res.status(400).json({ message: 'נא להעלות קובץ' });
    }

    if (!uploadedFile.path) {
      return res.status(400).json({ message: 'הקובץ לא נשמר בתיקיית ההעלאות המקומית' });
    }

    if (!title || !author) {
      return res.status(400).json({ message: 'נא למלא את כל שדות החובה: כותרת ומחבר' });
    }

    const localFileName = uploadedFile.filename || path.basename(uploadedFile.path || '');
    const fileUrl = localFileName ? `/uploads/${localFileName}` : (uploadedFile.secure_url || uploadedFile.url);
    const mimeType = uploadedFile.mimetype || uploadedFile.mimeType || 'application/octet-stream';

    const newItem = await Item.create({
      title,
      author,
      description,
      fileUrl,
      originalFileName: uploadedFile.originalname || uploadedFile.original_name,
      fileMimeType: mimeType,
      fileFormat: mimeType,
      createdBy: req.user ? req.user._id : null,
    });

    return res.status(201).json(newItem);
  } catch (error) {
    console.error('שגיאה ביצירת הפריט:', error);
    return res.status(500).json({ message: 'שגיאה ביצירת הפריט', error: error.message });
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

    return res.status(200).json(updatedItem);
  } catch (error) {
    return res.status(500).json({ message: 'שגיאה בעדכון הפריט', error: error.message });
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

    return res.status(200).json({ message: 'הפריט נמחק בהצלחה', id: req.params.id });
  } catch (error) {
    return res.status(500).json({ message: 'שגיאה במחיקת הפריט', error: error.message });
  }
};

module.exports = {
  getItems,
  getItemById,
  openItemFile,
  downloadItemFile,
  createItem,
  updateItem,
  deleteItem,
};