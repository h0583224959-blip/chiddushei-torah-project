// ממתין לכך שכל מבנה ה-HTML ייטען במלואו לפני הרצת הקוד
document.addEventListener('DOMContentLoaded', () => {
  // איתור טופס ההתחברות; אם הוא לא קיים בעמוד, אין מה להפעיל.
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return; // אם אין טופס התחברות בעמוד, אין צורך להמשיך בהרצת הקוד

  // איתור טופס ההרשמה, כפתורי המעבר ושדה הסיסמה.
  const registerForm = document.getElementById('registerForm');// אם אין טופס הרשמה בעמוד, אין צורך להמשיך בהרצת הקוד
  const showRegister = document.getElementById('showRegister');
  // איתור כפתור המעבר לטופס ההתחברות ושדה הסיסמה בטופס ההרשמה.
  const showLogin = document.getElementById('showLogin');
  // איתור שדה הסיסמה בטופס ההרשמה כדי להוסיף לו בדיקות תקינות מותאמות.
  const registerPassword = document.getElementById('registerPassword');
  // בדיקה אם שדה הסיסמה קיים לפני הוספת מאזינים לאירועים.

  // הצגת הודעה מותאמת אם הסיסמה קצרה מדי, ואיפוסה כשהמשתמשת מתקנת את הקלט.
  registerPassword.addEventListener('invalid', () => {
    // הצגת הודעה מותאמת אם הסיסמה קצרה מדי
    if (registerPassword.validity.tooShort) {
      // הצגת הודעה מותאמת אם הסיסמה קצרה מדי
      registerPassword.setCustomValidity('הסיסמה חייבת להכיל לפחות 8 תווים');
      // הצגת הודעה מותאמת אם הסיסמה קצרה מדי
    }
  });
  registerPassword.addEventListener('input', () => registerPassword.setCustomValidity(''));
  // איפוס הודעת השגיאה כאשר המשתמשת מתחילה להקליד מחדש

  // מעבר מטופס ההתחברות לטופס ההרשמה ועדכון הכותרות בעמוד.
  showRegister.addEventListener('click', () => {
    // מעבר מטופס ההתחברות לטופס ההרשמה ועדכון הכותרות בעמוד
    loginForm.hidden = true;// הסתרת טופס ההתחברות
    registerForm.hidden = false;// הצגת טופס ההרשמה
    document.querySelector('.auth-title').textContent = 'יצירת חשבון משתמש';
    // עדכון הכותרת המשנית בעמוד
    document.querySelector('.auth-subtitle').textContent = 'בחרו שם, אימייל וסיסמה לחשבון';
    // עדכון הכותרת הראשית בעמוד
  });

  // חזרה מטופס ההרשמה לטופס ההתחברות.
  showLogin.addEventListener('click', () => {
    // חזרה מטופס ההרשמה לטופס ההתחברות
    registerForm.hidden = true;
    // הסתרת טופס ההרשמה
    loginForm.hidden = false;
    // הצגת טופס ההתחברות
    document.querySelector('.auth-title').textContent = 'כניסה למערכת';
    // עדכון הכותרת הראשית בעמוד
    document.querySelector('.auth-subtitle').textContent = 'הזינו פרטי גישה להמשך';
    // עדכון הכותרת המשנית בעמוד
  });

  // שליחת פרטי ההתחברות לשרת; במקרה הצלחה עוברים לעמוד הראשי.
  loginForm.addEventListener('submit', async (e) => {
    // מניעת שליחת הטופס באופן רגיל כדי לשלוח את הנתונים לשרת באמצעות JavaScript
    e.preventDefault();

    const email = document.getElementById('username').value.trim();
    // שליפת כתובת האימייל מהשדה המתאים בטופס ההתחברות
    const password = document.getElementById('password').value;
    // שליפת הסיסמה מהשדה המתאים בטופס ההתחברות

    try {
      await login(email, password);
      // במקרה של הצלחה, מציגים הודעה למשתמש ומעבירים אותו לעמוד הראשי
      alert('התחברת בהצלחה!');
      // מעבר לעמוד הראשי של האתר לאחר התחברות מוצלחת
      window.location.href = 'index.html';
      // במקרה של שגיאה, מציגים הודעה מתאימה למשתמש
    } catch (error) {
      // הדפסת השגיאה בקונסול לצורך ניפוי באגים
      console.error('שגיאה בהתחברות:', error);
      // הצגת הודעה מתאימה למשתמש במקרה של שגיאה
      alert(error.message || 'אירעה שגיאה בחיבור לשרת');
    }
  });

  // שליחת פרטי ההרשמה לשרת; לאחר הצלחה ממלאים את האימייל בטופס הכניסה.
  registerForm.addEventListener('submit', async (e) => {
    // מניעת שליחת הטופס באופן רגיל כדי לשלוח את הנתונים לשרת באמצעות JavaScript
    e.preventDefault();
    // שליפת שם המשתמש, כתובת האימייל והסיסמה מהשדות המתאימים בטופס ההרשמה

    const username = document.getElementById('registerName').value.trim();
    // שליפת שם המשתמש מהשדה המתאים בטופס ההרשמה
    const email = document.getElementById('registerEmail').value.trim();
    // שליפת כתובת האימייל מהשדה המתאים בטופס ההרשמה
    const password = document.getElementById('registerPassword').value;
    // שליפת הסיסמה מהשדה המתאים בטופס ההרשמה

    try {
      await registerUser(username, email, password);
      // הצגת הודעה למשתמש על הצלחה בהרשמה
      alert('החשבון נוצר בהצלחה. עכשיו אפשר להתחבר עם האימייל והסיסמה שבחרת.');
      // מעבר לטופס ההתחברות והצגת האימייל שהוזן בטופס ההתחברות
      document.getElementById('username').value = email;
      // איפוס שדה הסיסמה בטופס ההתחברות
      document.getElementById('password').value = '';
      // איפוס שדות הטופס לאחר ההרשמה
      registerForm.reset();
      // מעבר לטופס ההתחברות והצגת האימייל שהוזן בטופס ההתחברות
      showLogin.click();
      // הצגת טופס ההתחברות לאחר ההרשמה
    } catch (error) {
      // הדפסת השגיאה בקונסול לצורך ניפוי באגים
      console.error('שגיאה ביצירת חשבון:', error);
      // הצגת הודעה מתאימה למשתמש במקרה של שגיאה
      alert(error.message || 'אירעה שגיאה ביצירת החשבון');
      // הצגת הודעה מתאימה למשתמש במקרה של שגיאה
    }
  });
});