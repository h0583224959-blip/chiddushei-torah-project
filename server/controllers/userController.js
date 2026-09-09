const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// פונקציית רישום משתמש חדש
exports.register = async (req, res) => {
  try {
    // 1. קליטת הנתונים שהמשתמש שלח בטופס
    const { username, email, password, role } = req.body;

    // 2. בדיקה שכל שדות החובה מולאו
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'נא למלא את כל השדות' });
    }

    // 3. בדיקה במסד הנתונים האם קיים כבר משתמש עם האימייל הזה
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'משתמש עם כתובת אימייל זו כבר קיים במערכת' });
    }

    // 4. יצירת מפתח הצפנה (Salt) והצפנת הסיסמה
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. שמירת המשתמש החדש במסד הנתונים עם הסיסמה המוצפנת
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'user'
    });

    // 6. החזרת תשובה מוצלחת ללקוח (ללא החזרת הסיסמה)
    res.status(201).json({
      message: 'המשתמש נרשם בהצלחה',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'שגיאה ברישום המשתמש', error: error.message });
  }
};