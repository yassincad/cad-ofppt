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
  pnj: String,
  avatar: String,
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
  status: { type: String, default: 'قيد الدراسة' },
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
    .stat-card
