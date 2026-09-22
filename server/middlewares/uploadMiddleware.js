const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// הגדרת החיבור ל-Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// הגדרת האחסון בענן עם תמיכה מפורשת בשמע, תמונות ומסמכים
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'project_files',
      resource_type: 'auto',
    };
  },
});

// סינון סוגי קבצים מותרים
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const allowedExtensions = ['jpeg', 'jpg', 'png', 'gif', 'webp', 'mp3', 'm4a', 'wav', 'ogg', 'aac', 'pdf'];

  const isAllowedExt = allowedExtensions.includes(ext);
  const isAllowedMime =
    file.mimetype.startsWith('image/') ||
    file.mimetype.startsWith('audio/') ||
    file.mimetype === 'application/pdf';

  if (isAllowedExt || isAllowedMime) {
    return cb(null, true);
  } else {
    cb(new Error('שגיאה: ניתן להעלות קובצי שמע, תמונה או PDF בלבד!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // עד 20MB
  fileFilter: fileFilter,
});

module.exports = upload;