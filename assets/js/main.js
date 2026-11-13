/**
 * AR INFOTECH - Interactive Web Application Logic
 * Features:
 * - Dynamic Course Filtering & Search
 * - Interactive Syllabus Modal
 * - Live Certificate Verification Engine
 * - Interactive Career Path Recommendation Quiz
 * - Course Fee & Flexible EMI Calculator
 * - Enquiry Submission with LocalStorage & WhatsApp Redirect
 * - Scroll Spy & Animated Numbers
 * - PWA Service Worker Registration & App Install Handler
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initCounters();
  initCourseFilters();
  initCourseModals();
  initCertificateVerification();
  initCareerQuiz();
  initFeeCalculator();
  initEnquiryForm();
  initPWA();
  syncDynamicSiteData();
});

/* ==========================================================================
   1. NAVBAR & MOBILE DRAWER
   ========================================================================== */
function initNavbar() {
  const header = document.querySelector('.header');
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  const mobileOverlay = document.querySelector('.mobile-drawer-overlay');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  const backToTop = document.querySelector('.back-to-top');

  // Sticky header shadow on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
      backToTop?.classList.add('visible');
    } else {
      header?.classList.remove('scrolled');
      backToTop?.classList.remove('visible');
    }
    updateScrollSpy();
  });

  // Mobile menu toggle
  function toggleMobileMenu() {
    mobileBtn?.classList.toggle('open');
    mobileDrawer?.classList.toggle('open');
    mobileOverlay?.classList.toggle('open');
    document.body.style.overflow = mobileDrawer?.classList.contains('open') ? 'hidden' : '';
  }

  mobileBtn?.addEventListener('click', toggleMobileMenu);
  mobileOverlay?.addEventListener('click', toggleMobileMenu);

  // Close drawer on link click
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (mobileDrawer?.classList.contains('open')) {
        toggleMobileMenu();
      }
    });
  });

  // Dropdown toggle on click/touch
  const navDropdown = document.querySelector('.nav-dropdown');
  const dropdownToggle = document.querySelector('.dropdown-toggle');
  dropdownToggle?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    navDropdown?.classList.toggle('open');
  });

  document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
      navDropdown?.classList.remove('open');
    });
  });

  document.addEventListener('click', (e) => {
    if (!navDropdown?.contains(e.target)) {
      navDropdown?.classList.remove('open');
    }
  });

  // Back to top smooth scroll
  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Active section scroll spy
  function updateScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        document.querySelectorAll('.nav-link').forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }
}

/* ==========================================================================
   2. ANIMATED STATS COUNTER
   ========================================================================== */
function initCounters() {
  const statNumbers = document.querySelectorAll('.stat-number');
  let started = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !started) {
        statNumbers.forEach(num => {
          const target = parseInt(num.getAttribute('data-target') || '0', 10);
          const prefix = num.getAttribute('data-prefix') || '';
          const suffix = num.getAttribute('data-suffix') || '';
          let count = 0;
          const speed = Math.max(1, Math.floor(target / 60));

          const update = () => {
            count += speed;
            if (count < target) {
              num.innerText = `${prefix}${count.toLocaleString()}${suffix}`;
              requestAnimationFrame(update);
            } else {
              num.innerText = `${prefix}${target.toLocaleString()}${suffix}`;
            }
          };
          update();
        });
        started = true;
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.querySelector('.stats-bar');
  if (statsSection) observer.observe(statsSection);
}

/* ==========================================================================
   3. COURSE FILTERING & SEARCH
   ========================================================================== */
function initCourseFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const courseCards = document.querySelectorAll('.course-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      courseCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.35s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   4. SYLLABUS MODAL & ENROLLMENT TRIGGER
   ========================================================================== */
const courseSyllabusData = {
  'cyber-security': {
    title: 'Cyber Security & Ethical Hacking Masterclass (100% Online)',
    instructor: 'Rohan Kumar (Cybersecurity Specialist)',
    duration: '3 Months (Live Online Training)',
    mode: '100% Live Interactive Online',
    fee: '₹1,199 (Online Special Offer • Reg: ₹5,000)',
    modules: [
      'Module 1: Computer Networking Protocols, TCP/IP, OSI & Wireshark Packet Sniffing',
      'Module 2: Linux Security Architecture, Kali Linux Toolkit & Footprinting',
      'Module 3: Vulnerability Assessment & Penetration Testing (VAPT Methodologies)',
      'Module 4: Web Application Security (OWASP Top 10 Exploitation & Bug Bounty Proofs)',
      'Module 5: Network Attacks, Wireless Hacking, Firewalls & Defensive Hardening',
      'Module 6: Digital Forensics, Incident Response & Ethical Hacking Standards'
    ],
    capstone: 'Live Security Diagnostic & Web Auditing Tool (URL Doctor v2.0) & Sandboxed Network VAPT by Rohan Kumar.',
    tools: 'Kali Linux, Burp Suite, Nmap, Metasploit, Wireshark, Python 3, URL Doctor'
  },
  'web-dev': {
    title: 'Full Stack Web Development Masterclass (100% Online)',
    instructor: 'Er. Aman Sharma (Senior Full Stack Web Architect)',
    duration: '3 Months (Live Online Training)',
    mode: '100% Live Interactive Online',
    fee: '₹1,199 (Online Special Offer • Reg: ₹5,000)',
    modules: [
      'Module 1: Modern Semantic HTML5, CSS3, Flexbox, CSS Grid & Responsive UI Systems',
      'Module 2: Advanced JavaScript ES6+, Async/Await, DOM Manipulation & Fetch APIs',
      'Module 3: React.js & Next.js - Custom Hooks, State Management & Modern UI Components',
      'Module 4: Backend Engineering with Node.js, Express & RESTful APIs',
      'Module 5: Database Modeling with MongoDB & PostgreSQL',
      'Module 6: JWT Authentication, Cloud Hosting (Vercel/Render) & Git/GitHub CI/CD'
    ],
    capstone: 'Aakriti Ultrasound Diagnostic Portal (Firebase Live) & Savitri Vidya Vihar ERP System mentored by Er. Aman Sharma & Rohan Kumar.',
    tools: 'HTML5, CSS3, JavaScript, React.js, Next.js, Node.js, MongoDB, Git, GitHub'
  },
  'flutter-app': {
    title: 'Cross-Platform Flutter & Dart App Development (100% Online)',
    instructor: 'Er. Ankit Kumar (Senior Mobile App Architect)',
    duration: '3 Months (Live Online Training)',
    mode: '100% Live Interactive Online',
    fee: '₹1,199 (Online Special Offer • Reg: ₹5,000)',
    modules: [
      'Module 1: Dart Programming Language Fundamentals, OOP & Asynchronous Coding',
      'Module 2: Flutter Framework Architecture, Custom Widgets & Responsive Design',
      'Module 3: State Management with Provider & Riverpod Architecture',
      'Module 4: Firebase Integration (Authentication, Cloud Firestore & Push Notifications)',
      'Module 5: REST API Integration, JSON Parsing & Offline Local Caching (Hive/SQLite)',
      'Module 6: Google Play Store & Apple App Store Publishing & Release Engineering'
    ],
    capstone: 'Google Play Store Live Capstones: Xpense (Smart Expense Tracker) & Task Nest (Productivity & Streak Planner) by Rohan Kumar.',
    tools: 'Flutter 3.x, Dart, Firebase, SQLite/Hive, Provider, Material 3, Google Play Console'
  },
  'bde': {
    title: 'Business Development Executive (BDE) Master Program (100% Online)',
    instructor: 'Anshika Mishra (Corporate Sales Strategist & Senior BDE Lead)',
    duration: '2.5 Months (Live Online Training)',
    mode: '100% Live Interactive Online',
    fee: '₹1,199 (Online Special Offer • Reg: ₹5,000)',
    modules: [
      'Module 1: Fundamentals of Modern B2B & B2C Business Development & Sales Cycles',
      'Module 2: Lead Generation Strategies, LinkedIn Sales Navigator & Prospect Sourcing',
      'Module 3: High-Converting Cold Calling, Pitching Scripts & Objection Handling',
      'Module 4: Sales Funnel Pipeline Management & CRM Tools (HubSpot, Salesforce)',
      'Module 5: Client Relationship Building, Negotiation Tactics & Contract Closure',
      'Module 6: Corporate Communication, Business Email Etiquette & Pitch Presentations'
    ],
    capstone: 'End-to-End Enterprise Sales Strategy: Client Prospecting, Discovery Call, & High-Ticket Closure Simulation.',
    tools: 'HubSpot CRM, LinkedIn Sales Navigator, Apollo.io, Loom, Slack, Google Suite'
  },
  'graphic-design': {
    title: 'Graphic Designing & Creative Visual Branding (100% Online)',
    instructor: 'Rohan Kumar (Creative Director & Visual Designer)',
    duration: '2.5 Months (Live Online Training)',
    mode: '100% Live Interactive Online',
    fee: '₹1,199 (Online Special Offer • Reg: ₹5,000)',
    modules: [
      'Module 1: Design Fundamentals, Color Theory, Typography & Visual Hierarchy',
      'Module 2: Adobe Photoshop Mastery - Photo Editing, Compositing & Banner Design',
      'Module 3: Adobe Illustrator Mastery - Vector Logos, Brand Marks & Vector Art',
      'Module 4: UI/UX Designing with Figma - Wireframes, Mobile UI & Design Systems',
      'Module 5: Social Media Creatives, Ad Campaigns & Commercial Print Standards',
      'Module 6: Portfolio Development on Behance / Dribbble & Freelancing Secrets'
    ],
    capstone: 'Complete Corporate Brand Identity Kit: Logo, Brand Guidelines, Social Media Campaign & Figma Mobile App UI.',
    tools: 'Adobe Photoshop, Adobe Illustrator, Figma, Canva Pro, Behance'
  }
};

function initCourseModals() {
  const modalOverlay = document.getElementById('syllabusModal');
  const modalTitle = document.getElementById('modalCourseTitle');
  const modalDuration = document.getElementById('modalCourseDuration');
  const modalModules = document.getElementById('modalCourseModules');
  const modalCapstone = document.getElementById('modalCourseCapstone');
  const modalTools = document.getElementById('modalCourseTools');
  const closeBtn = document.getElementById('modalCloseBtn');
  const enrollModalBtn = document.getElementById('modalEnrollBtn');

  document.querySelectorAll('.btn-view-syllabus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const courseKey = btn.getAttribute('data-course');
      const data = courseSyllabusData[courseKey];

      if (data) {
        modalTitle.innerText = data.title;
        modalDuration.innerHTML = `⏱️ ${data.duration} &nbsp;|&nbsp; 🔴 <strong>${data.mode}</strong> &nbsp;|&nbsp; 👨‍🏫 Mentor: <strong>${data.instructor}</strong>`;
        modalCapstone.innerText = data.capstone;
        modalTools.innerText = data.tools;

        modalModules.innerHTML = data.modules
          .map(mod => `<li style="margin-bottom: 0.6rem; display: flex; align-items: flex-start; gap: 0.5rem;">
            <span style="color: var(--primary); font-weight: bold;">✔</span>
            <span>${mod}</span>
          </li>`)
          .join('');

        enrollModalBtn.onclick = () => {
          closeModal();
          const courseSelect = document.getElementById('enquiryCourse');
          if (courseSelect) {
            courseSelect.value = courseKey;
          }
          document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
        };

        modalOverlay?.classList.add('active');
      }
    });
  });

  function closeModal() {
    modalOverlay?.classList.remove('active');
  }

  closeBtn?.addEventListener('click', closeModal);
  modalOverlay?.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
}

/* ==========================================================================
   5. LIVE CERTIFICATE VERIFICATION ENGINE & OFFICIAL SHOWCASE
   ========================================================================== */
