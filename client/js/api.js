// כתובת הבסיס של השרת - כל הפניות לרשת יתחילו מכאן
const BASE_URL = 'http://localhost:5000/api';

/**
 * פונקציה לשליפת כל הפריטים הקיימים במסד הנתונים
 * מחזירה: מערך של אובייקטים (הפריטים)
 */
async function getItems() {
  try {
    // שליחת בקשת GET לכתובת http://localhost:5000/api/items
    const response = await fetch(`${BASE_URL}/items`);
    
    // בדיקה האם השרת החזיר תשובה חיובית (קוד 200)
    if (!response.ok) {
      throw new Error('שגיאה בעת טעינת הפריטים מהשרת');
    }
    
    // פענוח התשובה מפורמט JSON לאובייקט JavaScript והחזרתו
    const items = await response.json();
    return items;
  } catch (error) {
    // הדפסת השגיאה לקונסול במידה והבקשה נכשלה
    console.error('שגיאה בפונקציה getItems:', error);
    throw error;
  }
}

/**
 * פונקציה להעלאת פריט חדש יחד עם קובץ
 * מקבלת: formData - אובייקט שמכיל את השדות (כותרת, מחבר) ואת הקובץ
 * מחזירה: את הפריט החדש שנוצר בשרת
 */
async function createItem(formData) {
  try {
    // שליחת בקשת POST עם הנתונים והקובץ
    const response = await fetch(`${BASE_URL}/items`, {
      method: 'POST',
      body: formData // הדפדפן מוסיף לבד את הכותרות המתאימות לקובץ
    });
    
    // בדיקה האם היצירה הצליחה
    if (!response.ok) {
      throw new Error('שגיאה ביצירת הפריט ושמירתו');
    }
    
    // החזרת הנתונים של הפריט החדש שנשמר
    const newItem = await response.json();
    return newItem;
  } catch (error) {
    console.error('שגיאה בפונקציה createItem:', error);
    throw error;
  }
}