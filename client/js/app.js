let allItems = [];

window.API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

function renderItems(items) {
  const container = document.getElementById('items-container');
  if (!container) return;

  container.innerHTML = '';

  if (!items || items.length === 0) {
    container.innerHTML = '<p class="no-items">לא נמצאו פריטים להצגה.</p>';
    return;
  }

  const role = localStorage.getItem('role');

  items.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'item-card';

    card.innerHTML = `
      <h3>${item.title}</h3>
      <p class="author">מאת: ${item.author}</p>
      ${item.description ? `<p class="desc">${item.description}</p>` : ''}
      <button type="button" class="btn download-btn" onclick="triggerDownload('${item._id || item.id}', '${item.title}')">
        הורדת קובץ
      </button>
      ${
        role === 'admin'
          ? `<button class="btn delete-btn" onclick="handleDeleteItem('${item._id || item.id}')">מחיקה</button>`
          : ''
      }
    `;

    container.appendChild(card);
  });
}

function setupSearch(items) {
  allItems = items;

  const searchInput = document.getElementById('search-input');
  const searchForm = document.getElementById('search-form');

  if (!searchInput) return;

  const filterItems = () => {
    const searchTerm = searchInput.value.trim().toLowerCase();

    const filtered = allItems.filter((item) => {
      const matchTitle = item.title && item.title.toLowerCase().includes(searchTerm);
      const matchAuthor = item.author && item.author.toLowerCase().includes(searchTerm);
      return matchTitle || matchAuthor;
    });

    renderItems(filtered);
  };

  searchInput.addEventListener('input', filterItems);

  if (searchForm) {
    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      filterItems();
    });
  }
}

async function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  try {
    await createItem(formData);

    alert('הפריט נוסף בהצלחה!');
    form.reset();

    const updatedItems = await getItems();
    allItems = updatedItems;
    renderItems(updatedItems);
  } catch (error) {
    alert('שגיאה בהוספת הפריט: ' + error.message);
  }
}

function checkAdminState() {
  const role = localStorage.getItem('role');
  const adminElements = document.querySelectorAll('.admin-only');

  adminElements.forEach((el) => {
    el.style.display = role === 'admin' ? '' : 'none';
  });
}

async function handleDeleteItem(id) {
  if (!confirm('האם את בטוחה שברצונך למחוק פריט זה?')) return;

  try {
    await deleteItem(id);
    allItems = allItems.filter((item) => (item._id || item.id) !== id);
    renderItems(allItems);
  } catch (error) {
    alert('שגיאה במחיקת הפריט: ' + error.message);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const authBtn = document.getElementById('authActionBtn');
  const userNameDisplay = document.getElementById('userNameDisplay');
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (token) {
    if (userNameDisplay) {
      userNameDisplay.textContent = `שלום, ${role === 'admin' ? 'מנהל' : 'משתמש'}`;
    }

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

  checkAdminState();

  const uploadForm = document.getElementById('upload-form');
  if (uploadForm) {
    uploadForm.addEventListener('submit', handleFormSubmit);
  }

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

function getFileExtension(fileName) {
  const match = fileName && fileName.match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : '';
}

async function triggerDownload(itemId, title) {
  try {
    const item = allItems.find((i) => (i._id || i.id) === itemId);
    const fileUrl = item ? (item.fileUrl || item.file) : null;
    const downloadUrl = `${window.API_BASE_URL.replace(/\/api$/, '')}/api/items/${encodeURIComponent(itemId)}/download`;

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.download = (title || 'קובץ') + (getFileExtension(fileUrl || '') ? '.' + getFileExtension(fileUrl || '') : '');

    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (error) {
    console.error('שגיאה בהורדת הקובץ:', error);
    alert(`שגיאה בהורדת הקובץ: ${error.message}`);
  }
}