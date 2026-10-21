import Item from '../models/itemModel.js';
import { createHttpError } from '../middlewares/httpError.js';
//פונקציה זו מחפשת פריט במסד הנתונים לפי מזהה ומחזירה אותו אם נמצא
const findItemOrFail = async (id) => { 
 //  אחרת היא זורקת שגיאה עם הודעה מתאימה
  const item = await Item.findById(id);
  if (!item) throw createHttpError('הפריט לא נמצא', 404);
  return item;
};

// קבלת כל הפריטים מהמסד
const getItems = async (req, res) => {
  const items = await Item.find().sort({ createdAt: -1 });
  return res.status(200).json(items);
};

// קבלת פריט בודד לפי מזהה
const getItemById = async (req, res) => {
  const item = await findItemOrFail(req.params.id);
  return res.status(200).json(item);
};

// פתיחת הקובץ לצפייה ישירה בדפדפן
const openItemFile = async (req, res) => {
  const item = await findItemOrFail(req.params.id);
  if (!item.fileUrl) throw createHttpError('לא נמצאה כתובת לקובץ', 404);
  //מפנה את הדפדפן (redirect) ישירות
  //לכתובת הקובץ השמורה ב-Cloudinary, כך שהקובץ נפתח ישירות מהענן מבלי להעמיס על שרת המערכת.
  return res.redirect(item.fileUrl);
};

// הורדת הקובץ ישירות למחשב
const downloadItemFile = async (req, res) => {
  //שולפת את הפריט מהמסד לפי המזהה.
  const item = await findItemOrFail(req.params.id);
  if (!item.fileUrl) throw createHttpError('לא נמצאה כתובת לקובץ', 404);

  let downloadUrl = item.fileUrl; //שומרת את כתובת הקובץ להורדה
  // אם הקובץ מאוחסן ב-Cloudinary, משנה את הכתובת כך שהקובץ יורד ישירות למחשב במקום להיפתח בדפדפן.  
  if (downloadUrl.includes('/upload/')) {
    downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
  }

  return res.redirect(downloadUrl);
};

// יצירת פריט חדש ושמירת נתוני הקובץ מ-Cloudinary
const createItem = async (req, res) => {
  const { title, author, description } = req.body; //שולף את הנתונים מהבקשה
  if (!req.file) throw createHttpError('לא נבחר קובץ להעלאה', 400);
  const uploadedFile = req.file; //שולף את פרטי הקובץ שהועלה מ-Multer

  const fileUrl = uploadedFile.path || uploadedFile.secure_url;
  const mimeType = uploadedFile.mimetype || 'application/octet-stream';

  const newItem = await Item.create({
    title,
    author,
    description,
    fileUrl,
    originalFileName: uploadedFile.originalname,
    fileMimeType: mimeType,
    fileFormat: uploadedFile.format || mimeType,
    createdBy: req.user._id,
  });

  return res.status(201).json(newItem);
};

// עדכון פריט
const updateItem = async (req, res) => {
  const updatedItem = await Item.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true } // מחזיר את הפריט המעודכן
  );
  if (!updatedItem) throw createHttpError('הפריט לא נמצא לעדכון', 404);
  return res.status(200).json(updatedItem);
};

// מחיקת פריט
const deleteItem = async (req, res) => {
  const deletedItem = await Item.findByIdAndDelete(req.params.id);
  if (!deletedItem) throw createHttpError('הפריט לא נמצא למחיקה', 404);
  return res.status(200).json({ message: 'הפריט נמחק בהצלחה', id: req.params.id });
};
 
export {
  getItems,
  getItemById,
  openItemFile,
  downloadItemFile,
  createItem,
  updateItem,
  deleteItem,
};