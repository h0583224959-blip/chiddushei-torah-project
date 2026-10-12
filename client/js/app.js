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
    const itemId = item._id || item.id;
    const card = document.createElement('div');
    card.className = 'item-card';
    card.tabIndex = 0;
    card.setAttribute('role', 'link');
    card.setAttribute('aria-label', `פתיחת הקובץ: ${item.title}`);

    card.innerHTML = `
      <h3>${item.title}</h3>
      <p class="author">מאת: ${item.author}</p>
      ${item.description ? `<p class="desc">${item.description}</p>` : ''}
      <div class="item-actions">
        <button type="button" class="btn download-btn" data-action="download">הורדת קובץ</button>
        ${role === 'admin' ? '<button type="button" class="btn delete-btn" data-action="delete">מחיקה</button>' : ''}
      </div>
    `;

    card.addEventListener('click', (event) => {
      if (!event.target.closest('button')) openItemFile(itemId);
    });
    card.addEventListener('keydown', (event) => {
      if (event.target === card && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        openItemFile(itemId);
      }
    });
    card.querySelector('[data-action="download"]').addEventListener('click', () => {
      triggerDownload(itemId, item.title);
    });
    const deleteButton = card.querySelector('[data-action="delete"]');
    if (deleteButton) {
      deleteButton.addEventListener('click', () => handleDeleteItem(itemId));
    }

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

function openItemFile(itemId) {
  const openUrl = `${window.API_BASE_URL.replace(/\/api$/, '')}/api/items/${encodeURIComponent(itemId)}/open`;
  window.open(openUrl, '_blank', 'noopener,noreferrer');
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