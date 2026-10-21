import express from 'express'; // ייבוא ספריית Express  
import mongoose from 'mongoose'; // ייבוא ספריית Mongoose לניהול מסד הנתונים MongoDB  
import cors from 'cors'; // ייבוא ספריית CORS לניהול מדיניות שיתוף משאבים בין מקורות שונים  
import path from 'node:path';// ייבוא ספריית Path לניהול נתיבי קבצים
import { fileURLToPath } from 'node:url';// ייבוא פונקציה fileURLToPath להמרת URL של קובץ לנתיב קובץ
import dotenv from 'dotenv'; // ייבוא ספריית Dotenv לניהול משתני סביבה  

// טעינת משתני הסביבה מתוך תיקיית server
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const { default: userRoutes } = await import('./routes/userRoutes.js');
const { default: itemRoutes } = await import('./routes/itemRoutes.js');

const app = express();

// הגדרות בסיסיות (Middlewares)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res) => {
    res.setHeader('Content-Disposition', 'attachment');
  }
}));

// ניתובי כתובות
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);

// תופס שגיאות מרכזי
app.use((err, req, res, next) => {
  const status = err.isJoi ? 400 : err.status || 500;
  const message = err.isJoi
    ? err.details.map((detail) => detail.message).join(', ')
    : status >= 500 ? 'שגיאה כללית בשרת' : err.message;

  if (status >= 500) console.error(err);

  res.status(status).json({ message });
});

// הפעלת השרת וחיבור למסד הנתונים
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('MONGO_URI חסר בקובץ server/.env');
}
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET חסר בקובץ server/.env');
}

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

