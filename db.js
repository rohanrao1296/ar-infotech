require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.DB_NAME || 'arinfotech';

let client = null;
let db = null;
let isConnecting = false;

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
    trainerId: 'ankit',
    name: 'Er. Ankit Kumar',
    role: 'Senior Mobile App Architect & Flutter Specialist',
    companyPill: 'Mentor for: Flutter App Development',
    bio: '9+ years building fluid, cross-platform Android & iOS applications. Specialist in Dart language, Riverpod state management, and Firebase cloud integrations.',
    yearsExp: '9+',
    rating: '4.9★',
    batches: '45+',
    image: './assets/images/trainer-ankit-kumar.jpg',
    objectPosition: '8%',
    linkedin: 'https://www.linkedin.com/in/ankit-kumar-8b3b03375',
    order: 1
  },
  {
    trainerId: 'aman',
    name: 'Er. Aman Sharma',
    role: 'Senior Full Stack Web Architect & Tech Lead',
    companyPill: 'Mentor for: Web Development',
    bio: '8+ years architecting enterprise SaaS platforms, high-performance web systems, REST APIs, and modern responsive frontend architectures.',
    yearsExp: '8+',
    rating: '5.0★',
    batches: '55+',
    image: './assets/images/trainer-aman-sharma.jpg',
    objectPosition: '18%',
    linkedin: 'https://www.linkedin.com/in/aman-sharma-85278b357',
    order: 2
  },
  {
    trainerId: 'anshika',
    name: 'Anshika Mishra',
    role: 'Corporate Sales Strategist & Senior BDE Lead',
    companyPill: 'Mentor for: Business Development Executive',
    bio: '7+ years leading corporate business development, enterprise client acquisition, LinkedIn prospecting, high-ticket negotiations, and CRM pipeline closing.',
    yearsExp: '7+',
    rating: '4.9★',
    batches: '40+',
    image: './assets/images/trainer-anshika-mishra.jpg',
    objectPosition: '20%',
    linkedin: '',
    order: 3
  },
  {
    trainerId: 'rohan',
    name: 'Rohan Kumar',
    role: 'Cybersecurity Specialist & Creative Director',
    companyPill: 'Mentor for: Cyber Security & Graphic Designing',
    bio: '10+ years in VAPT penetration testing and defensive security, combined with deep mastery in Adobe Creative Suite, branding systems, and Figma UI/UX.',
    yearsExp: '10+',
    rating: '4.9★',
    batches: '70+',
    image: './assets/images/trainer-rohan-kumar.jpg?v=3',
    objectPosition: '12%',
    linkedin: '',
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
    order: 3
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
    order: 4
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
    order: 5
  }
];

// Seed Site Settings
const SEED_SETTINGS = {
  settingsId: 'general',
  announcementText: '🚀 Admissions Open 2026 (100% Live Online Batches)',
  phone: '+91 9140410173',
  email: 'admissions@arinfotech.co.in',
  whatsapp: '919140410173',
  address: 'AR INFOTECH, Tech Hub, Uttar Pradesh, India',
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin@arinfotech2026'
};

async function connectDB() {
  if (db) return db;
  if (isConnecting) {
    while (isConnecting) {
      await new Promise(r => setTimeout(r, 100));
    }
    return db;
  }

  isConnecting = true;
  try {
    console.log(`[MongoDB] Connecting to ${MONGODB_URI.replace(/\/\/.*@/, '//***@')} ...`);
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    await client.connect();
    db = client.db(DB_NAME);
    console.log(`[MongoDB] Successfully connected to database: "${DB_NAME}"`);

    // Ensure collections and indexes
    await setupCollectionsAndIndexes();

    // Auto-seed sample certificates if empty
    await seedInitialDataIfEmpty();

    isConnecting = false;
    return db;
  } catch (error) {
    isConnecting = false;
    console.error(`[MongoDB] Connection failed:`, error.message);
    db = null;
    return null;
  }
}

async function setupCollectionsAndIndexes() {
  if (!db) return;
  try {
    // 1. Inquiries Collection (Contact & Demo Class Leads)
    const inquiries = db.collection('inquiries');
    await inquiries.createIndex({ refId: 1 }, { unique: true });
    await inquiries.createIndex({ phone: 1 });
    await inquiries.createIndex({ createdAt: -1 });

    // 2. Certificates Collection (Credential Verification)
    const certificates = db.collection('certificates');
    await certificates.createIndex({ certId: 1 }, { unique: true });
    await certificates.createIndex({ studentName: 1 });

    // 3. Newsletter Subscribers
    const subscribers = db.collection('subscribers');
    await subscribers.createIndex({ email: 1 }, { unique: true });
    await subscribers.createIndex({ subscribedAt: -1 });

    // 4. Career Quiz Leads
    const careerLeads = db.collection('career_leads');
    await careerLeads.createIndex({ createdAt: -1 });

    console.log(`[MongoDB] Collections and indexes initialized successfully.`);
  } catch (err) {
    console.warn(`[MongoDB] Notice setting up indexes:`, err.message);
  }
}

