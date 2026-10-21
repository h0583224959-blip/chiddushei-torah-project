import User from '../models/userModel.js';
// פונקציות עזר 
import bcrypt from 'bcryptjs';
// פונקציות עזר ליצירת שגיאות HTTP מותאמות  
import jwt from 'jsonwebtoken'; // פונקציות עזר ליצירת טוקנים
import { timingSafeEqual } from 'node:crypto'; // פונקציות עזר להשוואת מחרוזות בצורה בטוחה  
import { createHttpError } from '../middlewares/httpError.js';
// פונקציה שמחזירה מערך של מנהלים שהוגדרו בקובץ .env

const configuredAdmins = () => [1, 2].map((number) => ({ number,
  // מספר המנהל, כתובת האימייל והסיסמה מוגדרים בקובץ .env
  email: (process.env[`ADMIN_EMAIL_${number}`] || '').trim().toLowerCase(),
  password: process.env[`ADMIN_PASSWORD_${number}`] || ''
})).filter((admin) => admin.email);

const matchesSecret = (provided, expected) => {
  // השוואה בטוחה של הסיסמה שסופקה מול הסיסמה הצפויה
  const providedBuffer = Buffer.from(provided);
  // המחרוזת שסופקה על ידי המשתמש
  const expectedBuffer = Buffer.from(expected);
   // המחרוזת הצפויה שהוגדרה בקובץ .env
  return providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer);
  // השוואה בטוחה של המחרוזות כדי למנוע התק זמן
};

// פונקציית רישום משתמש חדש
export const register = async (req, res) => {
  // קבלת פרטי המשתמש מהבקשה                                    
  const { username, email, password } = req.body;
  const existingUser = await User.findOne({ email });
  // בדיקה אם כבר קיים משתמש עם כתובת האימייל הזו
  if (existingUser) {// אם כן, מחזירים שגיאה עם קוד 409 (Conflict)
    throw createHttpError('משתמש עם כתובת אימייל זו כבר קיים במערכת', 409);
  }

  const hashedPassword = await bcrypt.hash (password , 10);
  // הצפנת הסיסמה לפני שמירתה במסד הנתונים
  const newUser = await User.create({ username, email, password: hashedPassword, role: 'user' });
  // יצירת משתמש חדש במסד הנתונים עם תפקיד ברירת מחדל 'user'

  res.status(201).json({// החזרת תגובה עם קוד 201 והודעה על הצלחה
    message: 'המשתמש נרשם בהצלחה',// החזרת פרטי המשתמש שנוצר
    user: {
      id: newUser._id,// החזרת מזהה המשתמש שנוצר
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    }
  });
};


// פונקציית התחברות משתמש קיים
export const login = async (req, res) => {
  // קבלת פרטי המשתמש מהבקשה  
  const { email, password } = req.body;// בדיקה אם המשתמש הוא מנהל שהוגדר בקובץ .env
  const adminAccount = configuredAdmins().find((admin) => admin.email === email);
  let user;// משתנה שיכיל את פרטי המשתמש שנמצא במסד הנתונים

  if (adminAccount) {// אם המשתמש הוא מנהל, נבדוק את הסיסמה מול הסיסמה שהוגדרה בקובץ .env
    if (!adminAccount.password || !matchesSecret(password, adminAccount.password)) {
      // אם הסיסמה שסופקה לא תואמת לסיסמה שהוגדרה בקובץ .env
      throw createHttpError('פרטי התחברות שגויים', 401);
      // מחזירים שגיאה עם קוד 401 והודעה על פרטי התחברות שגויים  
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.findOne({ email });
    if (user) {
      user.username = user.username || email;
      user.password = hashedPassword;
      user.role = 'admin';
      await user.save();
    } else {
      user = await User.create({ username: email, email, password: hashedPassword, role: 'admin' });
    }
  } else {
    user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw createHttpError('פרטי התחברות שגויים', 401);
    }

    if (user.role === 'admin') {
      user.role = 'user';
      await user.save();
    }
  }

  const token = jwt.sign( 
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(200).json({
    message: 'התחברת בהצלחה',
    token,
    user: {
      id: user._id,
      username: user.username,
      greetingName: adminAccount ? `מנהל ${adminAccount.number}` : user.username,
      email: user.email,
      role: user.role
    }
  });
};