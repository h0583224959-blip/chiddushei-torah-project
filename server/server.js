const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// טעינת משתני הסביבה מתוך תיקיית server
require('dotenv').config({ path: path.join(__dirname, '.env') });

const userRoutes = require('./routes/userRoutes');
const itemRoutes = require('./routes/itemRoutes');

const app = express();

// הגדרות בסיסיות (Middlewares)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ניתובי כתובות
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);

// הפעלת השרת וחיבור למסד הנתונים
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB מחובר בהצלחה 🚀');
    app.listen(PORT, () => {
      console.log(`השרת פועל ומאזין בכתובת: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('שגיאה בחיבור למסד הנתונים ❌:', err.message);
  });