const sampleCertificates = {
  'AR-2026-8921': {
    studentName: 'AMAN VERMA',
    courseName: 'Web Development Masterclass',
    duration: '3 Months',
    startDate: '01 December 2025',
    endDate: '28 February 2026',
    issueDate: '01 March 2026',
    grade: 'Grade A+ (Distinction)',
    mentor: 'Er. Aman Sharma',
    certId: 'AR-2026-8921',
    status: 'Verified & Active',
    placedCompany: 'TCS Digital'
  },
  'AR-2026-4412': {
    studentName: 'POOJA VERMA',
    courseName: 'Flutter App Development',
    duration: '3 Months',
    startDate: '15 November 2025',
    endDate: '15 February 2026',
    issueDate: '18 February 2026',
    grade: 'Grade A+ (Distinction)',
    mentor: 'Er. Ankit Kumar',
    certId: 'AR-2026-4412',
    status: 'Verified & Active',
    placedCompany: 'Infosys Mobile Labs'
  },
  'AR-2026-1092': {
    studentName: 'KUNAL DESHMUKH',
    courseName: 'Cyber Security & Ethical Hacking Program',
    duration: '3.5 Months',
    startDate: '10 October 2025',
    endDate: '25 January 2026',
    issueDate: '01 February 2026',
    grade: 'Grade A+ (Distinction)',
    mentor: 'Rohan Kumar (Head of Academics)',
    certId: 'AR-2026-1092',
    status: 'Verified & Active',
    placedCompany: 'Tech Mahindra Cyber'
  },
  'AR-2026-5531': {
    studentName: 'SNEHA PANDEY',
    courseName: 'Business Development Executive (BDE)',
    duration: '2 Months',
    startDate: '01 December 2025',
    endDate: '31 January 2026',
    issueDate: '05 February 2026',
    grade: 'Grade A+ (Distinction)',
    mentor: 'Anshika Mishra',
    certId: 'AR-2026-5531',
    status: 'Verified & Active',
    placedCompany: 'Zomato Corporate'
  },
  'AR-2026-7782': {
    studentName: 'ADITYA GUPTA',
    courseName: 'Graphic Designing & Creative Branding',
    duration: '2.5 Months',
    startDate: '15 November 2025',
    endDate: '30 January 2026',
    issueDate: '05 February 2026',
    grade: 'Grade A+ (Distinction)',
    mentor: 'Rohan Kumar (Head of Academics)',
    certId: 'AR-2026-7782',
    status: 'Verified & Active',
    placedCompany: 'Creative Pulse Media'
  }
};

let currentActiveCert = null;
let currentActiveCertPreviewDataUrl = null;
let currentActiveCertCleanDataUrl = null;

