const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// إعداد التخزين للصور (الملفات الشخصية، صور المهارات)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// قواعد بيانات وهمية للتبسيط (يمكن ربطها بـ MongoDB أو PostgreSQL لاحقاً)
let db = {
  users: [],       // المتدربون المسجلون
  complaints: [],  // الشكايات
  announcements: [], // إعلانات المشرفين
  competitions: [],  // المسابقات والنتائج
  starOfTheMonth: null // نجم الشهر
};

// صفحة الترحيب والقوانين والخاناعات الرئيسية
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <title>لجنة الانضباط الذاتية - CAD OFPPT</title>
        <style>
            body { font-family: Tahoma, sans-serif; background: #f4f7f6; margin: 0; padding: 20px; text-align: center; }
            .container { max-width: 800px; margin: auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
            h1 { color: #004d40; }
            .btn-group { margin: 30px 0; display: flex; justify-content: center; gap: 20px; }
            .btn { background: #00796b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; transition: 0.3s; }
            .btn:hover { background: #004d40; }
            .rules { text-align: right; background: #e0f2f1; padding: 15px; border-radius: 5px; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>لجنة الانضباط الذاتية (CAD) - OFPPT</h1>
            <p>مرحباً بك في المنصة الرسمية لتعزيز الانضباط، الالتزام، وتطوير مهارات المتدربين.</p>
            
            <div class="btn-group">
                <a href="/register" class="btn">تسجيل جديد</a>
                <a href="/login" class="btn">تسجيل الدخول</a>
                <a href="/admin-login" class="btn" style="background: #c62828;">صفحة المشرفين</a>
            </div>

            <div class="rules">
                <h3>قوانين ومعايير المؤسسة:</h3>
                <ul>
                    <li>احترام وقفات وحرمة المؤسسة والتوقيت الإداري.</li>
                    <li>التحلي بالأخلاق الحسنة والتعاون الإيجابي بين المتدربين.</li>
                    <li>المشاركة الفعالة في الأنشطة والمسابقات الرسمية.</li>
                </ul>
            </div>
        </div>
    </body>
    </html>
  `);
});

// صفحة التسجيل الجديد
app.get('/register', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head><meta charset="UTF-8"><title>تسجيل جديد</title>
    <style>body{font-family:Tahoma;background:#f4f7f6;padding:20px;text-align:center;} form{background:white;max-width:500px;margin:auto;padding:20px;border-radius:8px;box-shadow:0 2px 5px rgba(0,0,0,0.1);text-align:right;} input, select{width:100%;padding:10px;margin:10px 0;border:1px solid #ccc;border-radius:4px;} button{background:#00796b;color:white;padding:10px;border:none;width:100%;border-radius:4px;font-weight:bold;cursor:pointer;}</style>
    </head>
    <body>
        <form action="/register" method="POST" enctype="multipart/form-data">
            <h2>تسجيل متدرب جديد</h2>
            <label>الإسم والنسب:</label>
            <input type="text" name="fullname" required>
            <label>رقم بطاقة التعريف الوطنية (CIN):</label>
            <input type="text" name="cin" required>
            <label>رقم مسار أو صورة البطاقة (PNJ):</label>
            <input type="file" name="pnj" required>
            <label>القسم / الشعبة:</label>
            <input type="text" name="group" required>
            <label>كلمة المرور:</label>
            <input type="password" name="password" required>
            <button type="submit">إرسال طلب التسجيل</button>
            <p><a href="/">العودة للرئيسية</a></p>
        </form>
    </body>
    </html>
  `);
});

app.post('/register', upload.single('pnj'), (req, res) => {
  const { fullname, cin, group, password } = req.body;
  db.users.push({
    id: Date.now(),
    fullname,
    cin,
    pnj: req.file ? req.file.path : '',
    group,
    password,
    status: 'pending', // قيد الانتظار لحين قبول المشرف
    rank: 'C', // الرتبة الافتراضية
    skills: [],
    languages: [],
    skillImage: ''
  });
  res.send(`<script>alert('تم إرسال طلبك بنجاح، في انتظار مراجعته من طرف المشرفين.'); window.location.href='/';</script>`);
});

// صفحة تسجيل الدخول للمتدربين
app.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head><meta charset="UTF-8"><title>تسجيل الدخول</title>
    <style>body{font-family:Tahoma;background:#f4f7f6;padding:20px;text-align:center;} form{background:white;max-width:400px;margin:auto;padding:20px;border-radius:8px;box-shadow:0 2px 5px rgba(0,0,0,0.1);text-align:right;} input{width:100%;padding:10px;margin:10px 0;border:1px solid #ccc;border-radius:4px;} button{background:#00796b;color:white;padding:10px;border:none;width:100%;border-radius:4px;font-weight:bold;cursor:pointer;}</style>
    </head>
    <body>
        <form action="/login" method="POST">
            <h2>تسجيل دخول المتدرب</h2>
            <label>رقم بطاقة التعريف الوطنية (CIN):</label>
            <input type="text" name="cin" required>
            <label>كلمة المرور:</label>
            <input type="password" name="password" required>
            <button type="submit">دخول</button>
            <p><a href="/">العودة للرئيسية</a></p>
        </form>
    </body>
    </html>
  `);
});

app.post('/login', (req, res) => {
  const { cin, password } = req.body;
  const user = db.users.find(u => u.cin === cin && u.password === password);
  
  if (!user) {
    return res.send(`<script>alert('بيانات غير صحيحة!'); window.location.href='/login';</script>`);
  }
  if (user.status !== 'accepted') {
    return res.send(`<script>alert('حسابك لم يتم قبوله بعد من طرف المشرفين.'); window.location.href='/';</script>`);
  }

  // توجيه المتدرب لصفحته الشخصية
  res.redirect(`/profile?cin=${cin}`);
});

// لوحة تحكم المتدرب الشخصية
app.get('/profile', (req, res) => {
  const { cin } = req.query;
  const user = db.users.find(u => u.cin === cin);
  if (!user) return res.redirect('/login');

  // جلب أحدث إعلان للمشرفين لعرضه في المستطيل العلوي
  const latestAnnouncement = db.announcements[db.announcements.length - 1] || { text: "لا توجد إعلانات جديدة حالياً.", image: "" };
  const isStar = db.starOfTheMonth && db.starOfTheMonth.cin === user.cin;

  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head><meta charset="UTF-8"><title>الملف الشخصي</title>
    <style>
        body{font-family:Tahoma;background:#f4f7f6;margin:0;padding:20px;}
        .announcement-bar{background:#ffeb3b;color:#f57f17;padding:15px;border-radius:5px;text-align:center;font-weight:bold;margin-bottom:20px;border:1px solid #fbc02d;}
        .container{background:white;max-width:800px;margin:auto;padding:20px;border-radius:8px;box-shadow:0 2px 5px rgba(0,0,0,0.1);}
        .badge{background:#4caf50;color:white;padding:5px 10px;border-radius:15px;display:inline-block;font-size:14px;}
        .section{margin-top:20px;padding:15px;background:#e0f2f1;border-radius:5px;}
        input, textarea{width:100%;padding:8px;margin:8px 0;border:1px solid #ccc;border-radius:4px;}
        button{background:#00796b;color:white;padding:10px 15px;border:none;border-radius:4px;cursor:pointer;}
    </style>
    </head>
    <body>
        <div class="announcement-bar">
            📢 إعلان اللجنة: ${latestAnnouncement.text}
            ${latestAnnouncement.image ? `<br><img src="/${latestAnnouncement.image}" width="150" style="margin-top:10px;border-radius:5px;">` : ''}
        </div>

        <div class="container">
            <h2>مرحباً، ${user.fullname}</h2>
            <p><strong>القسم:</strong> ${user.group} | <strong>الرتبة الانضباطية:</strong> <span style="color:red; font-weight:bold;">${user.rank}</span></p>
            ${isStar ? '<div class="badge">🌟 مبروك! لقد تم اختيارك نجم الشهر من طرف لجنة الانضباط الذاتية!</div>' : ''}

            <div class="section">
                <h3>ملفك الشخصي وإضافة المهارات واللغات</h3>
                <form action="/update-profile" method="POST" enctype="multipart/form-data">
                    <input type="hidden" name="cin" value="${user.cin}">
                    <label>المهارات (افصل بينها بفواصل):</label>
                    <input type="text" name="skills" value="${user.skills.join(', ')}">
                    <label>اللغات المتقنة:</label>
                    <input type="text" name="languages" value="${user.languages.join(', ')}">
                    <label>إرسال صورة المهارة / الإنجاز:</label>
                    <input type="file" name="skillImage">
                    <button type="submit">تحديث الملف</button>
                </form>
            </div>

            <div class="section">
                <h3>وضع شكاية للجنة الانضباط</h3>
                <form action="/add-complaint" method="POST">
                    <input type="hidden" name="cin" value="${user.cin}">
                    <textarea name="complaintText" placeholder="اكتب شكايتك أو ملاحظتك هنا بخصوص ظروف التدريب..." required></textarea>
                    <button type="submit">إرسال الشكاية</button>
                </form>
            </div>

            <div class="section">
                <h3>ركن المسابقات</h3>
                <ul>
                    ${db.competitions.map(c => `<li><b>${c.title}</b> - النتيجة: ${c.result || 'جارٍ التنافس...'}</li>`).join('')}
                </ul>
            </div>

            <p style="text-align:center; margin-top:20px;"><a href="/">تسجيل الخروج</a></p>
        </div>
    </body>
    </html>
  `);
});

app.post('/update-profile', upload.single('skillImage'), (req, res) => {
  const { cin, skills, languages } = req.body;
  const user = db.users.find(u => u.cin === cin);
  if (user) {
    user.skills = skills.split(',').map(s => s.trim());
    user.languages = languages.split(',').map(l => l.trim());
    if (req.file) user.skillImage = req.file.path;
  }
  res.redirect(`/profile?cin=${cin}`);
});

app.post('/add-complaint', (req, res) => {
  const { cin, complaintText } = req.body;
  const user = db.users.find(u => u.cin === cin);
  if (user) {
    db.complaints.push({
      id: Date.now(),
      senderName: user.fullname,
      senderCin: user.cin,
      group: user.group,
      text: complaintText
    });
  }
  res.send(`<script>alert('تم إرسال شكايتك بنجاح إلى لجنة الانضباط.'); window.location.href='/profile?cin=${cin}';</script>`);
});

// صفحة تسجيل دخول المشرفين
app.get('/admin-login', (req, res) => {
  res.send(`
    <!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>دخول المشرفين</title>
    <style>body{font-family:Tahoma;background:#f4f7f6;padding:20px;text-align:center;} form{background:white;max-width:400px;margin:auto;padding:20px;border-radius:8px;box-shadow:0 2px 5px rgba(0,0,0,0.1);text-align:right;} input{width:100%;padding:10px;margin:10px 0;border:1px solid #ccc;border-radius:4px;} button{background:#c62828;color:white;padding:10px;border:none;width:100%;border-radius:4px;font-weight:bold;cursor:pointer;}</style>
    </head>
    <body>
        <form action="/admin-dashboard" method="POST">
            <h2>دخول المشرفين (لجنة CAD)</h2>
            <label>كلمة مرور المشرفين:</label>
            <input type="password" name="adminPass" required>
            <button type="submit">دخول لوحة التحكم</button>
            <p><a href="/">العودة للرئيسية</a></p>
        </form>
    </body>
    </html>
  `);
});

// لوحة تحكم المشرفين المتكاملة
app.post('/admin-dashboard', (req, res) => {
  const { adminPass } = req.body;
  if (adminPass !== 'cad2026') { // كلمة المرور الافتراضية للمشرفين
    return res.send(`<script>alert('كلمة مرور المشرفين غير صحيحة!'); window.location.href='/admin-login';</script>`);
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head><meta charset="UTF-8"><title>لوحة تحكم المشرفين - CAD</title>
    <style>
        body{font-family:Tahoma;background:#f4f7f6;margin:0;padding:20px;}
        .container{background:white;max-width:1000px;margin:auto;padding:20px;border-radius:8px;box-shadow:0 2px 5px rgba(0,0,0,0.1);}
        .section{margin-top:25px;padding:15px;background:#f9f9f9;border:1px solid #ddd;border-radius:5px;}
        table{width:100%;border-collapse:collapse;margin-top:10px;}
        th, td{border:1px solid #ccc;padding:8px;text-align:center;}
        th{background:#00796b;color:white;}
        input, textarea, select{width:100%;padding:8px;margin:5px 0;border:1px solid #ccc;border-radius:4px;}
        button{background:#00796b;color:white;padding:8px 15px;border:none;border-radius:4px;cursor:pointer;}
    </style>
    </head>
    <body>
        <div class="container">
            <h2>لوحة تحكم أعضاء لجنة الانضباط الذاتية (CAD)</h2>
            
            <!-- إدارة الإعلانات -->
            <div class="section">
                <h3>نشر إعلان جديد للمتدربين</h3>
                <form action="/admin/add-announcement" method="POST" enctype="multipart/form-data">
                    <textarea name="text" placeholder="اكتب نص الإعلان..." required></textarea>
                    <label>صورة إضافية للإعلان (اختياري):</label>
                    <input type="file" name="annImage">
                    <button type="submit">نشر الإعلان</button>
                </form>
            </div>

            <!-- اختيار نجم الشهر -->
            <div class="section">
                <h3>اختيار نجم الشهر (منح Badge)</h3>
                <form action="/admin/set-star" method="POST">
                    <select name="cin">
                        ${db.users.filter(u => u.status === 'accepted').map(u => `<option value="${u.cin}">${u.fullname} (${u.group})</option>`).join('')}
                    </select>
                    <button type="submit">تعيين كـ نجم الشهر وتفعيل البادج</button>
                </form>
            </div>

            <!-- إدارة المسابقات والنتائج -->
            <div class="section">
                <h3>إدارة المسابقات وإعلان النتائج</h3>
                <form action="/admin/add-competition" method="POST">
                    <input type="text" name="title" placeholder="عنوان المسابقة..." required>
                    <input type="text" name="result" placeholder="النتيجة أو المتسابق الفائز..." required>
                    <button type="submit">حفظ المسابقة وتحديث النتيجة</button>
                </form>
            </div>

            <!-- قبول أو رفض المتسجلين وتحديد الرتب (A, B, C, D) -->
            <div class="section">
                <h3>طلبات التسجيل وإدارة المتدربين والرتب</h3>
                <table>
                    <tr>
                        <th>الإسم والنسب</th>
                        <th>الشعبة</th>
                        <th>بطاقة PNJ</th>
                        <th>الحالة</th>
                        <th>الرتبة</th>
                        <th>الإجراء</th>
                    </tr>
                    ${db.users.map(u => `
                        <tr>
                            <td>${u.fullname}</td>
                            <td>${u.group}</td>
                            <td>${u.pnj ? `<a href="/${u.pnj}" target="_blank">عرض البطاقة</a>` : 'لا توجد'}</td>
                            <td>${u.status === 'pending' ? 'قيد الانتظار' : 'مقبول'}</td>
                            <td>
                                <form action="/admin/update-rank" method="POST" style="display:inline;">
                                    <input type="hidden" name="cin" value="${u.cin}">
                                    <select name="rank" onchange="this.form.submit()">
                                        <option value="A" ${u.rank==='A'?'selected':''}>A</option>
                                        <option value="B" ${u.rank==='B'?'selected':''}>B</option>
                                        <option value="C" ${u.rank==='C'?'selected':''}>C</option>
                                        <option value="D" ${u.rank==='D'?'selected':''}>D</option>
                                    </select>
                                </form>
                            </td>
                            <td>
                                ${u.status === 'pending' ? `<a href="/admin/accept?cin=${u.cin}"><button style="background:green;">قبول</button></a>` : ''}
                                <a href="/admin/delete?cin=${u.cin}"><button style="background:red;">حذف</button></a>
                            </td>
                        </tr>
                    `).join('')}
                </table>
            </div>

            <!-- الاطلاع على الشكايات -->
            <div class="section">
                <h3>شكايات المتدربين</h3>
                <table>
                    <tr>
                        <th>المشتكي</th>
                        <th>القسم</th>
                        <th>الشكاية</th>
                    </tr>
                    ${db.complaints.map(c => `
                        <tr>
                            <td>${c.senderName} (CIN:${c.senderCin})</td>
                            <td>${c.group}</td>
                            <td>${c.text}</td>
                        </tr>
                    `).join('')}
                </table>
            </div>

            <p style="text-align:center; margin-top:20px;"><a href="/">تسجيل الخروج</a></p>
        </div>
    </body>
    </html>
  `);
});

// المسارات الخاصة بالمشرفين
app.post('/admin/add-announcement', upload.single('annImage'), (req, res) => {
  const { text } = req.body;
  db.announcements.push({
    text,
    image: req.file ? req.file.path : ''
  });
  res.redirect('/admin-login'); // ملاحظة: يفضل تمرير الباسورد أو الحفاظ على الجلسة، وللتبسيط نعيد توجيههم
});

app.post('/admin/set-star', (req, res) => {
  const { cin } = req.body;
  const user = db.users.find(u => u.cin === cin);
  if (user) db.starOfTheMonth = user;
  res.redirect('/admin-login');
});

app.post('/admin/add-competition', (req, res) => {
  const { title, result } = req.body;
  db.competitions.push({ title, result });
  res.redirect('/admin-login');
});

app.post('/admin/update-rank', (req, res) => {
  const { cin, rank } = req.body;
  const user = db.users.find(u => u.cin === cin);
  if (user) user.rank = rank;
  res.redirect('/admin-login');
});

app.get('/admin/accept', (req, res) => {
  const { cin } = req.query;
  const user = db.users.find(u => u.cin === cin);
  if (user) user.status = 'accepted';
  res.redirect('/admin-login');
});

app.get('/admin/delete', (req, res) => {
  const { cin } = req.query;
  db.users = db.users.filter(u => u.cin !== cin);
  res.redirect('/admin-login');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});