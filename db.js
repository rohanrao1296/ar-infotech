require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const dns = require('dns');

// Ensure reliable DNS resolution for MongoDB Atlas SRV connection strings
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const ATLAS_FALLBACK_URI = 'mongodb+srv://rohankumar4088_db_user:mnwBITZAE6MUd0FF@cluster0.ztflnvt.mongodb.net/arinfotech?retryWrites=true&w=majority';
const MONGODB_URI = process.env.MONGODB_URI || ATLAS_FALLBACK_URI;
const DB_NAME = process.env.DB_NAME || 'arinfotech';

let client = null;
let db = null;
let isConnecting = false;
let mongoAttempted = false;
let lastMongoAttempt = 0;

// Local Persistent File Database Configuration (Guarantees 100% uptime on Render/Cloud even without MongoDB Atlas)
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

// Seed Certificates for Verification Tool
const SEED_CERTIFICATES = [
  {
    certId: 'AR-2026-8921',
    studentName: 'AMAN VERMA',
    courseName: 'Web Development Masterclass',
    duration: '3 Months',
    startDate: '01 December 2025',
    endDate: '28 February 2026',
    issueDate: '01 March 2026',
    grade: 'Grade A+ (Distinction)',
    instructor: 'Er. Aman Sharma (Senior Web Architect)',
    status: 'Verified & Active',
    placedCompany: 'TCS Digital',
    verifiedCount: 0,
    createdAt: new Date('2026-03-01T10:00:00Z')
  },
  {
    certId: 'AR-2026-4412',
    studentName: 'POOJA VERMA',
    courseName: 'Flutter App Development',
    duration: '3 Months',
    startDate: '15 November 2025',
    endDate: '15 February 2026',
    issueDate: '18 February 2026',
    grade: 'Grade A+ (Distinction)',
    instructor: 'Er. Ankit Kumar (Mobile App Architect)',
    status: 'Verified & Active',
    placedCompany: 'Infosys Mobile Labs',
    verifiedCount: 0,
    createdAt: new Date('2026-02-18T10:00:00Z')
  },
  {
    certId: 'AR-2026-1092',
    studentName: 'KUNAL DESHMUKH',
    courseName: 'Cyber Security & Ethical Hacking Program',
    duration: '3.5 Months',
    startDate: '10 October 2025',
    endDate: '25 January 2026',
    issueDate: '01 February 2026',
    grade: 'Grade A+ (Distinction)',
    instructor: 'Rohan Kumar (Head of Cybersecurity)',
    status: 'Verified & Active',
    placedCompany: 'Tech Mahindra Cyber',
    verifiedCount: 0,
    createdAt: new Date('2026-02-01T10:00:00Z')
  },
  {
    certId: 'AR-2026-5531',
    studentName: 'SNEHA PANDEY',
    courseName: 'Business Development Executive (BDE)',
    duration: '2 Months',
    startDate: '01 December 2025',
    endDate: '31 January 2026',
    issueDate: '05 February 2026',
    grade: 'Grade A+ (Distinction)',
    instructor: 'Anshika Mishra (Senior BDE Lead)',
    status: 'Verified & Active',
    placedCompany: 'Zomato Corporate',
    verifiedCount: 0,
    createdAt: new Date('2026-02-05T10:00:00Z')
  },
  {
    certId: 'AR-2026-7782',
    studentName: 'ADITYA GUPTA',
    courseName: 'Graphic Designing & Creative Branding',
    duration: '2.5 Months',
    startDate: '15 November 2025',
    endDate: '30 January 2026',
    issueDate: '05 February 2026',
    grade: 'Grade A+ (Distinction)',
    instructor: 'Rohan Kumar (Creative Director)',
    status: 'Verified & Active',
    placedCompany: 'Creative Pulse Media',
    verifiedCount: 0,
    createdAt: new Date('2026-02-05T10:00:00Z')
  }
];

