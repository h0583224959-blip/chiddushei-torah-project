const express = require('express');
const router = express.Router();
const { getItems, getItemById, createItem ,updateItem,
  deleteItem,} = require('../controllers/itemController');

// נתיב לקבלת כל הפריטים
router.get('/', getItems);
router.get('/:id', getItemById);
router.post('/', createItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);
module.exports = router;