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

module.exports = {
  getItems,
};