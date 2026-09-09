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

// @desc    יצירת פריט חדש
// @route   POST /api/items
// @access  Public
const createItem = async (req, res) => {
  try {
    const { title, author, description, coverImage } = req.body;

    // בדיקת תקינות העלאת הקובץ
    if (!req.file) {
      return res.status(400).json({ message: 'נא להעלות קובץ' });
    }

    // בדיקת שדות חובה בטופס
    if (!title || !author) {
      return res.status(400).json({ message: 'נא למלא את כל שדות החובה: כותרת ומחבר' });
    }

    // שמירת הנתיב של הקובץ שהועלה
    const fileUrl = req.file.path.replace(/\\/g, '/');

    // יצירת המסמך במסד הנתונים
    const newItem = await Item.create({
      title,
      author,
      description,
      fileUrl,
      coverImage,
      user: req.user ? req.user._id : null,
    });

    res.status(201).json(newItem);
  } catch (error) {
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
  createItem,
  updateItem,
  deleteItem,
};