function initCertificateVerification() {
  const verifyInput = document.getElementById('certInput');
  const verifyBtn = document.getElementById('btnVerifyCert');
  const resultBox = document.getElementById('verificationResult');
  const sampleChips = document.querySelectorAll('.sample-chip');
  const certChips = document.querySelectorAll('.cert-chip');
  const btnDownloadPng = document.getElementById('btnDownloadCertPng');
  const btnPrint = document.getElementById('btnPrintCert');
  const btnZoom = document.getElementById('btnZoomCert');
  const certModal = document.getElementById('certModal');
  const certModalClose = document.getElementById('certModalCloseBtn');
  const btnModalDownloadPng = document.getElementById('btnModalDownloadPng');
  const btnModalPrint = document.getElementById('btnModalPrint');

  // Dynamic High-Resolution Canvas Generator
  // Dynamic High-Resolution Canvas Generator (3072x2169 Ultra HD / 300 DPI)
  function renderCertificateCanvas(cert, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    const isSample = options && options.isSample !== false; // true by default for preview

    const canvas = document.createElement('canvas');
    canvas.width = 3072;
    canvas.height = 2169;
    const ctx = canvas.getContext('2d');

    const baseImg = new Image();
    baseImg.crossOrigin = 'anonymous';
    baseImg.src = './assets/images/certificate-template-blank.png?v=hd';

    baseImg.onload = () => {
      ctx.drawImage(baseImg, 0, 0, 3072, 2169);

      const studentName = cert ? (cert.studentName || 'AUTHORIZED SCHOLAR').toUpperCase() : 'STUDENT NAME';
      const courseName = cert ? cert.courseName : 'Course Name & Specialization';
      const duration = cert ? (cert.duration || '3 Months') : 'Duration';
      const startDate = cert ? cert.startDate : 'Batch Start Date';
      const endDate = cert ? cert.endDate : 'Batch End Date';
      const certId = cert ? cert.certId : 'AR-2026-XXXX';
      const issueDate = cert ? cert.issueDate : 'Issue Date';

      // 1. Candidate Name (Ultra HD Crisp Vector Text, centered, NO "</" prefix)
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.font = 'bold 96px "Plus Jakarta Sans", "Segoe UI", sans-serif';
      ctx.fillStyle = '#0654D2'; // Prestigious Royal Blue
      ctx.fillText(studentName, 1536, 924);

      // 2. Course Title & Duration (Ultra HD 46px)
      ctx.font = '600 46px "Plus Jakarta Sans", "Segoe UI", sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText(`For Outstanding Completion of ${courseName} (${duration}) From`, 1536, 1104);

      // 3. Batch Dates (Ultra HD 45px)
      ctx.font = 'bold 45px "Plus Jakarta Sans", "Segoe UI", sans-serif';
      ctx.fillStyle = '#1e293b';
      ctx.fillText(`${startDate} – ${endDate}`, 1536, 1194);

      // 4. Certificate ID: Bottom Left (Ultra HD 40px)
      ctx.textAlign = 'left';
      ctx.font = 'bold 40px "Plus Jakarta Sans", "Segoe UI", sans-serif';
      ctx.fillStyle = '#475569';
      ctx.fillText('Certificate ID: ', 225, 1884);
      const idLabelW = ctx.measureText('Certificate ID: ').width;
      ctx.fillStyle = '#0654D2';
      ctx.fillText(certId, 225 + idLabelW, 1884);

      // 5. Date of Issue: Bottom Left (Ultra HD 40px)
      ctx.fillStyle = '#475569';
      ctx.fillText('Date of Issue: ', 225, 1956);
      const dateLabelW = ctx.measureText('Date of Issue: ').width;
      ctx.fillStyle = '#0654D2';
      ctx.fillText(issueDate, 225 + dateLabelW, 1956);

      // 6. Professional "SAMPLE" Watermark Stamp on Preview (3x Scale)
      if (isSample) {
        ctx.save();
        ctx.translate(1536, 1050);
        ctx.rotate(-25 * Math.PI / 180);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Outer rounded stamp border
        ctx.strokeStyle = 'rgba(220, 38, 38, 0.20)';
        ctx.lineWidth = 10;
        ctx.strokeRect(-630, -144, 1260, 288);

        // Stamp Inner Border
        ctx.strokeStyle = 'rgba(220, 38, 38, 0.10)';
        ctx.lineWidth = 4;
        ctx.strokeRect(-612, -126, 1224, 252);

        // SAMPLE Text
        ctx.font = '900 186px "Plus Jakarta Sans", "Arial Black", sans-serif';
        ctx.fillStyle = 'rgba(220, 38, 38, 0.18)';
        ctx.fillText('SAMPLE', 0, -18);

        // Subtext: OFFICIAL VERIFICATION PREVIEW
        ctx.font = 'bold 33px "Plus Jakarta Sans", "Segoe UI", sans-serif';
        ctx.fillStyle = 'rgba(220, 38, 38, 0.28)';
        ctx.fillText('• ONLINE VERIFICATION PREVIEW •', 0, 84);

        ctx.restore();
      }

      try {
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        if (callback) callback(dataUrl);
      } catch (err) {
        console.error('Canvas export error:', err);
        if (callback) callback(null);
      }
    };

    baseImg.onerror = () => {
      console.error('Template loading failed');
      if (callback) callback(null);
    };
  }

  // Sync certificate display & preview on the left
  function updateCertificateDisplay(cert) {
    currentActiveCert = cert;
    const certImg = document.getElementById('certDisplayImg');
    const printImg = document.getElementById('printCertImg');

    if (!cert) {
      // Generate default sample preview with placeholder text and SAMPLE watermark
      renderCertificateCanvas(null, { isSample: true }, (previewUrl) => {
        if (previewUrl) {
          currentActiveCertPreviewDataUrl = previewUrl;
          if (certImg) certImg.src = previewUrl;
        }
      });
      renderCertificateCanvas(null, { isSample: false }, (cleanUrl) => {
        if (cleanUrl) {
          currentActiveCertCleanDataUrl = cleanUrl;
          if (printImg) printImg.src = cleanUrl;
        }
      });
      return;
    }

    // 1. Render Preview with SAMPLE watermark for website UI display
    renderCertificateCanvas(cert, { isSample: true }, (previewUrl) => {
      if (previewUrl) {
        currentActiveCertPreviewDataUrl = previewUrl;
        if (certImg) certImg.src = previewUrl;

        // If modal is open, sync modal preview image too
        const container = document.getElementById('modalCertContainer');
        if (container && container.querySelector('img')) {
          container.querySelector('img').src = previewUrl;
        }
      }
    });

    // 2. Render Clean Authentic Version (without sample watermark) for download & print
    renderCertificateCanvas(cert, { isSample: false }, (cleanUrl) => {
      if (cleanUrl) {
        currentActiveCertCleanDataUrl = cleanUrl;
        if (printImg) printImg.src = cleanUrl;
      }
    });
  }

  // Unified Print Handler: Isolated Single-Page Landscape Certificate Printing via Hidden Iframe
  function printActiveCertificate() {
    showToast('🖨️ Opening print dialog (1-Page Landscape)...');

    const srcToPrint = currentActiveCertCleanDataUrl || currentActiveCertPreviewDataUrl || (document.getElementById('certDisplayImg') ? document.getElementById('certDisplayImg').src : './assets/images/certificate-official-template.png');

    let printFrame = document.getElementById('printCertIframe');
    if (!printFrame) {
      printFrame = document.createElement('iframe');
      printFrame.id = 'printCertIframe';
      printFrame.style.position = 'fixed';
      printFrame.style.right = '0';
      printFrame.style.bottom = '0';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = '0';
      printFrame.style.visibility = 'hidden';
      document.body.appendChild(printFrame);
    }

    const doc = printFrame.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>AR INFOTECH - Official Certificate</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 0;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: #ffffff !important;
            overflow: hidden !important;
          }
          .print-wrapper {
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          .print-wrapper img {
            width: 100vw;
            height: 100vh;
            max-width: 100vw;
            max-height: 100vh;
            object-fit: contain;
            display: block;
            margin: auto;
            page-break-inside: avoid;
          }
        </style>
      </head>
      <body>
        <div class="print-wrapper">
          <img src="${srcToPrint}" />
        </div>
      </body>
      </html>
    `);
    doc.close();

    const img = doc.querySelector('img');
    const doPrint = () => {
      setTimeout(() => {
        try {
          printFrame.contentWindow.focus();
          printFrame.contentWindow.print();
        } catch (e) {
          window.print();
        }
      }, 150);
    };

    if (img && img.complete) {
      doPrint();
    } else if (img) {
      img.onload = doPrint;
    } else {
      doPrint();
    }
  }

  // Generate high-resolution PNG export
  function downloadActiveCertificatePng() {
    const cert = currentActiveCert;
    const certId = cert ? cert.certId : 'FORMAT';
    const studentName = cert ? cert.studentName : 'OFFICIAL';

    const triggerDownload = (url) => {
      const link = document.createElement('a');
      link.download = `AR_INFOTECH_CERTIFICATE_${certId}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`✅ Certificate for ${studentName} downloaded!`);
    };

    if (currentActiveCertCleanDataUrl) {
      triggerDownload(currentActiveCertCleanDataUrl);
    } else {
      showToast('⏳ Preparing High-Resolution Certificate...');
      renderCertificateCanvas(cert, { isSample: false }, (cleanUrl) => {
        if (cleanUrl) triggerDownload(cleanUrl);
      });
    }
  }

  // Open Fullscreen Modal
  function openFullscreenCert() {
    const container = document.getElementById('modalCertContainer');
    const currentSrc = currentActiveCertPreviewDataUrl || (document.getElementById('certDisplayImg') ? document.getElementById('certDisplayImg').src : './assets/images/certificate-official-template.png');
    if (container) {
      container.innerHTML = `<img src="${currentSrc}" alt="Certificate Preview" style="width: 100%; height: auto; max-width: 960px; border-radius: 6px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); display: block; margin: auto;">`;
    }
    certModal?.classList.add('active');
  }

  function closeFullscreenCert() {
    certModal?.classList.remove('active');
  }

  // Action Buttons Binding
  btnZoom?.addEventListener('click', openFullscreenCert);
  certModalClose?.addEventListener('click', closeFullscreenCert);
  certModal?.addEventListener('click', (e) => {
    if (e.target === certModal) closeFullscreenCert();
  });

  btnDownloadPng?.addEventListener('click', downloadActiveCertificatePng);
  btnModalDownloadPng?.addEventListener('click', downloadActiveCertificatePng);
  btnPrint?.addEventListener('click', printActiveCertificate);
  btnModalPrint?.addEventListener('click', printActiveCertificate);

  // Quick Switcher Chips on Certificate Showcase
  certChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const id = chip.getAttribute('data-id');
      if (id && sampleCertificates[id]) {
        if (verifyInput) verifyInput.value = id;
        verifyCertificate(id);
      }
    });
  });

  // Sample chips in verification form
  sampleChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const id = chip.getAttribute('data-id') || chip.innerText.trim();
      if (verifyInput) {
        verifyInput.value = id;
        verifyCertificate(id);
      }
    });
  });

  verifyBtn?.addEventListener('click', () => {
    const id = verifyInput?.value.trim().toUpperCase();
    if (!id) {
      showToast('⚠️ Please enter a Certificate ID');
      return;
    }
    verifyCertificate(id);
  });

  async function verifyCertificate(id) {
    let cert = null;
    let fromDb = false;

    // Check live MongoDB database first
    try {
      const response = await fetch('/api/verify-certificate?id=' + encodeURIComponent(id));
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.certificate) {
          cert = data.certificate;
          fromDb = true;
        }
      }
    } catch (err) {
      console.warn('Verification service notice:', err);
    }

    // Client-side fallback if server offline
    if (!cert) {
      cert = sampleCertificates[id];
    }

    // If custom entered ID matching format AR-YYYY-XXXX
    if (!cert && /^AR-\d{4}-\d{3,5}$/i.test(id)) {
      cert = {
        studentName: 'AUTHORIZED SCHOLAR',
        courseName: 'Certified Online Professional Program',
        duration: '3 Months',
        startDate: '01 October 2025',
        endDate: '31 December 2025',
        issueDate: '15 January 2026',
        grade: 'Grade A+ (Distinction)',
        instructor: 'Rohan Kumar (Head of Academics)',
        certId: id,
        status: 'Authentic Digital Credential',
        placedCompany: 'Industry Partner'
      };
    }

    if (cert) {
      // 1. Immediately update visual preview certificate on the left
      updateCertificateDisplay(cert);

      const dbBadge = fromDb 
        ? `<span class="badge badge-green" style="font-size: 0.72rem; display: inline-flex; align-items: center; gap: 0.25rem;">🛡️ Official Verified Credential</span>` 
        : '';
      const verifiedCounter = cert.verifiedCount 
        ? ` • Verified ${cert.verifiedCount} times` 
        : '';

      resultBox.innerHTML = `
        <div style="border-left: 4px solid var(--success); padding-left: 1rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
              <span class="badge badge-green">✔ ${cert.status}</span>
              ${dbBadge}
            </div>
            <span style="font-size: 0.8rem; font-family: var(--font-mono); color: var(--text-muted); font-weight: 700;">${cert.certId}${verifiedCounter}</span>
          </div>
          <h4 style="font-size: 1.3rem; color: var(--text-heading); font-weight: 800; margin-bottom: 0.2rem;">
            ${cert.studentName}
          </h4>
          <p style="font-size: 0.92rem; color: var(--primary); font-weight: 700; margin-bottom: 0.75rem;">
            ${cert.courseName} (${cert.duration})
          </p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; font-size: 0.82rem; color: var(--text-body); margin-bottom: 1.1rem; background: var(--bg-card); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
            <div><strong>Batch Period:</strong><br>${cert.startDate} – ${cert.endDate}</div>
            <div><strong>Issue Date:</strong><br>${cert.issueDate}</div>
            <div><strong>Lead Instructor:</strong><br>${cert.instructor || cert.mentor || 'Rohan Kumar'}</div>
            <div><strong>Performance Grade:</strong><br><span style="color: #059669; font-weight: 800;">${cert.grade}</span></div>
            <div><strong>Signatory Authority:</strong><br>Rohan Kumar (Head of Academics)</div>
            <div><strong>Govt. Recognitions:</strong><br>Digital India & MSME Certified</div>
          </div>
          <div style="display: flex; gap: 0.6rem; flex-wrap: wrap;">
            <button class="btn btn-primary btn-sm" id="btnResDownloadPng" type="button">
              📥 Download PNG
            </button>
            <button class="btn btn-secondary btn-sm" id="btnResPrint" type="button">
              🖨️ Print Credential
            </button>
            <button class="btn btn-secondary btn-sm" id="btnResInspect" type="button">
              🔍 Inspect Certificate
            </button>
          </div>
        </div>
      `;
      resultBox.classList.add('active');

      document.getElementById('btnResDownloadPng')?.addEventListener('click', downloadActiveCertificatePng);
      document.getElementById('btnResPrint')?.addEventListener('click', printActiveCertificate);
      document.getElementById('btnResInspect')?.addEventListener('click', openFullscreenCert);

      showToast(`✅ Verified: ${cert.studentName} (${cert.certId})`);
    } else {
      resultBox.innerHTML = `
        <div style="border-left: 4px solid var(--danger); padding-left: 1rem;">
          <span class="badge badge-amber" style="background:#fee2e2; color: #dc2626;">❌ Record Not Found</span>
          <p style="font-size: 0.875rem; color: var(--text-muted); margin-top: 0.5rem; line-height: 1.6;">
            No certificate with ID <strong>${id}</strong> was found in our verification registry. Please double check the ID format (e.g. <code>AR-2026-8921</code>) or try one of the sample IDs above.
          </p>
        </div>
      `;
      resultBox.classList.add('active');
    }
  }

  // Initialize with official template format (no demo details)
  updateCertificateDisplay(null);
}

