import jwt from 'jsonwebtoken';// פונקציות עזר ליצירת טוקנים
import User from '../models/userModel.js';// פונקציות עזר ליצירת שגיאות HTTP מותאמות
import { createHttpError } from './httpError.js';// פונקציות עזר להשוואת מחרוזות בצורה בטוחה

// 1. פונקציית אימות: בדיקה אם נשלח טוקן תקין וחילוץ פרטי המשתמש
const protect = async (req, res, next) => {// בדיקה אם נשלח כותרת Authorization עם טוקן
  const authorization = req.headers.authorization;// בדיקה אם הכותרת קיימת ומתחילה ב-Bearer
  if (!authorization?.startsWith('Bearer ')) {// אם לא, מחזירים שגיאה עם קוד 401 (Unauthorized)
    throw createHttpError('גישה נדחתה, לא סופק טוקן', 401);
  }

  let decoded;// ניסיון לפענח את הטוקן באמצעות המפתח הסודי שהוגדר בקובץ .env
  try {
    decoded = jwt.verify(authorization.split(' ')[1], process.env.JWT_SECRET);
    // אם הפענוח מצליח, נשמור את פרטי המשתמש בבקשה ונמשיך למתאם הבא
  } catch {// אם הפענוח נכשל, מחזירים שגיאה עם קוד 401 (Unauthorized)
    throw createHttpError('אימות נכשל, טוקן אינו תקין', 401);
  }

  req.user = await User.findById(decoded.id).select('-password');
  // בדיקה אם המשתמש קיים במסד הנתונים, אם לא, מחזירים שגיאה עם קוד 401 (Unauthorized)
  if (!req.user) {
    throw createHttpError('משתמש לא קיים במערכת', 401);
  }

  next();
};

// 2. פונקציית בדיקת תפקיד: מוודאת שהמשתמש הוא מנהל (role === 'admin')
const admin = (req, res, next) => {
  const configuredEmails = [process.env.ADMIN_EMAIL_1, process.env.ADMIN_EMAIL_2]
    .filter(Boolean)// מסנן את הערכים הריקים או הלא מוגדרים
    .map((email) => email.trim().toLowerCase());

  if (
    req.user &&// בדיקה אם המשתמש קיים בבקשה
    req.user.role === 'admin' &&// בדיקה אם תפקיד המשתמש הוא מנהל
    configuredEmails.includes(req.user.email.toLowerCase())// בדיקה אם כתובת האימייל של המשתמש קיימת ברשימת המנהלים שהוגדרה בקובץ .env
  ) {
    next(); // המשתמש מורשה כמנהל, ממשיכים
  } else {
    throw createHttpError('גישה חסומה: מיועד למנהל מערכת בלבד', 403);
  }
};

export { protect, admin };// יצוא הפונקציות protect ו-admin לשימוש בקבצים אחרים