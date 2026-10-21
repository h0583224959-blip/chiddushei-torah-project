// כתובת הבסיס של השרת - כל הפניות לרשת יתחילו מכאן
const BASE_URL = 'http://localhost:5000/api';// כתובת הבסיס של השרת - כל הפניות לרשת יתחילו מכאן

/**
 * פונקציה לשליפת כל הפריטים הקיימים במסד הנתונים
 * מחזירה: מערך של אובייקטים (הפריטים)
 */
async function getItems() {
  try {
    const token = localStorage.getItem('token');// שליפת הטוקן מהזיכרון המקומי של הדפדפן
    const response = await fetch(`${BASE_URL}/items`, {// שליחת בקשת GET לשרת עם הטוקן בכותרת Authorization
      headers: token ? { Authorization: `Bearer ${token}` } : {}
      // אם אין טוקן, לא נשלח כותרת Authorization
    });

    if (response.status === 401) {
      // אם השרת מחזיר קוד 401 (Unauthorized), סימן שהטוקן אינו תקין או פג תוקף
      logout();// קריאה לפונקציה שמוחקת את כל פרטי ההתחברות מהזיכרון המקומי של הדפדפן
      window.location.replace('login.html');// הפניה מחדש לדף ההתחברות
      throw new Error('פג תוקף ההתחברות, יש להתחבר מחדש');//
    }

    if (!response.ok) {// אם השרת מחזיר קוד שגיאה אחר, נזרוק שגיאה עם הודעה מתאימה
      throw new Error('שגיאה בעת טעינת הפריטים מהשרת');
    }

    const items = await response.json();
    // החזרת המערך של הפריטים שהתקבל מהשרת
    return items;
  } catch (error) {// טיפול בשגיאות ברשת או בעיבוד הנתונים
    console.error('שגיאה בפונקציה getItems:', error);// הדפסת השגיאה בקונסול לצורך ניפוי באגים
    throw error;// זריקת השגיאה למעלה כדי שהקריאה לפונקציה תדע על השגיאה ותוכל לטפל בה
  }
}
/**
 * פונקציה להעלאת פריט חדש יחד עם קובץ
 * מקבלת: formData - אובייקט שמכיל את השדות (כותרת, מחבר) ואת הקובץ
 * מחזירה: את הפריט החדש שנוצר בשרת
 */
async function createItem(formData) {
  try {
    const token = localStorage.getItem('token');
    // שליחת בקשת POST עם הנתונים והקובץ
    const response = await fetch(`${BASE_URL}/items`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData // הדפדפן מוסיף לבד את הכותרות המתאימות לקובץ
    });
    
    // בדיקה האם היצירה הצליחה
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `שגיאה ביצירת הפריט (HTTP ${response.status})`);
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
async function deleteItem(id) {// פונקציה זו שולחת בקשת מחיקה לשרת עבור פריט מסוים לפי המזהה שלו  
  try {
    const token = localStorage.getItem('token');// שליפת הטוקן מהזיכרון המקומי של הדפדפן  
    // שליחת בקשת מחיקה עם ה-id בנתיב
    const response = await fetch(`${BASE_URL}/items/${id}`, {
      method: 'DELETE',
      // אם יש טוקן, נוסיף אותו לכותרת Authorization
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!response.ok) {// אם השרת מחזיר קוד שגיאה, נזרוק שגיאה עם הודעה מתאימה
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
    
    const data = await response.json();// המרת התגובה לאובייקט JSON
    
    // שמירת מזהה ההתחברות וההרשאה בזיכרון המקומי של הדפדפן
    if (data.token) {// אם התקבל טוקן מהשרת, נשמור אותו יחד עם פרטי המשתמש
      localStorage.setItem('token', data.token);// שמירת הטוקן בזיכרון המקומי של הדפדפן
      localStorage.setItem('role', data.user?.role || data.role || 'user');
      localStorage.setItem('username', data.user?.username || data.user?.email || email);
      localStorage.setItem('greetingName', data.user?.greetingName || data.user?.username || data.user?.email || email);
    }
    
    return data;// החזרת הנתונים שהתקבלו מהשרת (כולל הטוקן ופרטי המשתמש)
  } catch (error) {// טיפול בשגיאות ברשת או בעיבוד הנתונים
    console.error('שגיאה בפונקציה login:', error);// הדפסת השגיאה בקונסול לצורך ניפוי באגים
    throw error;
  }
}

async function registerUser(username, email, password) {//
  const response = await fetch(`${BASE_URL}/users/register`, {
    method: 'POST',// שליחת בקשת POST לשרת עם פרטי המשתמש החדש
    headers: { 'Content-Type': 'application/json' },
    // שליחת פרטי המשתמש בפורמט JSON
    body: JSON.stringify({ username, email, password })
    // המרת האובייקט JSON למחרוזת לשליחה לשרת
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'לא ניתן ליצור חשבון');
  }

  return data;
}
/**
 * בדיקת מצב ההתחברות הנוכחי
 * מחזירה: אובייקט עם טוקן ותפקיד אם מחובר, או null אם לא מחובר
 */// פונקציה זו בודקת אם יש טוקן שמורה בזיכרון המקומי של הדפדפן ומחזירה את פרטי המשתמש
function getCurrentUser() { 
  const token = localStorage.getItem('token');// שליפת הטוקן מהזיכרון המקומי של הדפדפן
  const role = localStorage.getItem('role');// שליפת התפקיד מהזיכרון המקומי של הדפדפן
  const username = localStorage.getItem('username');// שליפת שם המשתמש מהזיכרון המקומי של הדפדפן
  const greetingName = localStorage.getItem('greetingName');// שליפת שם הברכה מהזיכרון המקומי של הדפדפן
  
  if (token) {// אם קיים טוקן, מחזירים אובייקט עם פרטי המשתמש
    return { token, role, username, greetingName };// אם אין טוקן, מחזירים null
  }
  return null;
}

/**
 * התנתקות מהמערכת ומחיקת נתוני ההתחברות מהדפדפן
 */
function logout() {// פונקציה זו מוחקת את כל פרטי ההתחברות מהזיכרון המקומי של הדפדפן
  localStorage.removeItem('token');// מחיקת הטוקן
  localStorage.removeItem('role');// מחיקת תפקיד המשתמש
  localStorage.removeItem('username');// מחיקת שם המשתמש
  localStorage.removeItem('greetingName');// מחיקת שם הברכה (למשתמשים מנהלים)
}