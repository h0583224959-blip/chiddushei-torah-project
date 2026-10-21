
# chiddushei-torah-project
# אוצר החידושים

ספרייה דיגיטלית של חידושי תורה ("בית מדרש דיגיטלי").
מנהלים מעלים חידושים, ומשתמשים רשומים צופים בהם ומורידים אותם.

כל חידוש (פריט) כולל כותרת, מחבר, תיאור אופציונלי וקובץ מצורף.

## מה אפשר לעשות באתר

| פעולה | משתמש רגיל | מנהל |
|---|:---:|:---:|
| הרשמה והתחברות | ✔ | ✔ |
| צפייה ברשימת הפריטים | ✔ | ✔ |
| פתיחת קובץ בדפדפן | ✔ | ✔ |
| הורדת קובץ למחשב | ✔ | ✔ |
| הוספת פריט | ✘ | ✔ |
| עריכת פריט | ✘ | ✔ |
| מחיקת פריט | ✘ | ✔ |

הצפייה בפריטים מחייבת התחברות. המנהלים מוגדרים מראש בקובץ `.env` (ראו בהמשך), ואי אפשר להפוך למנהל דרך ההרשמה.

**סוגי קבצים מותרים:** תמונות (jpg, jpeg, png, gif, webp), שמע (mp3, m4a, wav, ogg, aac), וידאו (mp4, mov, avi) ו-PDF.
**גודל מקסימלי:** 20MB לקובץ.

## טכנולוגיות

- **שרת:** Node.js ו-Express 5
- **מסד נתונים:** MongoDB עם Mongoose
- **אימות והרשאות:** JWT ו-bcryptjs
- **בדיקת נתונים:** Joi
- **העלאת קבצים:** Multer ו-Cloudinary
- **אתר:** HTML, CSS ו-JavaScript רגיל (ללא ספריות)

## מבנה הפרויקט

```
chiddushei-torah-project/
├── server/
│   ├── server.js          נקודת הכניסה: מחבר הכול ומפעיל את השרת
│   ├── routes/            הכתובות (userRoutes, itemRoutes)
│   ├── middlewares/       בדיקות באמצע: הרשאות, ולידציה, העלאת קבצים, שגיאות
│   ├── controllers/       הלוגיקה של כל פעולה
│   └── models/            מבנה הנתונים במסד (User, Item)
├── client/
│   ├── index.html         העמוד הראשי
│   ├── login.html         התחברות והרשמה
│   ├── css/
│   └── js/                api.js (תקשורת עם השרת), auth.js, app.js
└── package.json
```

בקשה עוברת בשרת בסדר הזה:
`routes` ← `middlewares` ← `controllers` ← `models` ← מסד הנתונים.

## הרצה מקומית

### דרישות מוקדמות

- Node.js
- מסד MongoDB (למשל חשבון חינמי ב-MongoDB Atlas)
- חשבון Cloudinary לאחסון הקבצים

### שלבים

1. התקנת החבילות:

   ```bash
   npm install
   ```

2. יצירת הקובץ `server/.env` עם המשתנים הבאים (הערכים שלכם, לא מעלים אותו ל-Git):

   ```env
   MONGO_URI=
   JWT_SECRET=
   ADMIN_EMAIL_1=
   ADMIN_PASSWORD_1=
   ADMIN_EMAIL_2=
   ADMIN_PASSWORD_2=
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   ```

   - `MONGO_URI` ו-`JWT_SECRET` הם חובה. בלעדיהם השרת לא יעלה.
   - `ADMIN_EMAIL_2` ו-`ADMIN_PASSWORD_2` הם אופציונליים אם יש מנהל אחד.
   - אפשר להוסיף `PORT`. ברירת המחדל היא 5000.

3. הפעלת השרת:

   ```bash
   npm start
   ```

   לפיתוח, עם הפעלה מחדש אוטומטית בכל שינוי:

   ```bash
   npm run dev
   ```

4. פתיחת האתר: פותחים את `client/login.html` בדפדפן (למשל עם התוסף Live Server של VS Code).
   בקובץ `client/js/api.js` כתובת השרת מוגדרת ב-`BASE_URL` (ברירת מחדל: `http://localhost:5000/api`).

## נתיבי ה-API

כתובת בסיס: `/api`

### משתמשים

| שיטה | נתיב | תיאור |
|---|---|---|
| POST | `/users/register` | רישום משתמש חדש (username, email, password מינימום 8 תווים) |
| POST | `/users/login` | התחברות. מחזיר טוקן ופרטי משתמש |

### פריטים

הטוקן נשלח בכותרת `Authorization: Bearer <token>`.

| שיטה | נתיב | הרשאה | תיאור |
|---|---|---|---|
| GET | `/items` | מחובר | רשימת כל הפריטים, מהחדש לישן |
| GET | `/items/:id` | מחובר | פריט בודד |
| GET | `/items/:id/open` | מחובר | פתיחת הקובץ בדפדפן |
| GET | `/items/:id/download` | מחובר | הורדת הקובץ |
| POST | `/items` | מנהל | יצירת פריט (`multipart/form-data`: title, author, description, file) |
| PUT | `/items/:id` | מנהל | עדכון כותרת, מחבר או תיאור |
| DELETE | `/items/:id` | מנהל | מחיקת פריט |

## העלאה לענן (Render)

- **השרת** כ-Web Service: Build Command `npm install`, Start Command `npm start`, ואת משתני ה-`.env` מגדירים בממשק של Render.
- **האתר** כ-Static Site: Root Directory `client`.
- לפני העלאה צריך לעדכן את `BASE_URL` ב-`client/js/api.js` לכתובת השרת שקיבלתם מ-Render, עם `/api` בסוף.
- `MONGO_URI` חייב להצביע על מסד בענן, ובמסד ב-Atlas צריך לאפשר חיבור מכתובת שאינה מקומית.

## הערות אבטחה

- הקובץ `.env` מופיע ב-`.gitignore` ולא עולה ל-Git. אין להעלות אותו.
- הסתרת כפתורים באתר היא רק למראה. ההרשאות נאכפות בשרת.
- הטוקן תקף ל-7 ימים.