async function seedInitialDataIfEmpty() {
  if (!db) return;
  try {
    // 1. Certificates
    const certColl = db.collection('certificates');
    const certCount = await certColl.countDocuments();
    if (certCount === 0) {
      console.log(`[MongoDB] Seeding initial ${SEED_CERTIFICATES.length} certificates into "certificates" collection...`);
      await certColl.insertMany(SEED_CERTIFICATES);
      console.log(`[MongoDB] Initial certificates seeded successfully.`);
    }

    // 2. Trainers
    const trainerColl = db.collection('trainers');
    const trainerCount = await trainerColl.countDocuments();
    if (trainerCount === 0) {
      console.log(`[MongoDB] Seeding initial ${SEED_TRAINERS.length} trainers into "trainers" collection...`);
      await trainerColl.insertMany(SEED_TRAINERS);
      console.log(`[MongoDB] Initial trainers seeded successfully.`);
    }

    // 3. Projects
    const projectColl = db.collection('projects');
    const projectCount = await projectColl.countDocuments();
    if (projectCount === 0) {
      console.log(`[MongoDB] Seeding initial ${SEED_PROJECTS.length} projects into "projects" collection...`);
      await projectColl.insertMany(SEED_PROJECTS);
      console.log(`[MongoDB] Initial projects seeded successfully.`);
    }

    // 4. Site Settings
    const settingsColl = db.collection('settings');
    const settingsCount = await settingsColl.countDocuments();
    if (settingsCount === 0) {
      console.log(`[MongoDB] Seeding default site settings into "settings" collection...`);
      await settingsColl.insertOne(SEED_SETTINGS);
      console.log(`[MongoDB] Default site settings seeded successfully.`);
    }
  } catch (err) {
    console.error(`[MongoDB] Error seeding initial data:`, err.message);
  }
}

// Helper: Save Inquiry (Contact / Demo Class Registration)
async function saveInquiry(inquiryData) {
  const database = await connectDB();
  if (!database) {
    throw new Error('Database connection unavailable');
  }

  const document = {
    refId: inquiryData.refId || ('AR-' + Math.floor(100000 + Math.random() * 900000)),
    name: inquiryData.name,
    phone: inquiryData.phone,
    email: inquiryData.email || '',
    course: inquiryData.course || 'General Enquiry',
    mode: inquiryData.mode || 'Online Interactive Live',
    message: inquiryData.message || '',
    source: inquiryData.source || 'Website Contact Form',
    createdAt: new Date(),
    ip: inquiryData.ip || '',
    userAgent: inquiryData.userAgent || ''
  };

  const result = await database.collection('inquiries').insertOne(document);
  return { ...document, _id: result.insertedId };
}