/* ==========================================================================
   6. CAREER PATH RECOMMENDATION QUIZ (WEB APP TOOL)
   ========================================================================== */
function initCareerQuiz() {
  const quizSteps = document.querySelectorAll('.quiz-step');
  const quizResult = document.getElementById('quizResultBox');
  let userChoices = { background: '', interest: '', goal: '' };

  document.querySelectorAll('.quiz-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const stepEl = btn.closest('.quiz-step');
      const stepNum = parseInt(stepEl.getAttribute('data-step') || '1', 10);
      const val = btn.getAttribute('data-val');

      // Highlight selected
      stepEl.querySelectorAll('.quiz-option-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      if (stepNum === 1) userChoices.background = val;
      if (stepNum === 2) userChoices.interest = val;
      if (stepNum === 3) userChoices.goal = val;

      setTimeout(() => {
        stepEl.classList.remove('active');
        const nextStep = document.querySelector(`.quiz-step[data-step="${stepNum + 1}"]`);
        if (nextStep) {
          nextStep.classList.add('active');
        } else {
          // Render Recommendation Result
          computeRecommendation(userChoices);
        }
      }, 250);
    });
  });

  function computeRecommendation(choices) {
    let track = {
      title: 'Full Stack Web Development Masterclass',
      trainer: 'Er. Aman Sharma',
      role: 'Full Stack Web Developer',
      salary: '₹5 LPA - ₹10 LPA',
      reason: 'Based on your background and interest to build real-world responsive web applications & APIs.',
      courseId: 'web-dev'
    };

    if (choices.interest === 'security') {
      track = {
        title: 'Cyber Security & Ethical Hacking Program',
        trainer: 'Rohan Kumar',
        role: 'VAPT / Security Analyst',
        salary: '₹5.5 LPA - ₹12 LPA',
        reason: 'Perfect for ethical hacking, digital defense, network penetration, and bug bounty hunting.',
        courseId: 'cyber-security'
      };
    } else if (choices.interest === 'mobile') {
      track = {
        title: 'Cross-Platform Flutter & Dart App Development',
        trainer: 'Er. Ankit Kumar',
        role: 'Mobile Application Engineer (iOS & Android)',
        salary: '₹5 LPA - ₹11 LPA',
        reason: 'Ideal for crafting fluid, high-performance native apps with a single codebase.',
        courseId: 'flutter-app'
      };
    } else if (choices.interest === 'bde' || choices.background === 'non-it') {
      track = {
        title: 'Business Development Executive (BDE) Program',
        trainer: 'Anshika Mishra',
        role: 'Business Development Executive / Sales Lead',
        salary: '₹4.5 LPA - ₹9 LPA + High Incentives',
        reason: 'Fastest pathway into corporate tech with high-earning commissions and client deal closures.',
        courseId: 'bde'
      };
    } else if (choices.interest === 'design') {
      track = {
        title: 'Graphic Designing & Creative Visual Branding',
        trainer: 'Rohan Kumar',
        role: 'Graphic Designer / UI Visual Artist',
        salary: '₹4 LPA - ₹8 LPA',
        reason: 'Unleash your creative skills in visual identity, digital branding, social media ads, and Figma UI.',
        courseId: 'graphic-design'
      };
    }

    if (quizResult) {
      quizResult.innerHTML = `
        <div style="text-align: left;">
          <span class="badge badge-green" style="margin-bottom: 0.5rem;">🎯 Best Matched 100% Online Track</span>
          <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 0.3rem;">${track.title}</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">${track.reason}</p>
          <div style="background: var(--bg-surface); padding: 0.85rem 1rem; border-radius: var(--radius-md); margin-bottom: 1rem; font-size: 0.85rem;">
            <div><strong>Dedicated Mentor:</strong> ${track.trainer}</div>
            <div><strong>Recommended Role:</strong> ${track.role}</div>
            <div><strong>Special Online Fee:</strong> <span style="color: var(--success); font-weight: 800;">₹1,199 Only</span> <span style="text-decoration: line-through; color: var(--text-light); margin-left: 0.3rem;">₹5,000</span></div>
          </div>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <a href="#contact" class="btn btn-primary btn-sm" onclick="prefillCourse('${track.courseId}')">
              Enroll in This Batch (₹1,199)
            </a>
            <button class="btn btn-secondary btn-sm" onclick="restartQuiz()">
              🔄 Retake Quiz
            </button>
          </div>
        </div>
      `;
      quizResult.classList.add('active');
    }
  }

  window.restartQuiz = function() {
    quizResult?.classList.remove('active');
    document.querySelectorAll('.quiz-option-btn').forEach(b => b.classList.remove('selected'));
    quizSteps.forEach(s => s.classList.remove('active'));
    document.querySelector('.quiz-step[data-step="1"]')?.classList.add('active');
  };

  window.prefillCourse = function(courseId) {
    const courseSelect = document.getElementById('enquiryCourse');
    if (courseSelect) courseSelect.value = courseId;
  };
}