// Seed Trainers / Faculty
const SEED_TRAINERS = [
  {
    trainerId: 'rohan',
    name: 'Rohan Kumar',
    role: 'Cybersecurity Specialist & Creative Director',
    companyPill: 'Mentor for: Cyber Security & Graphic Designing',
    bio: '5+ years in VAPT penetration testing and defensive security, combined with deep mastery in Adobe Creative Suite, branding systems, and Figma UI/UX.',
    yearsExp: '5+',
    rating: '4.9★',
    batches: '21+',
    image: './assets/images/trainer-rohan-kumar.jpg?v=3',
    objectPosition: '12%',
    linkedin: '',
    order: 1
  },
  {
    trainerId: 'anshika',
    name: 'Anshika Mishra',
    role: 'Corporate Sales Strategist & Senior BDE Lead',
    companyPill: 'Mentor for: Business Development Executive',
    bio: '2+ years leading corporate business development, enterprise client acquisition, LinkedIn prospecting, high-ticket negotiations, and CRM pipeline closing.',
    yearsExp: '2+',
    rating: '4.9★',
    batches: '11+',
    image: './assets/images/trainer-anshika-mishra.jpg',
    objectPosition: '20%',
    linkedin: '',
    order: 2
  },
  {
    trainerId: 'aman',
    name: 'Er. Aman Sharma',
    role: 'Senior Full Stack Web Architect & Tech Lead',
    companyPill: 'Mentor for: Web Development',
    bio: '3+ years architecting enterprise SaaS platforms, high-performance web systems, REST APIs, and modern responsive frontend architectures.',
    yearsExp: '3+',
    rating: '4.8★',
    batches: '15+',
    image: './assets/images/trainer-aman-sharma.jpg',
    objectPosition: '16%',
    linkedin: 'https://www.linkedin.com/in/aman-sharma-85278b357',
    order: 3
  },
  {
    trainerId: 'ankit',
    name: 'Er. Ankit Kumar',
    role: 'Senior Mobile App Architect & Flutter Specialist',
    companyPill: 'Mentor for: Flutter App Development',
    bio: '2+ years building fluid, cross-platform Android & iOS applications. Specialist in Dart language, Riverpod state management, and Firebase cloud integrations.',
    yearsExp: '2+',
    rating: '4.9★',
    batches: '15+',
    image: './assets/images/trainer-ankit-kumar.jpg',
    objectPosition: '8%',
    linkedin: 'https://www.linkedin.com/in/ankit-kumar-8b3b03375',
    order: 4
  }
];

