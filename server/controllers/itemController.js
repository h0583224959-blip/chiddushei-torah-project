const Item = require('../models/itemModel');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const safeName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'video/mp4', 'audio/mpeg', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('סוג קובץ לא חוקי'));
  }
});

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
      return res.redirect(item.fileUrl);
    }

    const fileName = path.basename(new URL(item.fileUrl, 'http://localhost').pathname);
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
      const cloudinaryUrl = new URL(item.fileUrl);
      if (cloudinaryUrl.hostname === 'res.cloudinary.com') {
        const cloudinaryResponse = await fetch(cloudinaryUrl);

        if (!cloudinaryResponse.ok) {
          return res.status(502).json({
            message: 'Cloudinary לא אפשר להוריד את הקובץ',
            cloudinaryStatus: cloudinaryResponse.status,
          });
        }

        const downloadName = item.originalFileName || path.basename(cloudinaryUrl.pathname);
        res.setHeader('Content-Type', item.fileMimeType || cloudinaryResponse.headers.get('content-type') || mime.lookup(downloadName) || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(downloadName)}`);
        return res.send(Buffer.from(await cloudinaryResponse.arrayBuffer()));
      }

      return res.redirect(item.fileUrl);
    }

    if (item.fileUrl.startsWith('/uploads/')) {
      const fileName = path.basename(item.fileUrl);
      const filePath = path.join(__dirname, '..', 'uploads', fileName);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'הקובץ המקורי אינו נמצא בתיקיית ההעלאות.' });
      }

      return res.download(filePath, item.originalFileName || fileName);
    }

    const normalizedLocalPath = item.fileUrl.replace(/^file:\/\//i, '');
    const filePath = path.isAbsolute(normalizedLocalPath)
      ? normalizedLocalPath
      : path.join(__dirname, '..', 'uploads', path.basename(normalizedLocalPath));

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'הקובץ המקורי אינו נמצא בתיקיית ההעלאות.' });
    }

    return res.download(filePath, item.originalFileName || path.basename(filePath));
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

    if (!title || !author) {
      return res.status(400).json({ message: 'נא למלא את כל שדות החובה: כותרת ומחבר' });
    }

    const localFileName = uploadedFile.path ? path.basename(uploadedFile.path) : null;
    const fileUrl = uploadedFile.path
      ? (uploadedFile.path.includes('uploads') ? `/uploads/${localFileName}` : uploadedFile.path)
      : (uploadedFile.secure_url || uploadedFile.url);
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
  upload,
};