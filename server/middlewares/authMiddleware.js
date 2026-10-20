import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { createHttpError } from './httpError.js';

// 1. פונקציית אימות: בדיקה אם נשלח טוקן תקין וחילוץ פרטי המשתמש
const protect = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) {
    throw createHttpError('גישה נדחתה, לא סופק טוקן', 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(authorization.split(' ')[1], process.env.JWT_SECRET);
  } catch {
    throw createHttpError('אימות נכשל, טוקן אינו תקין', 401);
  }

  req.user = await User.findById(decoded.id).select('-password');
  if (!req.user) {
    throw createHttpError('משתמש לא קיים במערכת', 401);
  }

  next();
};

// 2. פונקציית בדיקת תפקיד: מוודאת שהמשתמש הוא מנהל (role === 'admin')
const admin = (req, res, next) => {
  const configuredEmails = [process.env.ADMIN_EMAIL_1, process.env.ADMIN_EMAIL_2]
    .filter(Boolean)
    .map((email) => email.trim().toLowerCase());

  if (
    req.user &&
    req.user.role === 'admin' &&
    configuredEmails.includes(req.user.email.toLowerCase())
  ) {
    next(); // המשתמש מורשה כמנהל, ממשיכים
  } else {
    throw createHttpError('גישה חסומה: מיועד למנהל מערכת בלבד', 403);
  }
};

export { protect, admin };