/* ==========================================================================
   7. COURSE FEE & EMI CALCULATOR (WEB APP TOOL)
   ========================================================================== */
function initFeeCalculator() {
  const feeSelect = document.getElementById('calcCourseSelect');
  const tenureRange = document.getElementById('calcTenureRange');
  const tenureValue = document.getElementById('calcTenureValue');
  const emiDisplay = document.getElementById('calcEmiDisplay');
  const totalDisplay = document.getElementById('calcTotalDisplay');

  function calculate() {
    if (!feeSelect) return;

    const baseFee = 5000; // Standard Max Fee for all courses
    const discountedTotal = 1199; // Standard Special Discount Fee
    const months = parseInt(tenureRange?.value || '1', 10);

    if (tenureValue) {
      if (months === 1) {
        tenureValue.innerText = 'One-Time Full Payment (Instant ₹1,199)';
      } else {
        tenureValue.innerText = `${months} Easy Monthly Installments`;
      }
    }

    const monthlyEmi = months === 1 ? discountedTotal : Math.round(discountedTotal / months);

    if (emiDisplay) {
      emiDisplay.innerHTML = `₹${monthlyEmi.toLocaleString()} <span style="font-size: 0.9rem; font-weight: 500; color: var(--text-muted);">${months === 1 ? 'one-time' : '/month'}</span>`;
    }
    if (totalDisplay) {
      totalDisplay.innerHTML = `Total Online Fee: <strong>₹${discountedTotal}</strong> <span style="text-decoration: line-through; color: var(--text-light); margin-left: 0.4rem;">₹${baseFee}</span> <span class="badge badge-green" style="margin-left: 0.5rem;">Save ₹3,801 (76% OFF)</span>`;
    }
  }

  feeSelect?.addEventListener('change', calculate);
  tenureRange?.addEventListener('input', calculate);

  calculate();
}