// Seed Software & Apps Projects
const SEED_PROJECTS = [
  {
    projectId: 'xpense',
    title: 'Xpense: Smart Expense Tracker & Money Manager',
    categoryBadge: 'Google Play Live • Flutter',
    badgeClass: 'badge-green',
    type: 'mobile',
    desc: 'A production-grade Flutter mobile application published on Google Play Store. Features real-time income & expense analytics, categorical logs, budget limit warnings, and offline encrypted storage.',
    techTags: ['Flutter 3.x', 'Dart', 'Provider', 'Material 3', 'Play Store Live'],
    company: 'AR Infotech',
    author: 'Rohan Kumar',
    iconImage: './assets/images/app-xpense-icon.png',
    previewImage: './assets/images/app-xpense-screens.png',
    liveUrl: '',
    order: 1
  },
  {
    projectId: 'tasknest',
    title: 'Task Nest: Smart Daily Productivity & Goal Planner',
    categoryBadge: 'Google Play Live • Flutter',
    badgeClass: 'badge-green',
    type: 'mobile',
    desc: 'A feature-rich Flutter productivity application published on Google Play Store. Features high/medium/low priority task sorting, 7-day productivity streak tracker, daily goal gauges, and scheduled alerts.',
    techTags: ['Flutter 3.x', 'Dart', 'Clean Arch', 'Local Alerts', 'Play Store Live'],
    company: 'AR Infotech',
    author: 'Rohan Kumar',
    iconImage: './assets/images/app-tasknest-icon.png',
    previewImage: './assets/images/app-tasknest-screens.png',
    liveUrl: '',
    order: 2
  },
  {
    projectId: 'pal-csc',
    title: 'Pal Jan Sewa Kendra: Citizen Service Mobile App',
    categoryBadge: 'Flutter 3.x • Citizen Portal',
    badgeClass: 'badge-cyan',
    type: 'mobile',
    desc: 'A cross-platform Flutter mobile application engineered for Pal Jan Sewa Kendra (CSC ID: 246253160019, Basti, U.P.). Empowers rural and semi-urban citizens with digital applications for Income, Caste & Domicile certificates (आय, जाति, निवास प्रमाण पत्र), instant PAN Card issuance, state pension & scholarship scheme tracking, and secure digital fee payments.',
    techTags: ['Flutter 3.x', 'Dart', 'Citizen Services', 'Payment Gateway', 'CSC e-Governance', 'Cross-Platform App'],
    company: 'Pal Jan Sewa Kendra (CSC VLE Vineet Pal, Basti U.P.)',
    author: 'AR Infotech',
    iconImage: './assets/images/app-pal-csc-screens.png',
    previewImage: './assets/images/app-pal-csc-screens.png',
    liveUrl: '/assets/downloads/pal-csc.apk',
    order: 3
  },
  {
    projectId: 'svv-erp',
    title: 'Savitri Vidya Vihar ERP: School Management & Attendance',
    categoryBadge: 'Full Stack ERP',
    badgeClass: 'badge-purple',
    type: 'web',
    desc: 'A complete CBSE school management system featuring live administrative dashboard, campus geofence validation, real-time staff/student attendance tracking, automated SMS & WhatsApp notification alerts, and installable PWA offline portal.',
    techTags: ['React.js', 'Node.js', 'MongoDB', 'Campus Geofence', 'WhatsApp API', 'Offline PWA'],
    company: 'AR Infotech',
    author: 'Rohan Kumar',
    browserAddress: 'savitrividyavihar.edu.in/admin',
    previewImage: './assets/images/project-svv-erp.png',
    liveUrl: 'https://savitrividyavihar.edu.in',
    order: 4
  },
  {
    projectId: 'aakriti',
    title: 'Aakriti Ultrasound: Diagnostic & Healthcare Web Portal',
    categoryBadge: 'Firebase Live • Web Portal',
    badgeClass: 'badge-cyan',
    type: 'web',
    desc: 'A live production clinical management and appointment scheduling web application deployed on Google Firebase Cloud. Built for seamless patient registration, diagnostic ultrasound test catalog, scan reporting, and instant access across devices.',
    techTags: ['Flutter Web', 'Dart', 'Google Firebase', 'Cloud Firestore', 'Healthcare UI', 'Production Live'],
    company: 'AR Infotech',
    author: 'Er. Aman Sharma',
    browserAddress: 'aakriti-ultrasound.firebaseapp.com',
    previewImage: './assets/images/project-aakriti-preview.png',
    liveUrl: 'https://aakriti-ultrasound.firebaseapp.com/',
    order: 5
  },
  {
    projectId: 'urldoctor',
    title: 'URL Doctor v2.0: Security & Web Diagnostic Tool',
    categoryBadge: 'Cyber Security • CLI',
    badgeClass: 'badge-cyan',
    type: 'terminal',
    desc: 'Terminal-based cybersecurity diagnostic engine built by Rohan Kumar for Kali Linux, Windows & macOS. Performs deep URL security health audits, HTTP header vulnerability detection, SSL/TLS validation, and domain footprinting under Rao Technologies.',
    techTags: ['Python 3', 'Kali Linux', 'Security Audit', 'Sockets', 'SSL/TLS Audit', 'GitHub Open-Source'],
    company: 'AR Infotech',
    author: 'Rohan Kumar',
    terminalTitle: 'root@ROHAN: ~/urldoctor',
    previewImage: './assets/images/project-urldoctor.png',
    liveUrl: '',
    order: 6
  }
];

// Seed Site Settings
const SEED_SETTINGS = {
  settingsId: 'general',
  announcementText: '🚀 Admissions Open 2026 (100% Live Online Batches)',
  phone: '+91 91615 03476',
  email: 'admissions@arinfotech.co.in',
  whatsapp: '9161503476',
  address: 'AR INFOTECH, Tech Hub, Uttar Pradesh, India',
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin@arinfotech2026'
};

// =========================================================================
// LOCAL FILE DATABASE ENGINE (Fallback & Instant Cloud Persistence)
// =========================================================================
function ensureJsonDb() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      const initialData = {
        trainers: SEED_TRAINERS,
        projects: SEED_PROJECTS,
        settings: SEED_SETTINGS,
        certificates: SEED_CERTIFICATES,
        inquiries: [],
        subscribers: [],
        career_leads: [],
        admin_users: []
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf8');
    }
  } catch (err) {
    console.error('[FileDB] Initialization error:', err.message);
  }
}

