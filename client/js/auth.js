// ממתין לכך שכל מבנה ה-HTML ייטען במלואו לפני הרצת הקוד
document.addEventListener('DOMContentLoaded', () => {
  // תפיסת אלמנט הטופס לפי ה-ID שלו
  const loginForm = document.getElementById('loginForm');

  // אם אנחנו בעמוד שאין בו את הטופס הזה, נעצור כאן כדי למנוע שגיאות
  if (!loginForm) return;

  // האזנה לאירוע שליחת הטופס (לחיצה על Enter או על כפתור ההתחברות)
  loginForm.addEventListener('submit', async (e) => {
    // מניעת ברירת המחדל של הדפדפן (שלא ירענן את הדף)
    e.preventDefault();

    // תפיסת שדות הקלט של שם המשתמש והסיסמה
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    // חילוץ הערכים וניקוי רווחים מיותרים מהקצוות
    const emailOrUser = usernameInput ? usernameInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value.trim() : '';

    // בדיקת תקינות בסיסית: מוודאים שהשדות אינם ריקים
    if (!emailOrUser || !password) {
      alert('נא למלא את כל השדות');
      return;
    }

    try {
      // אם הפונקציה login קיימת בקובץ api.js, נשתמש בה
      if (typeof login === 'function') {
        await login(emailOrUser, password);
      } else {
        // גיבוי: שליחה ישירה לשרת אם api.js לא נטען
        const response = await fetch('http://localhost:5000/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailOrUser, password })
        });

        // בדיקה אם השרת החזיר תשובה שאינה תקינה
        if (!response.ok) {
          throw new Error('פרטי התחברות שגויים');
        }

        const data = await response.json();
        
        // שמירת הטוקן ותפקיד המשתמש בזיכרון המקומי של הדפדפן
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('role', data.role || 'user');
        }
      }

      alert('התחברת בהצלחה!');
      // מעבר אוטומטי לדף הבית הראשי
      window.location.href = 'index.html';
    } catch (error) {
      console.error('שגיאה בהתחברות:', error);
      alert(error.message || 'אירעה שגיאה בחיבור לשרת');
    }
  });
});