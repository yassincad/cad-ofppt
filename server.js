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
  const starSetting = await Settings.findOne({ key: 'starOfTheMonth' });
  let starUser = null;
  if (starSetting) {
    starUser = await User.findOne({ cin: starSetting.value });
  }

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
            .star-bar { background: #fff3e0; color: #e65100; border: 2px solid #ffa726; padding: 12px; border-radius: 8px; font-weight: bold; margin-bottom: 20px; font-size: 16px; }
        </style>
    </head>
    <body>
        <div class="container">
            ${starUser ? `<div class="star-bar">🌟 نجم الشهر المعترف به من طرف لجنة الانضباط الذاتية: ${starUser.fullname} (قسم: ${starUser.group}) 🌟</div>` : ''}
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
    <style>body{font-family:Tahoma;background:#f4f7f6;padding:20px;text-align:center;} form{background:white;max-width:500px;margin:auto;padding:20px;border-radius:8px;box-shadow:0 2px 5px rgba(0,0,0,0.1);text-align:right;} input{width:100%;