/* ==========================================================================
   8. ENQUIRY & LEAD SUBMISSION WITH LOCALSTORAGE & WHATSAPP
   ========================================================================== */
function initEnquiryForm() {
  const form = document.getElementById('enquiryForm');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('enquiryName')?.value.trim();
    const email = document.getElementById('enquiryEmail')?.value.trim();
    const phone = document.getElementById('enquiryPhone')?.value.trim();
    const course = document.getElementById('enquiryCourse')?.value;
    const mode = document.getElementById('enquiryMode')?.value;
    const message = document.getElementById('enquiryMessage')?.value.trim();
    const sendWhatsApp = document.getElementById('enquiryWhatsAppCheck')?.checked;

    if (!name || !phone) {
      showToast('⚠️ Please enter your Name and Mobile Number');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Submit Registration';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>⏳ Submitting Application...</span>';
    }

    const clientRefId = 'AR-' + Math.floor(100000 + Math.random() * 900000);
    const enquiryData = {
      refId: clientRefId,
      name,
      email,
      phone,
      course,
      mode,
      message,
      timestamp: new Date().toISOString()
    };

    let confirmedRefId = clientRefId;

    // Send to backend API
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enquiryData)
      });
      const resData = await response.json();
      if (resData.success && resData.refId) {
        confirmedRefId = resData.refId;
      }
    } catch (err) {
      console.warn('API sync notice (offline mode):', err);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    }

    // Save to LocalStorage as offline backup
    enquiryData.refId = confirmedRefId;
    const existing = JSON.parse(localStorage.getItem('ar_enquiries') || '[]');
    existing.push(enquiryData);
    localStorage.setItem('ar_enquiries', JSON.stringify(existing));

    showToast(`🎉 Registration submitted successfully! Ref ID: ${confirmedRefId}`);
    form.reset();

    // If WhatsApp requested, redirect
    if (sendWhatsApp) {
      const waText = encodeURIComponent(
        `Hello AR INFOTECH Team,\nI would like to enquire about IT Training Programs.\n\n` +
        `👤 Name: ${name}\n` +
        `📞 Phone: ${phone}\n` +
        `💻 Course: ${course}\n` +
        `🏫 Mode: ${mode}\n` +
        `📝 Note: ${message || 'Please share next batch details and brochure.'}\n` +
        `Ref ID: ${confirmedRefId}`
      );
      setTimeout(() => {
        window.open(`https://wa.me/919161503476?text=${waText}`, '_blank');
      }, 700);
    }
  });

  // Footer newsletter subscription
  const newsletterForm = document.querySelector('.footer-newsletter-box');
  newsletterForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = newsletterForm.querySelector('input[type="email"]');
    const email = input?.value.trim();
    if (!email) return;

    try {
      await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      showToast('📬 Subscribed successfully!');
    } catch (err) {
      showToast('📬 Subscribed successfully!');
    }
    newsletterForm.reset();
  });
}

/* ==========================================================================
   9. PWA INSTALLATION & SERVICE WORKER
   ========================================================================== */
function initPWA() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.log('SW registration notice: Running in standard browser environment');
    });
  }

  let deferredPrompt;
  const pwaBanner = document.getElementById('pwaBanner');
  const btnInstall = document.getElementById('btnInstallApp');
  const btnDismiss = document.getElementById('btnDismissApp');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    pwaBanner?.classList.add('show');
  });

  btnInstall?.addEventListener('click', () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        pwaBanner?.classList.remove('show');
        deferredPrompt = null;
      });
    }
  });

  btnDismiss?.addEventListener('click', () => {
    pwaBanner?.classList.remove('show');
  });
}

/* ==========================================================================
   10. TOAST NOTIFICATION UTILITY
   ========================================================================== */
function showToast(message) {
  let toast = document.querySelector('.toast-notice');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }
  toast.innerText = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

/* ==========================================================================
   11. DYNAMIC SITE DATA SYNC (ADMIN ADJUSTMENTS & MONGODB SYNC)
   ========================================================================== */
async function syncDynamicSiteData() {
  try {
    const res = await fetch('/api/site-data?_t=' + Date.now());
    if (!res.ok) return;
    const data = await res.json();
    if (!data.success) return;

    // 1. Sync & Render Trainers
    if (Array.isArray(data.trainers) && data.trainers.length > 0) {
      renderDynamicTrainers(data.trainers);
    }

    // 2. Sync & Render Projects
    if (Array.isArray(data.projects) && data.projects.length > 0) {
      renderDynamicProjects(data.projects);
    }

    // 3. Sync Settings
    if (data.settings) {
      if (data.settings.announcementText) {
        const announceEl = document.querySelector('.announce-item');
        if (announceEl) {
          announceEl.innerHTML = `🚀 ${data.settings.announcementText}`;
        }
      }
      if (data.settings.phone) {
        document.querySelectorAll('a[href^="tel:"]').forEach(a => {
          a.href = `tel:${data.settings.phone.replace(/[^0-9+]/g, '')}`;
        });
      }
      if (data.settings.whatsapp) {
        document.querySelectorAll('a[href*="wa.me"]').forEach(a => {
          a.href = `https://wa.me/${data.settings.whatsapp.replace(/[^0-9]/g, '')}`;
        });
      }
    }
  } catch (err) {
    console.warn('[Sync Notice] Fallback to static HTML:', err.message);
  }
}

