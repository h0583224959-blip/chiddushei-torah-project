const Item = require('../models/itemModel');

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
// @desc    יצירת פריט חדש
// @route   POST /api/items
// @access  Public
const createItem = async (req, res) => {
  try {
    const { title, author, description, fileUrl, coverImage } = req.body;

    // בדיקת שדות חובה
    if (!title || !author || !fileUrl) {
      return res.status(400).json({ message: 'נא למלא את כל שדות החובה: כותרת, מחבר וקובץ' });
    }

    // יצירת המסמך במסד הנתונים
    const newItem = await Item.create({
      title,
      author,
      description,
      fileUrl,
      coverImage,
    });

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: 'שגיאה ביצירת הפריט', error: error.message });
  }
};
module.exports = {
  getItems,
  getItemById,
  createItem,
};