// מערך גלובלי לשמירת הפריטים המקוריים לצורך סינון בחיפוש
let allItems = [];

// ============================================================
// פונקציה 1: הצגת הפריטים על המסך (renderItems)
// ============================================================
function renderItems(items) {
  const container = document.getElementById('items-container');
  if (!container) return;

  container.innerHTML = '';

  if (items.length === 0) {
    container.innerHTML = '<p class="no-items">לא נמצאו פריטים להצגה.</p>';
    return;
  }

  const role = localStorage.getItem('role');

  items.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'item-card';

    // יצירת מבנה הכרטיס עם כותרת, מחבר וכפתור הורדה
    card.innerHTML = `
      <h3>${item.title}</h3>
      <p class="author">מאת: ${item.author}</p>
      ${item.description ? `<p class="desc">${item.description}</p>` : ''}
      <button type="button" class="btn download-btn" onclick="triggerDownload('${item.fileUrl}', '${item.title}')">הורדת קובץ</button>
      ${
        role === 'admin'
          ? `<button class="btn delete-btn" onclick="handleDeleteItem('${item._id}')">מחיקה</button>`
          : ''
      }
    `;

    container.appendChild(card);
  });
}

// ============================================================
// פונקציה 2: סינון וחיפוש פריטים בזמן אמת (setupSearch)
// ============================================================
function setupSearch(items) {
  allItems = items;
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (event) => {
    const searchTerm = event.target.value.trim().toLowerCase();

    const filtered = allItems.filter((item) => {
      const matchTitle = item.title && item.title.toLowerCase().includes(searchTerm);
      const matchAuthor = item.author && item.author.toLowerCase().includes(searchTerm);
      return matchTitle || matchAuthor;
    });

    renderItems(filtered);
  });
}

// ============================================================
// פונקציה 3: טיפול בטופס הוספת פריט (handleFormSubmit)
// ============================================================
async function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  try {
    // קריאה לפונקציה createItem שנמצאת בקובץ api.js של השותפה
    await createItem(formData);

    alert('הפריט נוסף בהצלחה!');
    form.reset();

    // רענון רשימת הפריטים מחדש מהשרת
    const updatedItems = await getItems();
    allItems = updatedItems;
    renderItems(updatedItems);
  } catch (error) {
    alert('שגיאה בהוספת הפריט: ' + error.message);
  }
}

// ============================================================
// פונקציה 4: ניהול תצוגת הרשאות מנהל (checkAdminState)
// ============================================================
function checkAdminState() {
  const role = localStorage.getItem('role');
  const adminElements = document.querySelectorAll('.admin-only');

  adminElements.forEach((el) => {
    if (role === 'admin') {
      el.style.display = ''; // מציג את האלמנט
    } else {
      el.style.display = 'none'; // מסתיר מהמשתמש הרגיל
    }
  });
}

// פונקציית עזר למחיקת פריט בלחיצה על כפתור המחיקה
async function handleDeleteItem(id) {
  if (!confirm('האם את בטוחה שברצונך למחוק פריט זה?')) return;

  try {
    await deleteItem(id);
    allItems = allItems.filter((item) => item._id !== id);
    renderItems(allItems);
  } catch (error) {
    alert('שגיאה במחיקת הפריט: ' + error.message);
  }
}

// ============================================================
// הפעלה אוטומטית ברגע שהדף נטען
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  // 1. עדכון כפתור כניסה/יציאה ושם המשתמש בסרגל העליון
  const authBtn = document.getElementById('authActionBtn');
  const userNameDisplay = document.getElementById('userNameDisplay');
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (token) {
    if (userNameDisplay) userNameDisplay.textContent = `שלום, ${role === 'admin' ? 'מנהל' : 'משתמש'}`;
    if (authBtn) {
      authBtn.textContent = 'התנתקות';
      authBtn.href = '#';
      authBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
        window.location.reload();
      });
    }
  }

  // 2. בדיקת הרשאות מנהל ועדכון תצוגה
  checkAdminState();

  // 3. האזנה לשליחת טופס ההוספה (אם קיים בדף)
  const uploadForm = document.getElementById('upload-form');
  if (uploadForm) {
    uploadForm.addEventListener('submit', handleFormSubmit);
  }

  // 4. טעינת הפריטים הראשונית מהשרת
  try {
    if (typeof getItems === 'function') {
      const items = await getItems();
      renderItems(items);
      setupSearch(items);
    }
  } catch (err) {
    console.error('שגיאה בטעינת הנתונים:', err);
  }
});

// ============================================================
// פונקציית הורדת קובץ
// ============================================================
async function triggerDownload(url, title) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;

    const extension = url.split('.').pop();
    a.download = `${title || 'file'}.${extension}`;

    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('שגיאה בהורדת הקובץ:', error);
    alert('שגיאה בהורדת הקובץ');
  }
}