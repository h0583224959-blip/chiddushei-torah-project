// ממתין לטעינת מבנה המסמך
document.addEventListener('DOMContentLoaded', () => {
  // תפיסת אלמנט הטופס המפורט
  const form = document.getElementById('itemDetailForm');

  // עצירה אם הטופס אינו קיים בעמוד הנוכחי
  if (!form) return;

  // האזנה לשליחת הטופס
  form.addEventListener('submit', async (e) => {
    // מניעת רענון הדף
    e.preventDefault();

    // שליפת הערכים מכל שדות הטופס
    const title = document.getElementById('fullTitle').value.trim();
    const author = document.getElementById('fullAuthor').value.trim();
    const description = document.getElementById('fullDesc').value.trim();
    const fileInput = document.getElementById('mediaFile');

    // בדיקה שנבחר קובץ להעלאה
    if (!fileInput.files || fileInput.files.length === 0) {
      alert('יש לבחור קובץ להעלאה');
      return;
    }

    // שימוש ב-FormData כדי לאפשר שליחת קבצים בינאריים לצד שדות טקסט
    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('description', description);
    
    // שליחת הקובץ תחת השם 'file' (תואם להגדרת ה-multer בשרת)
    formData.append('file', fileInput.files[0]);

    // שליפת טוקן ההתחברות של המשתמשת
    const token = localStorage.getItem('token');

    try {
      // אם מוגדרת פונקציה מסודרת ב-api.js
      if (typeof createItem === 'function') {
        await createItem(formData);
      } else {
        // שליחה ישירה לשרת
        const baseUrl = window.API_BASE_URL || 'http://localhost:5000';
        
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${baseUrl}/api/items`, {
          method: 'POST',
          headers: headers,
          body: formData
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || 'שגיאה בשמירת הפריט');
        }
      }

      alert('הפריט נשמר בהצלחה!');
      window.location.href = 'index.html';
    } catch (error) {
      console.error('שגיאה בשמירת הטופס:', error);
      alert('שגיאה בהעלאה: ' + error.message);
    }
  });
});