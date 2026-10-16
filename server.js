const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');

const app = express();
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

// التخزين في الذاكرة المؤقتة لمنع خطأ الكتابة في Vercel
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// الاتصال بقاعدة البيانات
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://username:password@cluster.mongodb.net/cad_ofppt?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

// تعريف النماذج (Models)
const UserSchema = new mongoose.Schema({
  fullname: String,
  cin: { type: String, unique: true },
  pnj: String, // تخزين الصورة بترميز Base64
  group: String,
  password: String,
  status: { type: String, default: 'pending' },
  rank: { type: String, default: 'C' },
  skills: [String],
  languages: [String],
  skillImage: String
});

const ComplaintSchema = new mongoose.Schema({
  senderName: String,
  senderCin: String,
  group: String,
  text: String,
  date: { type: Date, default: Date.now }
});

const AnnouncementSchema = new mongoose.Schema({
  text: String,
  image: String,
  date: { type: Date, default: Date.now }
});

const CompetitionSchema = new mongoose.Schema({
  title: String,
  result: String
});

const SettingsSchema = new mongoose.Schema({
  key: String,
  value: String
});

const User = mongoose.model('User', UserSchema);
const Complaint = mongoose.model('Complaint', ComplaintSchema);
const Announcement = mongoose.model('Announcement', AnnouncementSchema);
const Competition = mongoose.model('Competition', CompetitionSchema);
const Settings = mongoose.model('Settings', SettingsSchema);

