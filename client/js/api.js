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

/**
 * פונקציה למחיקת פריט קיים
 * מקבלת: id - המזהה הייחודי של הפריט למחיקה
 * מחזירה: אישור על המחיקה מהשרת
 */
async function deleteItem(id) {
  try {
    // שליחת בקשת מחיקה עם ה-id בנתיב
    const response = await fetch(`${BASE_URL}/items/${id}`, {
      method: 'DELETE'
    });
    
    // בדיקה האם המחיקה עברה בהצלחה
    if (!response.ok) {
      throw new Error('שגיאה בעת מחיקת הפריט');
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('שגיאה בפונקציה deleteItem:', error);
    throw error;
  }
}
/**
 * פונקציה להתחברות משתמש
 * מקבלת: email, password
 * שומרת ב-localStorage: טוקן ותפקיד משתמש
 */
async function login(email, password) {
  try {
    // שליחת פרטי המשתמש בפורמט JSON
    const response = await fetch(`${BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    // אם הסיסמה או האימייל לא נכונים
    if (!response.ok) {
      throw new Error('פרטי התחברות שגויים');
    }
    
    const data = await response.json();
    
    // שמירת מזהה ההתחברות וההרשאה בזיכרון המקומי של הדפדפן
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.role || 'user');
    }
    
    return data;
  } catch (error) {
    console.error('שגיאה בפונקציה login:', error);
    throw error;
  }
}
/**
 * בדיקת מצב ההתחברות הנוכחי
 * מחזירה: אובייקט עם טוקן ותפקיד אם מחובר, או null אם לא מחובר
 */
function getCurrentUser() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');
  
  if (token) {
    return { token, role };
  }
  return null;
}

/**
 * התנתקות מהמערכת ומחיקת נתוני ההתחברות מהדפדפן
 */
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
}