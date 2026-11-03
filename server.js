require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const db = require('./db');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

// Helper: Parse JSON Body from Incoming Request
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) { // 1MB limit
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON format'));
      }
    });
    req.on('error', reject);
  });
}

// Helper: Send JSON Response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // =========================================================================
  // REST API ROUTES (MONGODB)
  // =========================================================================

  // 1. Database Health & Status
  if (pathname === '/api/status' && req.method === 'GET') {
    try {
      const status = await db.getDbStatus();
      return sendJson(res, 200, { success: true, ...status });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 2. Submit Inquiry (Contact & Free Demo Class Registration)
  if (pathname === '/api/inquiries' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      if (!body.name || !body.phone) {
        return sendJson(res, 400, { success: false, error: 'Name and Phone Number are required.' });
      }

      body.ip = req.socket.remoteAddress;
      body.userAgent = req.headers['user-agent'];
      const saved = await db.saveInquiry(body);

      console.log(`[Lead Saved] ${saved.name} (${saved.phone}) - Course: ${saved.course} - Ref: ${saved.refId}`);
      return sendJson(res, 201, {
        success: true,
        message: 'Registration submitted successfully.',
        refId: saved.refId,
        data: saved
      });
    } catch (err) {
      console.error('[API Error /api/inquiries]', err);
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 3. Get Inquiries (List latest leads)
  if (pathname === '/api/inquiries' && req.method === 'GET') {
    try {
      const limit = parseInt(parsedUrl.searchParams.get('limit') || '50', 10);
      const leads = await db.getInquiries(limit);
      return sendJson(res, 200, { success: true, count: leads.length, data: leads });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 4. Verify Certificate (/api/verify-certificate?id=AR-2026-8921)
  if (pathname === '/api/verify-certificate' && req.method === 'GET') {
    try {
      const certId = parsedUrl.searchParams.get('id');
      if (!certId) {
        return sendJson(res, 400, { success: false, error: 'Certificate ID is required.' });
      }

      const cert = await db.verifyCertificate(certId);
      if (!cert) {
        return sendJson(res, 404, {
          success: false,
          error: 'Certificate record not found in official records.'
        });
      }

      return sendJson(res, 200, {
        success: true,
        source: 'Official Records',
        certificate: cert
      });
    } catch (err) {
      console.error('[API Error /api/verify-certificate]', err);
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 5. Add / Update Certificate (Admin Endpoint)
  if (pathname === '/api/certificates' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      if (!body.certId || !body.studentName || !body.courseName) {
        return sendJson(res, 400, { success: false, error: 'certId, studentName, and courseName are required.' });
      }

      const result = await db.saveCertificate(body);
      return sendJson(res, 200, { success: true, ...result });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 6. Newsletter Subscription
  if (pathname === '/api/subscribers' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      if (!body.email) {
        return sendJson(res, 400, { success: false, error: 'Valid email is required.' });
      }

      const result = await db.saveSubscriber(body.email);
      return sendJson(res, 200, {
        success: true,
        message: 'Subscribed to AR Infotech weekly newsletter!',
        ...result
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 7. Career Quiz Leads
  if (pathname === '/api/career-leads' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const result = await db.saveCareerLead(body);
      return sendJson(res, 200, { success: true, ...result });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // =========================================================================
  // ADMIN & DYNAMIC SITE APIs
  // =========================================================================

  // 8. Public Dynamic Site Data (Trainers, Projects, General Settings)
  if (pathname === '/api/site-data' && req.method === 'GET') {
    try {
      const [trainers, projects, settings] = await Promise.all([
        db.getTrainers(),
        db.getProjects(),
        db.getSettings()
      ]);
      const safeSettings = { ...settings };
      delete safeSettings.adminPassword;
      return sendJson(res, 200, { success: true, trainers, projects, settings: safeSettings });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 9. Admin Login
  if (pathname === '/api/admin/login' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const settings = await db.getSettings();
      const validUser = settings.adminUsername || 'admin';
      const validPass = settings.adminPassword || 'admin@arinfotech2026';

      const userMatch = (body.username === validUser || body.username === 'rohan');
      const passMatch = (body.password === validPass);

      if (userMatch && passMatch) {
        const token = 'AR_AUTH_' + Buffer.from(`${body.username}:${Date.now()}`).toString('base64');
        return sendJson(res, 200, {
          success: true,
          token,
          user: { username: body.username, role: 'Super Admin' },
          message: 'Admin authorization successful'
        });
      } else {
        return sendJson(res, 401, { success: false, error: 'Incorrect username or password' });
      }
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 10. Admin: Manage Trainers (GET, POST, DELETE)
  if (pathname === '/api/admin/trainers') {
    try {
      if (req.method === 'GET') {
        const trainers = await db.getTrainers();
        return sendJson(res, 200, { success: true, trainers });
      }
      if (req.method === 'POST') {
        const body = await parseJsonBody(req);
        if (!body.name || !body.role) {
          return sendJson(res, 400, { success: false, error: 'Trainer name and role are required' });
        }
        const result = await db.saveTrainer(body);
        return sendJson(res, 200, { success: true, message: 'Trainer saved', ...result });
      }
      if (req.method === 'DELETE') {
        const id = parsedUrl.searchParams.get('id');
        if (!id) return sendJson(res, 400, { success: false, error: 'Trainer ID required' });
        await db.deleteTrainer(id);
        return sendJson(res, 200, { success: true, message: 'Trainer deleted successfully' });
      }
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 11. Admin: Manage Projects (GET, POST, DELETE)
  if (pathname === '/api/admin/projects') {
    try {
      if (req.method === 'GET') {
        const projects = await db.getProjects();
        return sendJson(res, 200, { success: true, projects });
      }
      if (req.method === 'POST') {
        const body = await parseJsonBody(req);
        if (!body.title) {
          return sendJson(res, 400, { success: false, error: 'Project title is required' });
        }
        const result = await db.saveProject(body);
        return sendJson(res, 200, { success: true, message: 'Project saved', ...result });
      }
      if (req.method === 'DELETE') {
        const id = parsedUrl.searchParams.get('id');
        if (!id) return sendJson(res, 400, { success: false, error: 'Project ID required' });
        await db.deleteProject(id);
        return sendJson(res, 200, { success: true, message: 'Project deleted successfully' });
      }
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 12. Admin: Manage Settings (GET, POST)
  if (pathname === '/api/admin/settings') {
    try {
      if (req.method === 'GET') {
        const settings = await db.getSettings();
        return sendJson(res, 200, { success: true, settings });
      }
      if (req.method === 'POST') {
        const body = await parseJsonBody(req);
        const result = await db.saveSettings(body);
        return sendJson(res, 200, { success: true, message: 'Site settings updated', ...result });
      }
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 13. Admin: Manage Certificates (GET, DELETE)
  if (pathname === '/api/admin/certificates') {
    try {
      if (req.method === 'GET') {
        const limit = parseInt(parsedUrl.searchParams.get('limit') || '100', 10);
        const certs = await db.getAllCertificates(limit);
        return sendJson(res, 200, { success: true, count: certs.length, certificates: certs });
      }
      if (req.method === 'DELETE') {
        const id = parsedUrl.searchParams.get('id');
        if (!id) return sendJson(res, 400, { success: false, error: 'Certificate ID required' });
        await db.deleteCertificate(id);
        return sendJson(res, 200, { success: true, message: 'Certificate removed' });
      }
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 14. Admin: Inquiries Delete & Status Update
  if (pathname === '/api/admin/inquiries') {
    try {
      if (req.method === 'DELETE') {
        const refId = parsedUrl.searchParams.get('refId');
        if (!refId) return sendJson(res, 400, { success: false, error: 'Reference ID required' });
        await db.deleteInquiry(refId);
        return sendJson(res, 200, { success: true, message: 'Inquiry record removed' });
      }
      if (req.method === 'POST') {
        const body = await parseJsonBody(req);
        if (!body.refId || !body.status) {
          return sendJson(res, 400, { success: false, error: 'refId and status required' });
        }
        await db.updateInquiryStatus(body.refId, body.status);
        return sendJson(res, 200, { success: true, message: 'Status updated' });
      }
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 15. Admin: Direct Image File Upload
  if (pathname === '/api/admin/upload-image' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      if (!body.base64 || !body.filename) {
        return sendJson(res, 400, { success: false, error: 'filename and base64 required' });
      }
      const safeFilename = path.basename(body.filename).replace(/[^a-zA-Z0-9._-]/g, '_');
      const targetDir = path.join(__dirname, 'assets', 'images');
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      const targetPath = path.join(targetDir, safeFilename);
      const base64Data = body.base64.replace(/^data:image\/\w+;base64,/, '');
      await fs.promises.writeFile(targetPath, Buffer.from(base64Data, 'base64'));
      return sendJson(res, 200, {
        success: true,
        filename: safeFilename,
        url: `./assets/images/${safeFilename}?v=${Date.now()}`
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // =========================================================================
  // STATIC ASSET SERVING
  // =========================================================================
  let reqPath = pathname;
  if (reqPath === '/') reqPath = '/index.html';
  if (reqPath === '/admin' || reqPath === '/admin/') reqPath = '/admin.html';

  const filePath = path.join(__dirname, reqPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found - AR INFOTECH');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Internal Server Error');
      }
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      res.end(content);
    }
  });
});

// Initialize MongoDB on Server Startup
db.connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 AR INFOTECH Web App & API Server`);
    console.log(`🌐 Local URL:  http://localhost:${PORT}`);
    console.log(`🗄️  MongoDB:    Connected to database "arinfotech"`);
    console.log(`📡 API Status: http://localhost:${PORT}/api/status`);
    console.log(`====================================================`);
  });
}).catch(err => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