// الصفحة الرئيسية
app.get('/', async (req, res) => {
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
            .btn-group { margin: 30px 0; display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; }
            .btn { background: #00796b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .btn:hover { background: #004d40; }
            .rules { text-align: right; background: #e0f2f1; padding: 15px; border-radius: 5px; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>لجنة الانضباط الذاتية (CAD) - OFPPT</h1>
            <p>المنصة الرسمية لتعزيز الانضباط، الالتزام، وتطوير مهارات المتدربين.</p>
            <div class="btn-group">
                <a href="/register" class="btn">تسجيل جديد</a>
                <a href="/login" class="btn">تسجيل الدخول</a>
                <a href="/admin-login" class="btn" style="background: #c62828;">صفحة المشرفين</a>
            </div>
            <div class="rules">
                <h3>قوانين ومعايير المؤسسة:</h3>
                <ul>
                    <li>احترام الأوقات وحرمة المؤسسة والتوقيت الإداري.</li>
                    <li>التحلي بالأخلاق الحسنة والتعاون الإيجابي بين المتدربين.</li>
                    <li>المشاركة الفعالة في الأنشطة والمسابقات الرسمية للجنة.</li>
                </ul>
            </div>
        </div>
    </body>
    </html>
  `);
});

// صفحة التسجيل
app.get('/register', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head><meta charset="UTF-8"><title>تسجيل جديد</title>
    <style>body{font-family:Tahoma;background:#f4f7f6;padding:20px;text-align:center;} form{background:white;max-width:500px;margin:auto;padding:20px;border-radius:8px;box-shadow:0 2px 5px rgba(0,0,0,0.1);text-align:right;} input{width:100%;padding:10px;margin:10px 0;border:1px solid #ccc;border-radius:4px;} button{background:#00796b;color:white;padding:10px;border:none;width:100%;border-radius:4px;font-weight:bold;cursor:pointer;}</style>
    </head>
    <body>
        <form action="/register" method="POST" enctype="multipart/form-data">
            <h2>تسجيل متدرب جديد</h2>
            <label>الإسم والنسب:</label>
            <input type="text" name="fullname" required>
            <label>رقم بطاقة التعريف الوطنية (CIN):</label>
            <input type="text" name="cin" required>
            <label>صورة بطاقة التعريف أو مسار (PNJ):</label>
            <input type="file" name="pnj" accept="image/*" required>
            <label>القسم / الشعبة:</label>
            <input type="text" name="group" required>
            <label>كلمة المرور:</label>
            <input type="password" name="password" required>
            <button type="submit">إرسال طلب التسجيل</button>
            <p style="text-align:center; margin-top:15px;"><a href="/">العودة للرئيسية</a></p>
        </form>
    </body>
    </html>
  `);
});

app.post('/register', upload.single('pnj'), async (req, res) => {
  try {
    const { fullname, cin, group, password } = req.body;
    let imgBase64 = '';
    if (req.file) {
      imgBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const newUser = new User({
      fullname,
      cin,
      pnj: imgBase64,
      group,
      password
    });
    await newUser.save();
    res.send(`<script>alert('تم إرسال طلبك بنجاح، في انتظار مراجعته من طرف المشرفين.'); window.location.href='/';</script>`);
  } catch (err) {
    console.error(err);
    res.send(`<script>alert('خطأ: تعذر التسجيل، يرجى التأكد من عدم تكرار رقم CIN.'); window.location.href='/register';</script>`);
  }
});

// تسجيل الدخول
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
            <p style="text-align:center; margin-top:15px;"><a href="/">العودة للرئيسية</a></p>
        </form>
    </body>
    </html>
  `);
});

app.post('/login', async (req, res) => {
  const { cin, password } = req.body;
  const user = await User.findOne({ cin, password });
  
  if (!user) {
    return res.send(`<script>alert('بيانات الدخول غير صحيحة!'); window.location.href='/login';</script>`);
  }
  if (user.status !== 'accepted') {
    return res.send(`<script>alert('حسابك لم يتم قبوله بعد من طرف المشرفين.'); window.location.href='/';</script>`);
  }

  res.redirect(`/profile?cin=${cin}`);
});

// الملف الشخصي
app.get('/profile', async (req, res) => {
  const { cin } = req.query;
  const user = await User.findOne({ cin });
  if (!user) return res.redirect('/login');

  const latestAnnouncement = await Announcement.findOne().sort({ date: -1 }) || { text: "لا توجد إعلانات جديدة حالياً.", image: "" };
  const starSetting = await Settings.findOne({ key: 'starOfTheMonth' });
  const isStar = starSetting && starSetting.value === user.cin;
  const competitions = await Competition.find();

  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head><meta charset="UTF-8"><title>الملف الشخصي</title>
    <style>
        body{font-family:Tahoma;background:#f4f7f6;margin:0;padding:20px;}
        .announcement-bar{background:#ffeb3b;color:#f57f17;padding:15px;border-radius:5px;text-align:center;font-weight:bold;margin-bottom:20px;border:1px solid #fbc02d;}
        .container{background:white;max-width:800px;margin:auto;padding:20px;border-radius:8px;box-shadow:0 2px 5px rgba(0,0,0,0.1);}
        .badge{background:#4caf50;color:white;padding:8px 15px;border-radius:20px;display:inline-block;font-size:15px;margin-top:10px;}
        .section{margin-top:20px;padding:15px;background:#e0f2f1;border-radius:5px;}
        input, textarea{width:100%;padding:8px;margin:8px 0;border:1px solid #ccc;border-radius:4px;}
        button{background:#00796b;color:white;padding:10px 15px;border:none;border-radius:4px;cursor:pointer;}
    </style>
    </head>
    <body>
        <div class="announcement-bar">
            📢 إعلان اللجنة: ${latestAnnouncement.text}
            ${latestAnnouncement.image ? `<br><img src="${latestAnnouncement.image}" width="200" style="margin-top:10px;border-radius:5px;">` : ''}
        </div>

        <div class="container">
            <h2>مرحباً، ${user.fullname}</h2>
            <p><strong>القسم:</strong> ${user.group} | <strong>الرتبة الانضباطية:</strong> <span style="color:red; font-weight:bold;">${user.rank}</span></p>
            ${isStar ? '<div class="badge">🌟 مبارك! تم اختيارك "نجم الشهر" من طرف لجنة الانضباط الذاتية مع بادج معتمد.</div>' : ''}

            <div class="section">
                <h3>ملفك الشخصي (إضافة المهارات واللغات)</h3>
                <form action="/update-profile" method="POST" enctype="multipart/form-data">
                    <input type="hidden" name="cin" value="${user.cin}">
                    <label>المهارات (افصل بينها بفواصل):</label>
                    <input type="text" name="skills" value="${user.skills.join(', ')}">
                    <label>اللغات المتقنة:</label>
                    <input type="text" name="languages" value="${user.languages.join(', ')}">
                    <label>إرسال صورة إثبات المهارة / العمل:</label>
                    <input type="file" name="skillImage" accept="image/*">
                    <button type="submit">تحديث الملف</button>
                </form>
            </div>

            <div class="section">
                <h3>وضع شكاية أو ملاحظة للجنة</h3>
                <form action="/add-complaint" method="POST">
                    <input type="hidden" name="cin" value="${user.cin}">
                    <textarea name="complaintText" placeholder="اكتب شكايتك بخصوص ظروف التكوين..." required></textarea>
                    <button type="submit">إرسال الشكاية</button>
                </form>
            </div>

            <div class="section">
                <h3>ركن المسابقات والنتائج</h3>
                <ul>
                    ${competitions.map(c => `<li><b>${c.title}</b> - النتيجة: ${c.result || 'قيد المنافسة'}</li>`).join('')}
                </ul>
            </div>

            <p style="text-align:center; margin-top:20px;"><a href="/">تسجيل الخروج</a></p>
        </div>
    </body>
    </html>
  `);
});