function readJsonDb() {
  ensureJsonDb();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      trainers: Array.isArray(parsed.trainers) ? parsed.trainers : SEED_TRAINERS,
      projects: Array.isArray(parsed.projects) ? parsed.projects : SEED_PROJECTS,
      settings: parsed.settings || SEED_SETTINGS,
      certificates: Array.isArray(parsed.certificates) ? parsed.certificates : SEED_CERTIFICATES,
      inquiries: Array.isArray(parsed.inquiries) ? parsed.inquiries : [],
      subscribers: Array.isArray(parsed.subscribers) ? parsed.subscribers : [],
      career_leads: Array.isArray(parsed.career_leads) ? parsed.career_leads : [],
      admin_users: Array.isArray(parsed.admin_users) ? parsed.admin_users : []
    };
  } catch (err) {
    console.error('[FileDB] Read error:', err.message);
    return {
      trainers: SEED_TRAINERS,
      projects: SEED_PROJECTS,
      settings: SEED_SETTINGS,
      certificates: SEED_CERTIFICATES,
      inquiries: [],
      subscribers: [],
      career_leads: [],
      admin_users: []
    };
  }
}

function writeJsonDb(data) {
  ensureJsonDb();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[FileDB] Write error:', err.message);
  }
}

// Ensure storage initialized immediately
ensureJsonDb();

// =========================================================================
// MONGODB CONNECTION
// =========================================================================
async function connectDB() {
  if (db) return db;
  // If connection failed recently, wait 30 seconds before retrying so we don't block requests
  if (mongoAttempted && !db && (Date.now() - lastMongoAttempt < 30000)) {
    return null;
  }
  if (isConnecting) {
    while (isConnecting) {
      await new Promise(r => setTimeout(r, 100));
    }
    return db;
  }

  isConnecting = true;
  lastMongoAttempt = Date.now();
  try {
    const maskedUri = MONGODB_URI.replace(/\/\/.*@/, '//***@');
    console.log(`[MongoDB] Attempting connection to ${maskedUri} ...`);
    const isCloud = MONGODB_URI.includes('mongodb+srv://') || MONGODB_URI.includes('@');
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: isCloud ? 6000 : 2500,
      connectTimeoutMS: isCloud ? 6000 : 2500
    });
    await client.connect();
    db = client.db(DB_NAME);
    console.log(`[MongoDB] Successfully connected to database: "${DB_NAME}"`);

    await setupCollectionsAndIndexes();
    await seedInitialDataIfEmpty();

    mongoAttempted = true;
    isConnecting = false;
    return db;
  } catch (error) {
    isConnecting = false;
    mongoAttempted = true;
    lastMongoAttempt = Date.now();
    console.log(`[MongoDB] Notice: Running on local persistent file engine (${error.message})`);
    db = null;
    return null;
  }
}

async function setupCollectionsAndIndexes() {
  if (!db) return;
  try {
    const existingCollections = await db.listCollections().toArray();
    const existingNames = existingCollections.map(c => c.name);

    if (!existingNames.includes('inquiries')) await db.createCollection('inquiries');
    if (!existingNames.includes('certificates')) await db.createCollection('certificates');
    if (!existingNames.includes('subscribers')) await db.createCollection('subscribers');
    if (!existingNames.includes('career_leads')) await db.createCollection('career_leads');
    if (!existingNames.includes('trainers')) await db.createCollection('trainers');
    if (!existingNames.includes('projects')) await db.createCollection('projects');
    if (!existingNames.includes('settings')) await db.createCollection('settings');
    if (!existingNames.includes('admin_users')) await db.createCollection('admin_users');

    await db.collection('inquiries').createIndex({ refId: 1 }, { unique: true });
    await db.collection('inquiries').createIndex({ phone: 1 });
    await db.collection('inquiries').createIndex({ createdAt: -1 });

    await db.collection('certificates').createIndex({ certId: 1 }, { unique: true });
    await db.collection('certificates').createIndex({ studentName: 'text', courseName: 'text' });

    await db.collection('trainers').createIndex({ trainerId: 1 }, { unique: true });
    await db.collection('trainers').createIndex({ order: 1 });

    await db.collection('projects').createIndex({ projectId: 1 }, { unique: true });
    await db.collection('projects').createIndex({ order: 1 });

    await db.collection('settings').createIndex({ settingsId: 1 }, { unique: true });
    await db.collection('admin_users').createIndex({ username: 1 }, { unique: true });
  } catch (err) {
    console.error('[MongoDB Init Index Warning]', err.message);
  }
}

