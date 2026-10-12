const multer = require('multer');
const fs = require('fs');
const path = require('path');

const uploadFolder = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadFolder, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    cb(null, safeName);
  },
});

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
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter,
});

module.exports = upload;