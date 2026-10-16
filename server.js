const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');

const app = express();
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

// التخزين المؤقت لمنع أخطاء الكتابة في Vercel
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// الاتصال بقاعدة البيانات
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://username:password@cluster.mongodb.net/cad_ofppt?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

// الموديلات (Schemas)
const UserSchema = new mongoose.Schema({
  fullname: String,
  cin: { type: String, unique: true },
  pnj: String,         // بطاقة مسار/التعريف
  avatar: String,      // الصورة الشخصية
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
  status: { type: String, default: 'قيد الدراسة' }, // قيد الدراسة أو تمت المعالجة
  response: { type: String, default: '' },
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

// الأنماط المشتركة CSS
const commonCSS = `
  <style>
    :root {
      --primary: #004d40;
      --primary-light: #00796b;
      --secondary: #ffb300;
      --bg: #f4f7f6;
      --card-bg: #ffffff;
      --text: #263238;
      --danger: #d32f2f;
      --success: #388e3c;
    }
    * { box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    body { background: var(--bg); color: var(--text); margin: 0; padding: 20px; direction: rtl; text-align: right; }
    .container { max-width: 950px; margin: auto; background: var(--card-bg); padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
    h1, h2, h3 { color: var(--primary); }
    .btn { background: var(--primary-light); color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; border: none; cursor: pointer; display: inline-block; transition: 0.2s; }
    .btn:hover { background: var(--primary); }
    .btn-danger { background: var(--danger); }
    .btn-danger:hover { background: #b71c1c; }
    .btn-success { background: var(--success); }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 25px; }
    .stat-card { background: #e0f2f1; padding: 15px; border-radius: 8px; text-align: center; border-right: 5px solid var(--primary-light); }
    .stat-card h3 { margin: 0; font-size: 24px; color: var(--primary); }
    .stat-card p { margin: 5px 0 0; color: #555; font-size: 14px; }
    .announcement-bar { background: linear-gradient(90deg, #fff8e1, #ffecb3); color: #8f6b00; padding: 15px; border-radius: 8px; margin-bottom: 25px; border: 1px solid #ffe082; text-align: center; }
    .section { background: #fafafa; padding: 20px; border-radius: 8px; border: 1px solid #eee; margin-top: 20px; }
    input, textarea, select { width: 100%; padding: 10px; margin: 8px 0; border: 1px solid #ccc; border-radius: 6px; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; background: white; }
    th, td { border: 1px solid #e0e0e0; padding: 12px; text-align: center; font-size: 14px; }
    th { background: var(--primary-light); color: white; }
    .badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; color: white; display: inline-block; font-weight: bold; }
    .badge-a { background: #2e7d32; }
    .badge-b { background: #0288d1; }
    .badge-c { background: #f57c00; }
    .badge-d { background: #c62828; }
    .user-avatar { width: 90px; height: 90px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary-light); }
  </style>
`;

// الرئيسية
app.get('/', async (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head><meta charset="UTF-8"><title>لجنة الانضباط الذاتية - CAD OFPPT</title>${commonCSS}</head>
    <body>
        <div class="container" style="text-align:center;">
            <h1>🏛️ لجنة الانضباط الذاتية (CAD)</h1>
            <p>مؤسسة التكوين المهني وإنعاش الشغل - منصة التواصل والالتزام والتميز</p>
            
            <div style="margin: 30px 0; display:flex; justify-content:center; gap:15px; flex-wrap:wrap;">
                <a href="/register" class="btn">📝 تسجيل جديد</a>
                <a href="/login" class="btn">🔐 تسجيل الدخول</a>
                <a href="/admin-login" class="btn btn-danger">👨‍💼 لوحة المشرفين</a>
            </div>

            <div class="section" style="text-align:right;">
                <h3>📜 القوانين والمعايير الانضباطية المطلوبة:</h3>
                <ul>
                    <li>الالتزام التام بالتوقيت الإداري وأحكام الميثاق الداخلي للمؤسسة.</li>
                    <li>ارتداء الهندام اللائق واحترام كافة المتدربين والمسؤولين.</li>
                    <li>المشاركة والمساهمة الفعالة في الأنشطة الموازية والمسابقات.</li>
                </ul>
            </div>
        </div>
    </body>
    </html>
  `);
});

// التسجيل
app.get('/register', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head><meta charset="UTF-8"><title>تسجيل جديد</title>${commonCSS}</head>
    <body>
        <div class="container" style="max-width:550px;">
            <h2>📝 طلب تسجيل متدرب جديد</h2>
            <form action="/register" method="POST" enctype="multipart/form-data">
                <label>الإسم والنسب الكامل:</label>
                <input type="text" name="fullname" required placeholder="مثال: ياسين الغزلافي">
                <label>رقم بطاقة التعريف الوطنية (CIN):</label>
                <input type="text" name="cin" required placeholder="مثال: HH123456">
                <label>القسم / الشعبة:</label>
                <input type="text" name="group" required placeholder="مثال: TSGO-101">
                <label>صورة شخصية (اختياري):</label>
                <input type="file" name="avatar" accept="image/*">
                <label>صورة بطاقة مسار / التعريف (PNJ):</label>
                <input type="file" name="pnj" accept="image/*" required>
                <label>كلمة المرور:</label>
                <input type="password" name="password" required>
                <button type="submit" class="btn" style="width:100%; margin-top:10px;">إرسال طلب التسجيل</button>
                <p style="text-align:center;"><a href="/">العودة للرئيسية</a></p>
            </form>
        </div>
    </body>
    </html>
  `);
});

app.post('/register', upload.fields([{ name: 'pnj' }, { name: 'avatar' }]), async (req, res) => {
  try {
    const { fullname, cin, group, password } = req.body;
    let pnjBase64 = '', avatarBase64 = '';
    
    if (req.files && req.files['pnj']) {
      pnjBase64 = `data:${req.files['pnj'][0].mimetype};base64,${req.files['pnj'][0].buffer.toString('base64')}`;
    }
    if (req.files && req.files['avatar']) {
      avatarBase64 = `data:${req.files['avatar'][0].mimetype};base64,${req.files['avatar'][0].buffer.toString('base64')}`;
    }

    const newUser = new User({ fullname, cin, pnj: pnjBase64, avatar: avatarBase64, group, password });
    await newUser.save();
    res.send(`<script>alert('تم إرسال طلبك بنجاح، وهو قيد المراجعة من طرف أعضاء اللجنة.'); window.location.href='/';</script>`);
  } catch (err) {
    res.send(`<script>alert('خطأ: رقم بطاقة التعريف مستخدم مسبقاً.'); window.location.href='/register';</script>`);
  }
});

// تسجيل الدخول
app.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head><meta charset="UTF-8"><title>تسجيل الدخول</title>${commonCSS}</head>
    <body>
        <div class="container" style="max-width:450px;">
            <h2>🔐 تسجيل دخول المتدرب</h2>
            <form action="/login" method="POST">
                <label>رقم بطاقة التعريف الوطنية (CIN):</label>
                <input type="text" name="cin" required>
                <label>كلمة المرور:</label>
                <input type="password" name="password" required>
                <button type="submit" class="btn" style="width:100%; margin-top:10px;">دخول</button>
                <p style="text-align:center;"><a href="/">العودة للرئيسية</a></p>
            </form>
        </div>
    </body>
    </html>
  `);
});

app.post('/login', async (req, res) => {
  const { cin, password } = req.body;
  const user = await User.findOne({ cin, password });
  if (!user) return res.send(`<script>alert('بيانات الدخول غير صحيحة!'); window.location.href='/login';</script>`);
  if (user.status !== 'accepted') return res.send(`<script>alert('حسابك قيد المراجعة والقبول من طرف المشرفين.'); window.location.href='/';</script>`);
  res.redirect(`/profile?cin=${cin}`);
});

// الملف الشخصي للمتدرب
app.get('/profile', async (req, res) => {
  const { cin } = req.query;
  const user = await User.findOne({ cin });
  if (!user) return res.redirect('/login');

  const latestAnnouncement = await Announcement.findOne().sort({ date: -1 }) || { text: "لا توجد إعلانات جديدة حالياً." };
  const starSetting = await Settings.findOne({ key: 'starOfTheMonth' });
  const isStar = starSetting && starSetting.value === user.cin;
  const userComplaints = await Complaint.find({ senderCin: user.cin }).sort({ date: -1 });
  const competitions = await Competition.find();

  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head><meta charset="UTF-8"><title>الملف الشخصي - ${user.fullname}</title>${commonCSS}</head>
    <body>
        <div class="announcement-bar">
            📢 <b>إعلان لجنة الانضباط:</b> ${latestAnnouncement.text}
            ${latestAnnouncement.image ? `<br><img src="${latestAnnouncement.image}" width="220" style="margin-top:10px; border-radius:6px;">` : ''}
        </div>

        <div class="container">
            <div style="display:flex; align-items:center; gap:20px; flex-wrap:wrap; border-bottom:2px solid #eee; padding-bottom:15px;">
                <img src="${user.avatar || 'https://via.placeholder.com/90'}" class="user-avatar" alt="Profile">
                <div>
                    <h2 style="margin:0;">${user.fullname}</h2>
                    <p style="margin:5px 0; color:#666;">القسم: <b>${user.group}</b> | CIN: <b>${user.cin}</b></p>
                    <p style="margin:0;">الرتبة الانضباطية: <span class="badge badge-${user.rank.toLowerCase()}">الرتبة ${user.rank}</span></p>
                </div>
            </div>

            ${isStar ? '<div class="section" style="background:#fff9c4; border-color:#fbc02d; text-align:center;">🌟 <b>مبروك! لقد تم اختيارك "نجم الشهر" كأكثر المتدربين التزاماً وإبداعاً.</b></div>' : ''}

            <!-- إضافة المهارات واللغات -->
            <div class="section">
                <h3>💡 مهاراتي واللغات المتقنة</h3>
                <form action="/update-profile" method="POST" enctype="multipart/form-data">
                    <input type="hidden" name="cin" value="${user.cin}">
                    <label>المهارات (افصل بينها بفواصل):</label>
                    <input type="text" name="skills" value="${user.skills.join(', ')}" placeholder="AutoCAD, MS Project, رسم تقني...">
                    <label>اللغات المتقنة:</label>
                    <input type="text" name="languages" value="${user.languages.join(', ')}" placeholder="العربية, الفرنسية, الإنجليزية...">
                    <label>صورة إثبات المهارة / عمل شخصي:</label>
                    <input type="file" name="skillImage" accept="image/*">
                    <button type="submit" class="btn">حفظ التحديثات</button>
                </form>
            </div>

            <!-- تقديم ومتابعة الشكايات -->
            <div class="section">
                <h3>📩 تقديم شكاية / ملاحظة للجنة</h3>
                <form action="/add-complaint" method="POST">
                    <input type="hidden" name="cin" value="${user.cin}">
                    <textarea name="complaintText" placeholder="اكتب موضوع الشكاية هنا بوضوح..." required></textarea>
                    <button type="submit" class="btn">إرسال الشكاية</button>
                </form>

                <h4 style="margin-top:20px;">حالة شكاياتي السابقة:</h4>
                ${userComplaints.length === 0 ? '<p style="color:#777;">لم تقدم أي شكاية بعد.</p>' : `
                  <table>
                    <tr><th>نص الشكاية</th><th>الحالة</th><th>رد اللجنة</th></tr>
                    ${userComplaints.map(c => `
                        <tr>
                            <td>${c.text}</td>
                            <td><span style="color:${c.status === 'تمت المعالجة' ? 'green' : 'orange'}; font-weight:bold;">${c.status}</span></td>
                            <td>${c.response || 'في انتظار الرد...'}</td>
                        </tr>
                    `).join('')}
                  </table>
                `}
            </div>

            <!-- المسابقات -->
            <div class="section">
                <h3>🏆 ركن المسابقات والنتائج</h3>
                <ul>
                    ${competitions.map(c => `<li><b>${c.title}</b> - النتيجة: <span style="color:green; font-weight:bold;">${c.result}</span></li>`).join('')}
                </ul>
            </div>

            <p style="text-align:center; margin-top:20px;"><a href="/" class="btn btn-danger">تسجيل الخروج</a></p>
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
  if (req.file) updateData.skillImage = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
  await User.findOneAndUpdate({ cin }, updateData);
  res.redirect(`/profile?cin=${cin}`);
});

app.post('/add-complaint', async (req, res) => {
  const { cin, complaintText } = req.body;
  const user = await User.findOne({ cin });
  if (user) {
    await Complaint.create({ senderName: user.fullname, senderCin: user.cin, group: user.group, text: complaintText });
  }
  res.send(`<script>alert('تم إرسال الشكاية للجنة الانضباط بنجاح.'); window.location.href='/profile?cin=${cin}';</script>`);
});

// لوحة تحكم المشرفين
app.get('/admin-login', (req, res) => {
  res.send(`
    <!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>دخول المشرفين</title>${commonCSS}</head>
    <body>
        <div class="container" style="max-width:450px;">
            <h2>👨‍💼 دخول المشرفين (لجنة CAD)</h2>
            <form action="/admin-dashboard" method="POST">
                <label>كلمة مرور المشرفين:</label>
                <input type="password" name="adminPass" required>
                <button type="submit" class="btn btn-danger" style="width:100%; margin-top:10px;">دخول لوحة التحكم</button>
                <p style="text-align:center;"><a href="/">العودة للرئيسية</a></p>
            </form>
        </div>
    </body>
    </html>
  `);
});

app.post('/admin-dashboard', async (req, res) => {
  const { adminPass } = req.body;
  if (adminPass !== 'cad2026') return res.send(`<script>alert('كلمة المرور غير صحيحة!'); window.location.href='/admin-login';</script>`);

  const users = await User.find();
  const complaints = await Complaint.find().sort({ date: -1 });
  const competitions = await Competition.find();

  const totalUsers = users.filter(u => u.status === 'accepted').length;
  const pendingUsers = users.filter(u => u.status === 'pending').length;
  const pendingComplaints = complaints.filter(c => c.status === 'قيد الدراسة').length;

  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head><meta charset="UTF-8"><title>لوحة التحكم - المشرفين</title>${commonCSS}</head>
    <body>
        <div class="container" style="max-width:1100px;">
            <h2>📊 لوحة تحكم أعضاء لجنة الانضباط الذاتية</h2>
            
            <!-- لوحة إحصائيات سريعة -->
            <div class="stats-grid">
                <div class="stat-card"><h3>${totalUsers}</h3><p>المتدربين المقبولين</p></div>
                <div class="stat-card" style="border-color:orange;"><h3>${pendingUsers}</h3><p>طلبات تسجيل معلقة</p></div>
                <div class="stat-card" style="border-color:red;"><h3>${pendingComplaints}</h3><p>شكايات قيد المعالجة</p></div>
                <div class="stat-card" style="border-color:green;"><h3>${competitions.length}</h3><p>المسابقات النشطة</p></div>
            </div>

            <!-- نشر إعلان -->
            <div class="section">
                <h3>📢 نشر إعلان جديد في الشريط العلوي</h3>
                <form action="/admin/add-announcement" method="POST" enctype="multipart/form-data">
                    <textarea name="text" placeholder="نص الإعلان الموجه لجميع المتدربين..." required></textarea>
                    <label>صورة مرفقة بالإعلان (اختياري):</label>
                    <input type="file" name="annImage" accept="image/*">
                    <button type="submit" class="btn">نشر الإعلان</button>
                </form>
            </div>

            <!-- نجم الشهر -->
            <div class="section">
                <h3>🌟 منح بادج "نجم الشهر" للمتدرب الأكثر التزاماً</h3>
                <form action="/admin/set-star" method="POST">
                    <select name="cin">
                        ${users.filter(u => u.status === 'accepted').map(u => `<option value="${u.cin}">${u.fullname} - (القسم: ${u.group})</option>`).join('')}
                    </select>
                    <button type="submit" class="btn btn-success">تحديد كـ نجم الشهر</button>
                </form>
            </div>

            <!-- إشراف وإدارة المتدربين -->
            <div class="section">
                <h3>👥 قائمة المتدربين والتصنيف (A, B, C, D)</h3>
                <table>
                    <tr>
                        <th>الصورة</th>
                        <th>الإسم والنسب / CIN</th>
                        <th>الشعبة</th>
                        <th>المهارات واللغات</th>
                        <th>الحالة</th>
                        <th>الرتبة</th>
                        <th>الإجراءات</th>
                    </tr>
                    ${users.map(u => `
                        <tr>
                            <td><img src="${u.avatar || 'https://via.placeholder.com/50'}" style="width:45px; height:45px; border-radius:50%; object-fit:cover;"></td>
                            <td><b>${u.fullname}</b><br><small>${u.cin}</small></td>
                            <td>${u.group}</td>
                            <td>
                                <b>المهارات:</b> ${u.skills.join(', ') || 'لا توجد'}<br>
                                <b>اللغات:</b> ${u.languages.join(', ') || 'لا توجد'}
                            </td>
                            <td>${u.status === 'pending' ? '<span style="color:orange;">معلق</span>' : '<span style="color:green;">مقبول</span>'}</td>
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
                                ${u.status === 'pending' ? `<a href="/admin/accept?cin=${u.cin}"><button class="btn btn-success" style="padding:4px 8px; font-size:12px;">قبول</button></a>` : ''}
                                <a href="/admin/delete?cin=${u.cin}"><button class="btn btn-danger" style="padding:4px 8px; font-size:12px;">حذف</button></a>
                            </td>
                        </tr>
                    `).join('')}
                </table>
            </div>

            <!-- معالجة الشكايات -->
            <div class="section">
                <h3>📬 الشكايات الواردة والرد عليها</h3>
                <table>
                    <tr><th>المشتكي</th><th>الشكاية</th><th>الحالة والرد</th></tr>
                    ${complaints.map(c => `
                        <tr>
                            <td><b>${c.senderName}</b> (${c.group})<br><small>${c.senderCin}</small></td>
                            <td>${c.text}</td>
                            <td>
                                <form action="/admin/respond-complaint" method="POST">
                                    <input type="hidden" name="id" value="${c._id}">
                                    <input type="text" name="response" value="${c.response}" placeholder="اكتب رد اللجنة...">
                                    <select name="status">
                                        <option value="قيد الدراسة" ${c.status==='قيد الدراسة'?'selected':''}>قيد الدراسة</option>
                                        <option value="تمت المعالجة" ${c.status==='تمت المعالجة'?'selected':''}>تمت المعالجة</option>
                                    </select>
                                    <button type="submit" class="btn" style="padding:4px 8px; margin-top:4px;">حفظ الرد</button>
                                </form>
                            </td>
                        </tr>
                    `).join('')}
                </table>
            </div>

            <p style="text-align:center; margin-top:20px;"><a href="/" class="btn btn-danger">تسجيل الخروج</a></p>
        </div>
    </body>
    </html>
  `);
});

// المسارات الخاصة بقرارات المشرفين
app.post('/admin/add-announcement', upload.single('annImage'), async (req, res) => {
  let imgBase64 = '';
  if (req.file) imgBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
  await Announcement.create({ text: req.body.text, image: imgBase64 });
  res.redirect('/admin-login');
});

app.post('/admin/set-star', async (req, res) => {
  await Settings.findOneAndUpdate({ key: 'starOfTheMonth' }, { value: req.body.cin }, { upsert: true });
  res.redirect('/admin-login');
});

app.post('/admin/update-rank', async (req, res) => {
  await User.findOneAndUpdate({ cin: req.body.cin }, { rank: req.body.rank });
  res.redirect('/admin-login');
});

app.post('/admin/respond-complaint', async (req, res) => {
  const { id, response, status } = req.body;
  await Complaint.findByIdAndUpdate(id, { response, status });
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