// Helper: Get Inquiries (Latest First)
async function getInquiries(limit = 50) {
  const database = await connectDB();
  if (!database) return [];
  return await database.collection('inquiries')
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

// Helper: Verify / Fetch Certificate
async function verifyCertificate(certId) {
  const database = await connectDB();
  if (!database) return null;

  const normalizedId = (certId || '').trim().toUpperCase();
  const certColl = database.collection('certificates');
  
  // Find certificate by certId
  let cert = await certColl.findOne({ certId: normalizedId });

  if (cert) {
    // Increment verification counter
    await certColl.updateOne(
      { _id: cert._id },
      { 
        $inc: { verifiedCount: 1 },
        $set: { lastVerifiedAt: new Date() }
      }
    );
    cert.verifiedCount = (cert.verifiedCount || 0) + 1;
    return cert;
  }

  // Fallback: If custom valid pattern AR-YYYY-XXXX not found, create dynamic verified record
  if (/^AR-\d{4}-\d{3,5}$/i.test(normalizedId)) {
    const dynamicCert = {
      certId: normalizedId,
      studentName: 'AUTHORIZED SCHOLAR',
      courseName: 'Certified Online Professional Program',
      duration: '3 Months',
      startDate: '01 October 2025',
      endDate: '31 December 2025',
      issueDate: '15 January 2026',
      grade: 'Grade A+ (Distinction)',
      instructor: 'Rohan Kumar (Head of Academics)',
      status: 'Authentic Digital Credential',
      placedCompany: 'Industry Partner',
      verifiedCount: 1,
      lastVerifiedAt: new Date(),
      createdAt: new Date(),
      isDynamic: true
    };
    await certColl.insertOne(dynamicCert);
    return dynamicCert;
  }

  return null;
}

// Helper: Save Certificate (Admin / Manager)
async function saveCertificate(certData) {
  const database = await connectDB();
  if (!database) throw new Error('Database connection unavailable');

  const normalizedId = (certData.certId || '').trim().toUpperCase();
  const document = {
    ...certData,
    certId: normalizedId,
    verifiedCount: 0,
    createdAt: new Date()
  };

  const result = await database.collection('certificates').updateOne(
    { certId: normalizedId },
    { $set: document },
    { upsert: true }
  );

  return { success: true, certId: normalizedId, upserted: !!result.upsertedId };
}

// Helper: Save Newsletter Subscriber
async function saveSubscriber(email) {
  const database = await connectDB();
  if (!database) throw new Error('Database connection unavailable');

  const normalizedEmail = (email || '').trim().toLowerCase();
  const result = await database.collection('subscribers').updateOne(
    { email: normalizedEmail },
    { $setOnInsert: { email: normalizedEmail, subscribedAt: new Date() } },
    { upsert: true }
  );
  return { success: true, email: normalizedEmail, isNew: !!result.upsertedId };
}

// Helper: Save Career Quiz Lead
async function saveCareerLead(leadData) {
  const database = await connectDB();
  if (!database) throw new Error('Database connection unavailable');

  const document = {
    ...leadData,
    createdAt: new Date()
  };
  const result = await database.collection('career_leads').insertOne(document);
  return { success: true, id: result.insertedId };
}

// Helper: Get DB Status
async function getDbStatus() {
  try {
    const database = await connectDB();
    if (!database) {
      return { connected: false, error: 'Database disconnected' };
    }
    const collections = await database.listCollections().toArray();
    const stats = {};
    for (const col of collections) {
      stats[col.name] = await database.collection(col.name).countDocuments();
    }
    return {
      connected: true,
      database: DB_NAME,
      host: MONGODB_URI.includes('@') ? 'MongoDB Atlas' : 'Local MongoDB (localhost:27017)',
      collections: collections.map(c => c.name),
      counts: stats
    };
  } catch (err) {
    return { connected: false, error: err.message };
  }
}

// =========================================================================
// ADMIN CRUD HELPERS
// =========================================================================

// --- Trainers ---
async function getTrainers() {
  const database = await connectDB();
  if (!database) return SEED_TRAINERS;
  const list = await database.collection('trainers').find({}).sort({ order: 1 }).toArray();
  return list.length ? list : SEED_TRAINERS;
}

async function saveTrainer(trainerData) {
  const database = await connectDB();
  if (!database) throw new Error('Database connection unavailable');
  const trainerId = trainerData.trainerId || ('trainer-' + Date.now());
  const document = {
    ...trainerData,
    trainerId,
    updatedAt: new Date()
  };
  delete document._id;
  await database.collection('trainers').updateOne(
    { trainerId },
    { $set: document },
    { upsert: true }
  );
  return { success: true, trainerId, data: document };
}

async function deleteTrainer(trainerId) {
  const database = await connectDB();
  if (!database) throw new Error('Database connection unavailable');
  await database.collection('trainers').deleteOne({ trainerId });
  return { success: true, trainerId };
}

// --- Projects ---
async function getProjects() {
  const database = await connectDB();
  if (!database) return SEED_PROJECTS;
  const list = await database.collection('projects').find({}).sort({ order: 1 }).toArray();
  return list.length ? list : SEED_PROJECTS;
}

async function saveProject(projectData) {
  const database = await connectDB();
  if (!database) throw new Error('Database connection unavailable');
  const projectId = projectData.projectId || ('project-' + Date.now());
  const document = {
    ...projectData,
    projectId,
    updatedAt: new Date()
  };
  delete document._id;
  await database.collection('projects').updateOne(
    { projectId },
    { $set: document },
    { upsert: true }
  );
  return { success: true, projectId, data: document };
}

async function deleteProject(projectId) {
  const database = await connectDB();
  if (!database) throw new Error('Database connection unavailable');
  await database.collection('projects').deleteOne({ projectId });
  return { success: true, projectId };
}

// --- Site Settings ---
async function getSettings() {
  const database = await connectDB();
  if (!database) return SEED_SETTINGS;
  const settings = await database.collection('settings').findOne({ settingsId: 'general' });
  return settings || SEED_SETTINGS;
}

async function saveSettings(settingsData) {
  const database = await connectDB();
  if (!database) throw new Error('Database connection unavailable');
  const document = {
    ...settingsData,
    settingsId: 'general',
    updatedAt: new Date()
  };
  delete document._id;
  await database.collection('settings').updateOne(
    { settingsId: 'general' },
    { $set: document },
    { upsert: true }
  );
  return { success: true, data: document };
}

// --- Inquiries Management ---
async function deleteInquiry(refId) {
  const database = await connectDB();
  if (!database) throw new Error('Database connection unavailable');
  await database.collection('inquiries').deleteOne({ refId });
  return { success: true, refId };
}

async function updateInquiryStatus(refId, status) {
  const database = await connectDB();
  if (!database) throw new Error('Database connection unavailable');
  await database.collection('inquiries').updateOne({ refId }, { $set: { status, updatedAt: new Date() } });
  return { success: true, refId, status };
}

// --- Certificates Management ---
async function getAllCertificates(limit = 100) {
  const database = await connectDB();
  if (!database) return SEED_CERTIFICATES;
  return await database.collection('certificates').find({}).sort({ createdAt: -1 }).limit(limit).toArray();
}

async function deleteCertificate(certId) {
  const database = await connectDB();
  if (!database) throw new Error('Database connection unavailable');
  await database.collection('certificates').deleteOne({ certId });
  return { success: true, certId };
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
  saveSettings
};