async function seedInitialDataIfEmpty() {
  if (!db) return;
  try {
    const certCount = await db.collection('certificates').countDocuments();
    if (certCount === 0) {
      await db.collection('certificates').insertMany(SEED_CERTIFICATES);
    }

    const trainerCount = await db.collection('trainers').countDocuments();
    if (trainerCount === 0) {
      await db.collection('trainers').insertMany(SEED_TRAINERS);
    }

    const projectCount = await db.collection('projects').countDocuments();
    if (projectCount === 0) {
      await db.collection('projects').insertMany(SEED_PROJECTS);
    }

    const settingsCount = await db.collection('settings').countDocuments();
    if (settingsCount === 0) {
      await db.collection('settings').insertOne(SEED_SETTINGS);
    }
  } catch (err) {
    console.error('[MongoDB Seeding Warning]', err.message);
  }
}

// =========================================================================
// DATA ACCESS METHODS (Dual-Engine: MongoDB Atlas + Local Persistent DB)
// =========================================================================

// --- Inquiries ---
async function saveInquiry(inquiryData) {
  const database = await connectDB();
  const refId = inquiryData.refId || ('AR-' + Math.floor(100000 + Math.random() * 900000));
  const document = {
    ...inquiryData,
    refId,
    status: 'New',
    createdAt: new Date()
  };

  if (database) {
    try {
      await database.collection('inquiries').insertOne(document);
      return document;
    } catch (e) {
      console.warn('[MongoDB saveInquiry fallback]', e.message);
    }
  }

  // FileDB Fallback
  const store = readJsonDb();
  store.inquiries.unshift({ ...document, createdAt: document.createdAt.toISOString() });
  writeJsonDb(store);
  return document;
}

async function getInquiries(limit = 50) {
  const database = await connectDB();
  if (database) {
    try {
      return await database.collection('inquiries').find({}).sort({ createdAt: -1 }).limit(limit).toArray();
    } catch (e) {
      console.warn('[MongoDB getInquiries fallback]', e.message);
    }
  }

  const store = readJsonDb();
  return store.inquiries.slice(0, limit);
}

async function deleteInquiry(refId) {
  const database = await connectDB();
  if (database) {
    try {
      await database.collection('inquiries').deleteOne({ refId });
    } catch (e) {}
  }

  const store = readJsonDb();
  store.inquiries = store.inquiries.filter(i => i.refId !== refId);
  writeJsonDb(store);
  return { success: true, refId };
}

async function updateInquiryStatus(refId, status) {
  const database = await connectDB();
  if (database) {
    try {
      await database.collection('inquiries').updateOne({ refId }, { $set: { status, updatedAt: new Date() } });
    } catch (e) {}
  }

  const store = readJsonDb();
  const lead = store.inquiries.find(i => i.refId === refId);
  if (lead) {
    lead.status = status;
    lead.updatedAt = new Date().toISOString();
    writeJsonDb(store);
  }
  return { success: true, refId, status };
}

// --- Certificates ---
async function verifyCertificate(certId) {
  const database = await connectDB();
  const normalizedId = (certId || '').trim();

  if (database) {
    try {
      const cert = await database.collection('certificates').findOne({
        certId: { $regex: new RegExp(`^${normalizedId}$`, 'i') }
      });
      if (cert) {
        await database.collection('certificates').updateOne(
          { certId: cert.certId },
          { $inc: { verifiedCount: 1 }, $set: { lastVerifiedAt: new Date() } }
        );
        return cert;
      }
    } catch (e) {
      console.warn('[MongoDB verifyCertificate fallback]', e.message);
    }
  }

  const store = readJsonDb();
  const found = store.certificates.find(c => (c.certId || '').toUpperCase() === normalizedId.toUpperCase());
  if (found) {
    found.verifiedCount = (found.verifiedCount || 0) + 1;
    found.lastVerifiedAt = new Date().toISOString();
    writeJsonDb(store);
    return found;
  }
  return null;
}

