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