const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

// הגדרת החיבור ל-Cloudinary מתוך משתני הסביבה (.env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// הגדרת האחסון ב-Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shared_files', // שם התיקייה ב-Cloudinary
    resource_type: 'auto',  // מאפשר העלאת תמונות, שמע, וידאו ומסמכים
  },
});

// סינון סוגי הקבצים (בדיוק כפי שהגדרת)
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const allowedExtensions = ['jpeg', 'jpg', 'png', 'gif', 'webp', 'mp3', 'm4a', 'wav', 'ogg', 'aac', 'pdf', 'mp4', 'mov', 'avi'];
  const isAllowedExt = allowedExtensions.includes(ext);
  const isAllowedMime =
    file.mimetype.startsWith('image/') ||
    file.mimetype.startsWith('audio/') ||
    file.mimetype.startsWith('video/') ||
    file.mimetype === 'application/pdf';

  if (isAllowedExt || isAllowedMime) {
    return cb(null, true);
  }

  cb(new Error('שגיאה: ניתן להעלות קובצי תמונה, שמע, וידאו או מסמכים בלבד!'));
};

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // מגבלה של 20MB
  fileFilter,
});

module.exports = upload;