app.post('/update-profile', upload.single('skillImage'), async (req, res) => {
  const { cin, skills, languages } = req.body;
  const updateData = {
    skills: skills ? skills.split(',').map(s => s.trim()) : [],
    languages: languages ? languages.split(',').map(l => l.trim()) : []
  };
  if (req.file) {
    updateData.skillImage = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
  }

  await User.findOneAndUpdate({ cin }, updateData);
  res.redirect(`/profile?cin=${cin}`);
});

app.post('/add-complaint', async (req, res) => {
  const { cin, complaintText } = req.body;
  const user = await User.findOne({ cin });
  if (user) {
    await Complaint.create({
      senderName: user.fullname,
      senderCin: user.cin,
      group: user.group,
      text: complaintText
    });
  }
  res.send(`<script>alert('تم إرسال شكايتك بنجاح.'); window.location.href='/profile?cin=${cin}';</script>`);
});

// المشرفين
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
            <p style="text-align:center; margin-top:15px;"><a href="/">العودة للرئيسية</a></p>
        </form>
    </body>
    </html>
  `);
});

app.post('/admin-dashboard', async (req, res) => {
  const { adminPass } = req.body;
  if (adminPass !== 'cad2026') {
    return res.send(`<script>alert('كلمة المرور غير صحيحة!'); window.location.href='/admin-login';</script>`);
  }

  const users = await User.find();
  const complaints = await Complaint.find().sort({ date: -1 });
  const competitions = await Competition.find();

  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head><meta charset="UTF-8"><title>لوحة تحكم المشرفين - CAD</title>
    <style>
        body{font-family:Tahoma;background:#f4f7f6;margin:0;padding:20px;}
        .container{background:white;max-width:1100px;margin:auto;padding:20px;border-radius:8px;box-shadow:0 2px 5px rgba(0,0,0,0.1);}
        .section{margin-top:25px;padding:15px;background:#f9f9f9;border:1px solid #ddd;border-radius:5px;}
        table{width:100%;border-collapse:collapse;margin-top:10px;}
        th, td{border:1px solid #ccc;padding:8px;text-align:center;font-size:14px;}
        th{background:#00796b;color:white;}
        input, textarea, select{width:100%;padding:8px;margin:5px 0;border:1px solid #ccc;border-radius:4px;}
        button{background:#00796b;color:white;padding:8px 12px;border:none;border-radius:4px;cursor:pointer;}
    </style>
    </head>
    <body>
        <div class="container">
            <h2>لوحة تحكم لجنة الانضباط الذاتية (CAD)</h2>
            
            <div class="section">
                <h3>نشر إعلان جديد للمتدربين</h3>
                <form action="/admin/add-announcement" method="POST" enctype="multipart/form-data">
                    <textarea name="text" placeholder="اكتب نص الإعلان التوجيهي..." required></textarea>
                    <label>صورة إضافية للإعلان:</label>
                    <input type="file" name="annImage" accept="image/*">
                    <button type="submit">نشر الإعلان</button>
                </form>
            </div>

            <div class="section">
                <h3>اختيار نجم الشهر (منح البادج)</h3>
                <form action="/admin/set-star" method="POST">
                    <select name="cin">
                        ${users.filter(u => u.status === 'accepted').map(u => `<option value="${u.cin}">${u.fullname} (${u.group})</option>`).join('')}
                    </select>
                    <button type="submit">تحديد كـ نجم الشهر</button>
                </form>
            </div>

            <div class="section">
                <h3>إدارة المسابقات والنتائج</h3>
                <form action="/admin/add-competition" method="POST">
                    <input type="text" name="title" placeholder="اسم المسابقة / التحدي" required>
                    <input type="text" name="result" placeholder="نتيجة أو اسم الفائز" required>
                    <button type="submit">إضافة / تحديث المسابقة</button>
                </form>
            </div>

            <div class="section">
                <h3>إدارة المتدربين والقبول والتصنيف (A - B - C - D)</h3>
                <table>
                    <tr>
                        <th>الإسم والنسب</th>
                        <th>الشعبة</th>
                        <th>صورة البطاقة</th>
                        <th>المهارات</th>
                        <th>الحالة</th>
                        <th>الرتبة</th>
                        <th>إجراءات</th>
                    </tr>
                    ${users.map(u => `
                        <tr>
                            <td>${u.fullname}<br><small>${u.cin}</small></td>
                            <td>${u.group}</td>
                            <td>${u.pnj ? `<img src="${u.pnj}" width="80" style="border-radius:4px;">` : 'لا توجد'}</td>
                            <td>${u.skills.join(', ')} <br>${u.skillImage ? `<img src="${u.skillImage}" width="60">` : ''}</td>
                            <td>${u.status === 'pending' ? 'قيد الانتظار' : 'مقبول'}</td>
                            <td>
                                <form action="/admin/update-rank" method="POST">
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
                                ${u.status === 'pending' ? `<a href="/admin/accept?cin=${u.cin}"><button style="background:green; margin-bottom:5px;">قبول</button></a>` : ''}
                                <a href="/admin/delete?cin=${u.cin}"><button style="background:red;">حذف</button></a>
                            </td>
                        </tr>
                    `).join('')}
                </table>
            </div>

            <div class="section">
                <h3>شكايات المتدربين الواردة</h3>
                <table>
                    <tr>
                        <th>المشتكي</th>
                        <th>القسم</th>
                        <th>نص الشكاية</th>
                        <th>التاريخ</th>
                    </tr>
                    ${complaints.map(c => `
                        <tr>
                            <td>${c.senderName} (${c.senderCin})</td>
                            <td>${c.group}</td>
                            <td>${c.text}</td>
                            <td>${new Date(c.date).toLocaleDateString('ar-MA')}</td>
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

app.post('/admin/add-announcement', upload.single('annImage'), async (req, res) => {
  let imgBase64 = '';
  if (req.file) {
    imgBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
  }
  await Announcement.create({
    text: req.body.text,
    image: imgBase64
  });
  res.redirect('/admin-login');
});

app.post('/admin/set-star', async (req, res) => {
  await Settings.findOneAndUpdate(
    { key: 'starOfTheMonth' },
    { value: req.body.cin },
    { upsert: true }
  );
  res.redirect('/admin-login');
});

app.post('/admin/add-competition', async (req, res) => {
  await Competition.create({
    title: req.body.title,
    result: req.body.result
  });
  res.redirect('/admin-login');
});

app.post('/admin/update-rank', async (req, res) => {
  await User.findOneAndUpdate({ cin: req.body.cin }, { rank: req.body.rank });
  res.redirect('/admin-login');
});

app.get('/admin/accept', async (req, res) => {
  await User.findOneAndUpdate({ cin: req.query.cin }, { status: 'accepted' });
  res.redirect('/admin-login');
});

app.get('/admin/delete', async (req, res) => {
  await User.findOneAndDelete({ cin: req.query.cin });
  res.redirect('/admin-login');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
