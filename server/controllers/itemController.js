const Item = require('../models/itemModel');

// קבלת כל הפריטים מהמסד
const getItems = async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    return res.status(200).json(items);
  } catch (error) {
    return res.status(500).json({ message: 'שגיאה בשליפת הפריטים', error: error.message });
  }
};

// קבלת פריט בודד לפי מזהה
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

// פתיחת הקובץ לצפייה ישירה בדפדפן
const openItemFile = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item || !item.fileUrl) {
      return res.status(404).json({ message: 'הקובץ לא נמצא או שאין כתובת שמורה' });
    }

    // הפניה לכתובת הקובץ ב-Cloudinary
    return res.redirect(item.fileUrl);
  } catch (error) {
    return res.status(500).json({ message: 'שגיאה בפתיחת הקובץ', error: error.message });
  }
};

// הורדת הקובץ ישירות למחשב
const downloadItemFile = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item || !item.fileUrl) {
      return res.status(404).json({ message: 'הקובץ לא נמצא או שאין כתובת שמורה' });
    }

    // הוספת הדגל fl_attachment לכתובת Cloudinary כדי לכפות הורדה
    let downloadUrl = item.fileUrl;
    if (downloadUrl.includes('/upload/')) {
      downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
    }

    return res.redirect(downloadUrl);
  } catch (error) {
    return res.status(500).json({ message: 'שגיאה בהורדת הקובץ', error: error.message });
  }
};

// יצירת פריט חדש ושמירת נתוני הקובץ מ-Cloudinary
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

    // הכתובת הישירה מקלאודינרי מתקבלת בשדה path או secure_url
    const fileUrl = uploadedFile.path || uploadedFile.secure_url;
    const mimeType = uploadedFile.mimetype || 'application/octet-stream';

    const newItem = await Item.create({
      title,
      author,
      description,
      fileUrl,
      originalFileName: uploadedFile.originalname,
      fileMimeType: mimeType,
      fileFormat: uploadedFile.format || mimeType,
      createdBy: req.user ? req.user._id : null,
    });

    return res.status(201).json(newItem);
  } catch (error) {
    return res.status(500).json({ message: 'שגיאה ביצירת הפריט', error: error.message });
  }
};

// עדכון פריט
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

// מחיקת פריט
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