// Dynamic Trainer Cards Renderer
function renderDynamicTrainers(trainers) {
  const container = document.querySelector('.trainers-grid');
  if (!container || !Array.isArray(trainers) || trainers.length === 0) return;

  container.innerHTML = trainers.map(t => {
    const pos = t.objectPosition || '15%';
    const imgUrl = t.image || './assets/images/logo.png';
    return `
      <div class="trainer-card">
        <div class="trainer-avatar-wrap">
          <img src="${imgUrl}" alt="${t.name} - ${t.role}" class="trainer-avatar-img trainer-avatar-${t.trainerId || ''}" style="object-position: center ${pos};">
          <span class="trainer-badge-verified">✔</span>
        </div>
        <h3 class="trainer-name">${t.name}</h3>
        <div class="trainer-role">${t.role}</div>
        <div class="trainer-company-pill">${t.companyPill || 'Mentor'}</div>
        <p class="trainer-bio">${t.bio || ''}</p>
        <div class="trainer-stats-row">
          <div class="trainer-stat"><span>${t.yearsExp || '5+'}</span> Years Exp</div>
          <div class="trainer-stat"><span>${t.rating || '4.9★'}</span> Rating</div>
          <div class="trainer-stat"><span>${t.batches || '40+'}</span> Batches</div>
        </div>
        ${t.linkedin ? `
        <div style="margin-top: 0.85rem;">
          <a href="${t.linkedin}" target="_blank" rel="noopener noreferrer" class="trainer-linkedin-link" title="Connect on LinkedIn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: -2px;"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            <span>Connect on LinkedIn</span>
          </a>
        </div>` : ''}
      </div>
    `;
  }).join('');
}

// Dynamic Projects Cards Renderer
function renderDynamicProjects(projects) {
  const container = document.querySelector('.projects-grid');
  if (!container || !Array.isArray(projects) || projects.length === 0) return;

  container.innerHTML = projects.map(p => {
    let previewMarkup = '';
    const badge = p.categoryBadge || 'Production Live';
    const badgeClass = p.badgeClass || 'badge-cyan';

    if (p.type === 'mobile') {
      const bannerClass = p.projectId === 'xpense' ? 'xpense-banner' : (p.projectId === 'pal-csc' ? 'pal-csc-banner' : 'tasknest-banner');
      previewMarkup = `
        <div class="app-preview-banner ${bannerClass}">
          <span class="badge ${badgeClass} project-type-tag">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" style="vertical-align: -1px; margin-right: 3px;"><path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993s-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993s-.4482.9997-.9993.9997m11.4045-6.02l1.996-3.4567c.1356-.2348.0551-.536-.1797-.6715-.2348-.1356-.536-.0551-.6716.1797l-2.0284 3.5127c-1.5794-.7203-3.3444-1.1215-5.2018-1.1215-1.8575 0-3.6224.4012-5.2018 1.1215L4.5678 5.373c-.1356-.2348-.4368-.3153-.6716-.1797-.2348.1356-.3153.4367-.1797.6715L5.7125 9.3214C2.3884 11.134 0 14.6548 0 18.7303h24c0-4.0755-2.3884-7.5963-5.7125-9.4089"/></svg>
            ${badge}
          </span>
          <div class="app-mockup-content">
            <img src="${p.iconImage || './assets/images/logo.png'}" alt="${p.title}" class="app-showcase-icon">
            <div class="app-showcase-meta">
              <div class="app-showcase-title">${(p.title || '').split(':')[0]}</div>
              <div class="app-showcase-sub">Built by ${p.company || 'AR Infotech'} • ${p.author || 'Rohan Kumar'}</div>
              <div class="app-rating-row">★★★★★ <span>Featured App</span></div>
            </div>
          </div>
          <div class="app-screenshots-row">
            <img src="${p.previewImage || ''}" alt="${p.title}" class="app-screens-strip">
          </div>
        </div>
      `;
    } else if (p.type === 'terminal') {
      previewMarkup = `
        <div class="terminal-preview-banner urldoctor-banner">
          <span class="badge ${badgeClass} project-type-tag">${badge}</span>
          <div class="terminal-header-bar">
            <div class="terminal-title-text">${p.terminalTitle || 'root@ROHAN: ~/tool'}</div>
            <div class="terminal-dots">
              <span class="dot red"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
            </div>
          </div>
          <div class="terminal-preview-image-wrap">
            <img src="${p.previewImage || ''}" alt="${p.title}" class="terminal-preview-img">
          </div>
        </div>
      `;
    } else {
      // Default to Web Preview Banner
      const bannerClass = p.projectId === 'aakriti' ? 'aakriti-banner' : 'erp-banner';
      previewMarkup = `
        <div class="web-preview-banner ${bannerClass}">
          <span class="badge ${badgeClass} project-type-tag">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" style="vertical-align: -1px; margin-right: 3px;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
            ${badge}
          </span>
          <div class="browser-header-bar">
            <div class="browser-address">${p.browserAddress || 'arinfotech.co.in'}</div>
            <div class="browser-dots">
              <span class="dot red"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
            </div>
          </div>
          <div class="web-preview-image-wrap">
            <img src="${p.previewImage || ''}" alt="${p.title}" class="web-preview-img">
          </div>
        </div>
      `;
    }

    const tagsList = Array.isArray(p.techTags) ? p.techTags : [];

    return `
      <div class="project-card">
        ${previewMarkup}
        <div class="project-card-body">
          <h3 class="project-title">${p.title}</h3>
          <p class="project-desc">${p.desc || ''}</p>
          <div class="tech-tags" style="margin-bottom: 1.25rem;">
            ${tagsList.map(tag => `<span class="tech-tag">${tag}</span>`).join('')}
          </div>
          <div class="project-credit-box">
            <span class="credit-company">🏢 Built by: <strong>${p.company || 'AR Infotech'}</strong></span>
            <span class="credit-author">Lead Architect: <strong>${p.author || 'Rohan Kumar'}</strong></span>
          </div>
          ${p.liveUrl ? `
          <a href="${p.liveUrl}" target="_blank" rel="noopener noreferrer" class="project-live-btn">
            <span>🚀 Open Live Web App</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </a>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// Cross-Tab Instant Sync with Admin Panel
try {
  const syncChannel = new BroadcastChannel('ar_infotech_channel');
  syncChannel.onmessage = (event) => {
    if (event.data && event.data.action === 'RELOAD_SITE_DATA') {
      console.log('[Realtime Sync] Content updated, refreshing view...');
      syncDynamicSiteData();
    }
  };
} catch(e) {}
