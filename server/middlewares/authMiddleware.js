const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// 1. פונקציית אימות: בדיקה אם נשלח טוקן תקין וחילוץ פרטי המשתמש
const protect = async (req, res, next) => {
  let token;

  // בדיקה אם נשלחה כותרת אימות תקנית המתחילה ב-Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // חילוץ מחרוזת הטוקן
      token = req.headers.authorization.split(' ')[1];

      // פענוח הטוקן באמצעות המפתח הסודי
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // שליפת פרטי המשתמש ממסד הנתונים ללא שדה הסיסמה
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'משתמש לא קיים במערכת' });
      }

      next(); // אישור מעבר לשלב הבא
    } catch (error) {
      return res.status(401).json({ message: 'אימות נכשל, טוקן אינו תקין' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'גישה נדחתה, לא סופק טוקן' });
  }
};

// 2. פונקציית בדיקת תפקיד: מוודאת שהמשתמש הוא מנהל (role === 'admin')
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // המשתמש מורשה כמנהל, ממשיכים
  } else {
    res.status(403).json({ message: 'גישה חסומה: מיועד למנהל מערכת בלבד' });
  }
};

module.exports = {
  protect,
  admin,
};