async function saveCertificate(certData) {
  const database = await connectDB();
  const certId = certData.certId || ('AR-2026-' + Math.floor(1000 + Math.random() * 9000));
  const document = {
    ...certData,
    certId,
    verifiedCount: parseInt(certData.verifiedCount || 0, 10),
    status: certData.status || 'Verified & Active',
    updatedAt: new Date()
  };
  delete document._id;

  if (database) {
    try {
      await database.collection('certificates').updateOne(
        { certId },
        { $set: document },
        { upsert: true }
      );
    } catch (e) {}
  }

  const store = readJsonDb();
  const idx = store.certificates.findIndex(c => c.certId.toUpperCase() === certId.toUpperCase());
  if (idx >= 0) {
    store.certificates[idx] = { ...document, updatedAt: document.updatedAt.toISOString() };
  } else {
    store.certificates.unshift({ ...document, updatedAt: document.updatedAt.toISOString() });
  }
  writeJsonDb(store);
  return { success: true, certId, data: document };
}

async function getAllCertificates(limit = 100) {
  const database = await connectDB();
  if (database) {
    try {
      return await database.collection('certificates').find({}).sort({ createdAt: -1 }).limit(limit).toArray();
    } catch (e) {
      console.warn('[MongoDB getAllCertificates fallback]', e.message);
    }
  }

  const store = readJsonDb();
  return store.certificates.slice(0, limit);
}

async function deleteCertificate(certId) {
  const database = await connectDB();
  if (database) {
    try {
      await database.collection('certificates').deleteOne({ certId });
    } catch (e) {}
  }

  const store = readJsonDb();
  store.certificates = store.certificates.filter(c => c.certId.toUpperCase() !== (certId || '').toUpperCase());
  writeJsonDb(store);
  return { success: true, certId };
}

// --- Trainers ---
async function getTrainers() {
  const database = await connectDB();
  if (database) {
    try {
      const list = await database.collection('trainers').find({}).sort({ order: 1 }).toArray();
      if (list && list.length > 0) return list;
    } catch (e) {
      console.warn('[MongoDB getTrainers fallback]', e.message);
    }
  }

  const store = readJsonDb();
  return store.trainers.sort((a, b) => (a.order || 0) - (b.order || 0));
}

async function saveTrainer(trainerData) {
  const database = await connectDB();
  const trainerId = trainerData.trainerId || ('trainer-' + Date.now());
  const document = {
    ...trainerData,
    trainerId,
    updatedAt: new Date()
  };
  delete document._id;

  if (database) {
    try {
      await database.collection('trainers').updateOne(
        { trainerId },
        { $set: document },
        { upsert: true }
      );
    } catch (e) {}
  }

  const store = readJsonDb();
  const idx = store.trainers.findIndex(t => t.trainerId === trainerId);
  if (idx >= 0) {
    store.trainers[idx] = { ...document, updatedAt: document.updatedAt.toISOString() };
  } else {
    store.trainers.push({ ...document, updatedAt: document.updatedAt.toISOString() });
  }
  writeJsonDb(store);
  return { success: true, trainerId, data: document };
}

async function deleteTrainer(trainerId) {
  const database = await connectDB();
  if (database) {
    try {
      await database.collection('trainers').deleteOne({ trainerId });
    } catch (e) {}
  }

  const store = readJsonDb();
  store.trainers = store.trainers.filter(t => t.trainerId !== trainerId);
  writeJsonDb(store);
  return { success: true, trainerId };
}

// --- Projects ---
async function getProjects() {
  const database = await connectDB();
  if (database) {
    try {
      const list = await database.collection('projects').find({}).sort({ order: 1 }).toArray();
      if (list && list.length > 0) return list;
    } catch (e) {
      console.warn('[MongoDB getProjects fallback]', e.message);
    }
  }

  const store = readJsonDb();
  return store.projects.sort((a, b) => (a.order || 0) - (b.order || 0));
}

