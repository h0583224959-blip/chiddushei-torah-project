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
    formData.append('audio', fileInput.files[0]); // שליחת הקובץ עצמו

    try {
      // אם הפונקציה createItem מוגדרת ב-api.js, נשתמש בה
      if (typeof createItem === 'function') {
        await createItem(formData);
      } else {
        // גיבוי: שליחה ישירה לשרת אם api.js לא נטען
        const response = await fetch('http://localhost:5000/api/items', {
          method: 'POST',
          body: formData // בעבודה עם FormData הדפדפן מוסיף לבד את ה-Headers המתאימים
        });

        if (!response.ok) {
          throw new Error('שגיאה בשמירת הפריט');
        }
      }
      alert('הפריט נשמר בהצלחה!');
      // חזרה לדף הראשי לצפייה בפריט החדש ברשימה
      window.location.href = 'index.html';
    } catch (error) {
      console.error('שגיאה בשמירת הטופס:', error);
      alert('שגיאה בהעלאה: ' + error.message);
    }
  });
});