const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
  // הסרת הנקודה מתחילת הסיומת והפיכה לאותיות קטנות
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
    limits: { fileSize: 20 * 1024 * 1024 }, // הגבלה לעד 20MB
    fileFilter: fileFilter
});

module.exports = upload;