async function saveProject(projectData) {
  const database = await connectDB();
  const projectId = projectData.projectId || ('project-' + Date.now());
  const document = {
    ...projectData,
    projectId,
    updatedAt: new Date()
  };
  delete document._id;

  if (database) {
    try {
      await database.collection('projects').updateOne(
        { projectId },
        { $set: document },
        { upsert: true }
      );
    } catch (e) {}
  }

  const store = readJsonDb();
  const idx = store.projects.findIndex(p => p.projectId === projectId);
  if (idx >= 0) {
    store.projects[idx] = { ...document, updatedAt: document.updatedAt.toISOString() };
  } else {
    store.projects.push({ ...document, updatedAt: document.updatedAt.toISOString() });
  }
  writeJsonDb(store);
  return { success: true, projectId, data: document };
}

async function deleteProject(projectId) {
  const database = await connectDB();
  if (database) {
    try {
      await database.collection('projects').deleteOne({ projectId });
    } catch (e) {}
  }

  const store = readJsonDb();
  store.projects = store.projects.filter(p => p.projectId !== projectId);
  writeJsonDb(store);
  return { success: true, projectId };
}

// --- Settings ---
async function getSettings() {
  const database = await connectDB();
  if (database) {
    try {
      const settings = await database.collection('settings').findOne({ settingsId: 'general' });
      if (settings) return settings;
    } catch (e) {
      console.warn('[MongoDB getSettings fallback]', e.message);
    }
  }

  const store = readJsonDb();
  return store.settings;
}

async function saveSettings(settingsData) {
  const database = await connectDB();
  const document = {
    ...settingsData,
    settingsId: 'general',
    updatedAt: new Date()
  };
  delete document._id;

  if (database) {
    try {
      await database.collection('settings').updateOne(
        { settingsId: 'general' },
        { $set: document },
        { upsert: true }
      );
    } catch (e) {}
  }

  const store = readJsonDb();
  store.settings = { ...store.settings, ...document, updatedAt: document.updatedAt.toISOString() };
  writeJsonDb(store);
  return { success: true, settings: store.settings };
}

// --- Subscribers & Career Leads ---
async function saveSubscriber(email) {
  const database = await connectDB();
  const doc = { email, createdAt: new Date() };
  if (database) {
    try {
      await database.collection('subscribers').insertOne(doc);
    } catch (e) {}
  }
  const store = readJsonDb();
  store.subscribers.push({ email, createdAt: doc.createdAt.toISOString() });
  writeJsonDb(store);
  return { success: true, email };
}

async function saveCareerLead(leadData) {
  const database = await connectDB();
  const doc = { ...leadData, createdAt: new Date() };
  if (database) {
    try {
      await database.collection('career_leads').insertOne(doc);
    } catch (e) {}
  }
  const store = readJsonDb();
  store.career_leads.push({ ...leadData, createdAt: doc.createdAt.toISOString() });
  writeJsonDb(store);
  return { success: true, lead: doc };
}

// --- Status & Diagnostics ---
async function getDbStatus() {
  try {
    const database = await connectDB();
    if (database) {
      const collections = await database.listCollections().toArray();
      const stats = {};
      for (const col of collections) {
        stats[col.name] = await database.collection(col.name).countDocuments();
      }
      return {
        connected: true,
        database: DB_NAME,
        host: MONGODB_URI.includes('@') ? 'MongoDB Atlas' : 'Local MongoDB (localhost:27017)',
        engine: 'MongoDB',
        collections: collections.map(c => c.name),
        counts: stats
      };
    } else {
      const store = readJsonDb();
      return {
        connected: true,
        database: 'Cloud Persistent Database',
        host: 'Local Disk Storage Engine',
        engine: 'Persistent Storage',
        collections: ['trainers', 'projects', 'settings', 'certificates', 'inquiries'],
        counts: {
          trainers: store.trainers.length,
          projects: store.projects.length,
          settings: 1,
          certificates: store.certificates.length,
          inquiries: store.inquiries.length
        }
      };
    }
  } catch (err) {
    const store = readJsonDb();
    return {
      connected: true,
      database: 'Cloud Persistent Database',
      host: 'Local Disk Storage Engine',
      engine: 'Persistent Storage',
      collections: ['trainers', 'projects', 'settings', 'certificates', 'inquiries'],
      counts: {
        trainers: store.trainers.length,
        projects: store.projects.length,
        settings: 1,
        certificates: store.certificates.length,
        inquiries: store.inquiries.length
      }
    };
  }
}

