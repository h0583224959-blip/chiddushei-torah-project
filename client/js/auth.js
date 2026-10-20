// ממתין לכך שכל מבנה ה-HTML ייטען במלואו לפני הרצת הקוד
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  const registerForm = document.getElementById('registerForm');
  const showRegister = document.getElementById('showRegister');
  const showLogin = document.getElementById('showLogin');
  const registerPassword = document.getElementById('registerPassword');

  registerPassword.addEventListener('invalid', () => {
    if (registerPassword.validity.tooShort) {
      registerPassword.setCustomValidity('הסיסמה חייבת להכיל לפחות 8 תווים');
    }
  });
  registerPassword.addEventListener('input', () => registerPassword.setCustomValidity(''));

  showRegister.addEventListener('click', () => {
    loginForm.hidden = true;
    registerForm.hidden = false;
    document.querySelector('.auth-title').textContent = 'יצירת חשבון משתמש';
    document.querySelector('.auth-subtitle').textContent = 'בחרו שם, אימייל וסיסמה לחשבון';
  });

  showLogin.addEventListener('click', () => {
    registerForm.hidden = true;
    loginForm.hidden = false;
    document.querySelector('.auth-title').textContent = 'כניסה למערכת';
    document.querySelector('.auth-subtitle').textContent = 'הזינו פרטי גישה להמשך';
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    try {
      await login(email, password);
      alert('התחברת בהצלחה!');
      window.location.href = 'index.html';
    } catch (error) {
      console.error('שגיאה בהתחברות:', error);
      alert(error.message || 'אירעה שגיאה בחיבור לשרת');
    }
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;

    try {
      await registerUser(username, email, password);
      alert('החשבון נוצר בהצלחה. עכשיו אפשר להתחבר עם האימייל והסיסמה שבחרת.');
      document.getElementById('username').value = email;
      document.getElementById('password').value = '';
      registerForm.reset();
      showLogin.click();
    } catch (error) {
      console.error('שגיאה ביצירת חשבון:', error);
      alert(error.message || 'אירעה שגיאה ביצירת החשבון');
    }
  });
});