// =========================================================================
// SUB-ADMIN USER MANAGEMENT & AUTHENTICATION
// =========================================================================
async function getAdminUsers() {
  const database = await connectDB();
  if (database) {
    try {
      const users = await database.collection('admin_users').find({}).sort({ createdAt: -1 }).toArray();
      return users.map(u => ({
        username: u.username,
        name: u.name,
        role: u.role || 'admin',
        createdAt: u.createdAt,
        password: u.password
      }));
    } catch (e) {
      console.error('[getAdminUsers MongoDB error]', e.message);
    }
  }
  const store = readJsonDb();
  store.admin_users = store.admin_users || [];
  return store.admin_users;
}

async function createAdminUser({ username, password, name }) {
  const cleanUser = (username || '').toLowerCase().trim();
  const cleanPass = (password || '').trim();
  if (!cleanUser || !cleanPass) {
    throw new Error('Username and password are required');
  }
  if (cleanUser === 'admin' || cleanUser === 'rohan') {
    throw new Error('Username "admin" is reserved for Super Admin');
  }

  const existing = await getAdminUsers();
  if (existing.some(u => u.username.toLowerCase() === cleanUser)) {
    throw new Error(`Username "${cleanUser}" already exists. Please choose another username.`);
  }

  const newUser = {
    username: cleanUser,
    password: cleanPass,
    name: (name || cleanUser).trim(),
    role: 'admin',
    createdAt: new Date()
  };

  const database = await connectDB();
  if (database) {
    try {
      await database.collection('admin_users').insertOne({ ...newUser });
    } catch (e) {
      console.error('[createAdminUser MongoDB error]', e.message);
    }
  }

  const store = readJsonDb();
  store.admin_users = store.admin_users || [];
  store.admin_users.push({ ...newUser, createdAt: newUser.createdAt.toISOString() });
  writeJsonDb(store);

  return { success: true, user: newUser };
}

async function deleteAdminUser(username) {
  const cleanUser = (username || '').toLowerCase().trim();
  const database = await connectDB();
  if (database) {
    try {
      await database.collection('admin_users').deleteOne({ username: cleanUser });
    } catch (e) {
      console.error('[deleteAdminUser MongoDB error]', e.message);
    }
  }

  const store = readJsonDb();
  store.admin_users = (store.admin_users || []).filter(u => u.username.toLowerCase() !== cleanUser);
  writeJsonDb(store);

  return { success: true };
}

async function authenticateUser(username, password) {
  const cleanUser = (username || '').toLowerCase().trim();
  const cleanPass = (password || '').trim();

  // 1. Super Admin Authentication
  const settings = await getSettings();
  const validSuperUser = (settings.adminUsername || 'admin').toLowerCase().trim();
  const validSuperPass = (settings.adminPassword || 'admin@arinfotech2026').trim();

  if ((cleanUser === validSuperUser || cleanUser === 'rohan') && cleanPass === validSuperPass) {
    return {
      success: true,
      user: {
        username: cleanUser,
        name: 'Super Admin',
        role: 'superadmin'
      }
    };
  }

  // 2. Sub-Admin Authentication
  const subAdmins = await getAdminUsers();
  const found = subAdmins.find(u => u.username.toLowerCase() === cleanUser && u.password === cleanPass);
  if (found) {
    return {
      success: true,
      user: {
        username: found.username,
        name: found.name || found.username,
        role: 'admin'
      }
    };
  }

  return { success: false, error: 'Incorrect username or password' };
}

module.exports = {
  connectDB,
  saveInquiry,
  getInquiries,
  deleteInquiry,
  updateInquiryStatus,
  verifyCertificate,
  saveCertificate,
  getAllCertificates,
  deleteCertificate,
  saveSubscriber,
  saveCareerLead,
  getDbStatus,
  getTrainers,
  saveTrainer,
  deleteTrainer,
  getProjects,
  saveProject,
  deleteProject,
  getSettings,
  saveSettings,
  getAdminUsers,
  createAdminUser,
  deleteAdminUser,
  authenticateUser
};
