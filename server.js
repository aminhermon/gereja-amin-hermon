const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== SECURITY ====================

// Helmet: HTTP security headers (XSS, clickjacking, MIME-sniffing, etc.)
app.use(helmet({
  contentSecurityPolicy: false,       // Disabled to allow inline styles/scripts in EJS
  crossOriginEmbedderPolicy: false,   // Allow YouTube embeds
}));

// Rate Limiting: Public routes (100 req per 15 min per IP)
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Terlalu banyak permintaan dari IP ini. Silakan coba lagi nanti.'
});
app.use(publicLimiter);

// Rate Limiting: Admin routes (20 req per 15 min — anti brute-force)
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Terlalu banyak percobaan. Silakan coba lagi dalam 15 menit.'
});

// Trust reverse proxy (Hostinger Passenger/Apache)
app.set('trust proxy', 1);

// Session for admin authentication
app.use(session({
  secret: process.env.SESSION_SECRET || 'aminhermon-secret-key-2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 2 * 60 * 60 * 1000  // 2 hours
  }
}));

// Admin password hash (default: aminhermon2026)
const ADMIN_PASSWORD_HASH = process.env.ADMIN_HASH || crypto.createHash('sha256').update('aminhermon2026').digest('hex');

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  res.redirect('/admin/login');
}

// Input sanitization helper — strips dangerous HTML tags
function sanitize(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript\s*:/gi, '');
}

// Sanitize all incoming body fields recursively
function sanitizeBody(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'string') {
      obj[key] = sanitize(obj[key]);
    } else if (Array.isArray(obj[key])) {
      obj[key] = obj[key].map(v => typeof v === 'string' ? sanitize(v) : v);
    }
  }
  return obj;
}

// Apply sanitization to all POST requests
app.use((req, res, next) => {
  if (req.method === 'POST' && req.body) {
    req.body = sanitizeBody(req.body);
  }
  next();
});

// ==================== PERFORMANCE ====================

// Gzip / Brotli compression
app.use(compression({ level: 6, threshold: 1024 }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parser with size limits (anti payload attack)
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.json({ limit: '1mb' }));

// ==================== IMAGE OPTIMIZATION ====================
app.use(async (req, res, next) => {
  const isImageRequest = /\.(jpg|jpeg|png)$/i.test(req.path);
  if (!isImageRequest) return next();

  const accept = req.headers.accept || '';
  let format = null;
  let mime = null;
  let ext = null;

  if (accept.includes('image/avif')) {
    format = 'avif'; mime = 'image/avif'; ext = 'avif';
  } else if (accept.includes('image/webp')) {
    format = 'webp'; mime = 'image/webp'; ext = 'webp';
  }

  // If browser doesn't support webp/avif, fallback to original file
  if (!format) return next();

  try {
    const sharp = require('sharp');
    let srcPath = null;
    
    if (req.path.startsWith('/uploads/')) {
      srcPath = path.join(__dirname, req.path);
    } else {
      srcPath = path.join(__dirname, 'public', req.path);
    }

    // Path traversal protection
    const resolvedPath = path.resolve(srcPath);
    if (!resolvedPath.startsWith(path.resolve(__dirname))) {
      return res.status(403).send('Akses ditolak');
    }

    if (!fs.existsSync(srcPath)) return next();

    const cacheDir = path.join(__dirname, '.cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    // Build a unique cache name based on original path
    const safePath = req.path.replace(/\//g, '_');
    const cached = path.join(cacheDir, `${safePath}.${ext}`);

    if (fs.existsSync(cached)) {
      res.setHeader('Content-Type', mime);
      res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
      return fs.readFile(cached, (err, data) => {
        if (err) return next();
        res.send(data);
      });
    }

    const buffer = await sharp(srcPath)[format]({ quality: 80 }).toBuffer();
    fs.writeFileSync(cached, buffer);
    res.setHeader('Content-Type', mime);
    res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
    res.send(buffer);
  } catch (err) {
    console.error('Image optimization error:', err.message);
    next();
  }
});

// Static files with browser caching
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '7d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.css') || filePath.endsWith('.js')) {
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    } else if (/\.(jpg|jpeg|png|gif|svg|ico|webp|avif)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
    }
  }
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '30d',
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
  }
}));

// Ensure uploads dir exists
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });
}

// Multer storage with file validation
const ALLOWED_FILE_TYPES = /\.(jpg|jpeg|png|gif|webp|pdf)$/i;
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    // Sanitize original filename to prevent path injection
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, Date.now() + '_' + safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Max 10 MB
  fileFilter: (req, file, cb) => {
    const extValid = ALLOWED_FILE_TYPES.test(path.extname(file.originalname));
    const mimeValid = ALLOWED_MIME_TYPES.includes(file.mimetype);
    if (extValid && mimeValid) {
      cb(null, true);
    } else {
      cb(new Error('Tipe file tidak diizinkan. Hanya JPG, PNG, GIF, WebP, dan PDF yang diterima.'));
    }
  }
});

// DB helpers
const dbPath = path.join(__dirname, 'data', 'db.json');
function getDB() { return JSON.parse(fs.readFileSync(dbPath, 'utf8')); }
function saveDB(data) { fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8'); }

// ==================== PUBLIC ROUTES ====================

app.get('/', (req, res) => { res.render('index', getDB()); });
app.get('/index.html', (req, res) => { res.redirect('/'); });

// Dynamic pages
const pages = ['visit', 'about', 'pelayanan', 'media', 'contact', 'kalender'];
pages.forEach(page => {
  app.get(`/${page}.html`, (req, res) => { res.render(page, getDB()); });
});

// KomSek detail page (komisi/sektor)
app.get('/komsek/:slug', (req, res) => {
  const db = getDB();
  const slug = req.params.slug;
  const allKomsek = [...db.komsek.komisi, ...db.komsek.sektor];
  const unit = allKomsek.find(k => k.slug === slug);
  if (!unit) return res.status(404).send('Tidak ditemukan');
  res.render('komsek-detail', { ...db, unit });
});

// Search Route
app.get('/search', (req, res) => {
  const db = getDB();
  const q = (req.query.q || '').toLowerCase().trim();
  const results = [];

  if (q) {
    // 1. Search Static Pages
    const pages = [
      { title: 'Beranda', url: '/', desc: 'Halaman utama Gereja Amin Hermon' },
      { title: 'Baru di Sini?', url: '/visit.html', desc: 'Informasi untuk pengunjung baru, lokasi, dan jam ibadah' },
      { title: 'Tentang Gereja', url: '/about.html', desc: 'Sejarah, visi, misi, dan struktur kepemimpinan gereja' },
      { title: 'Pelayanan', url: '/pelayanan.html', desc: 'Daftar wadah pelayanan, komisi kategorial, dan sektor' },
      { title: 'Media & Galeri', url: '/media.html', desc: 'Kumpulan foto, galeri kegiatan, dan renungan' },
      { title: 'Kalender Kegiatan', url: '/kalender.html', desc: 'Jadwal kegiatan gereja sepekan' },
      { title: 'Hubungi Kami', url: '/contact.html', desc: 'Informasi kontak dan pertanyaan umum (FAQ)' }
    ];
    
    pages.forEach(p => {
      if (p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)) {
        results.push({ type: 'Halaman', title: p.title, desc: p.desc, url: p.url });
      }
    });

    // 2. Search News (Berita)
    if (db.home && db.home.news) {
      db.home.news.forEach(n => {
        const title = n.title || '';
        const excerpt = n.excerpt || '';
        if (title.toLowerCase().includes(q) || excerpt.toLowerCase().includes(q)) {
          results.push({ type: 'Berita', title: title, desc: excerpt, url: '/' }); 
        }
      });
    }

    // 3. Search KomSek
    if (db.komsek) {
      const allKomsek = [...(db.komsek.komisi || []), ...(db.komsek.sektor || [])];
      allKomsek.forEach(k => {
        const nama = k.nama || '';
        const deskripsi = k.deskripsi || '';
        if (nama.toLowerCase().includes(q) || deskripsi.toLowerCase().includes(q)) {
          results.push({ type: 'Komisi/Sektor', title: nama, desc: deskripsi, url: `/komsek/${k.slug}` });
        }
      });
    }
  }

  res.render('search', { ...db, query: req.query.q || '', results });
});

// ==================== SEO ROUTES ====================

// Sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  const db = getDB();
  const siteUrl = db.general.siteUrl || 'https://aminhermon.org';
  const today = new Date().toISOString().split('T')[0];

  const staticPages = [
    { loc: '/',              priority: '1.0', changefreq: 'weekly' },
    { loc: '/visit.html',    priority: '0.8', changefreq: 'monthly' },
    { loc: '/about.html',    priority: '0.8', changefreq: 'monthly' },
    { loc: '/pelayanan.html', priority: '0.9', changefreq: 'weekly' },
    { loc: '/media.html',    priority: '0.7', changefreq: 'weekly' },
    { loc: '/contact.html',  priority: '0.6', changefreq: 'monthly' },
  ];

  // Dynamic komsek pages
  const komsekPages = [];
  if (db.komsek) {
    const allKomsek = [...(db.komsek.komisi || []), ...(db.komsek.sektor || [])];
    allKomsek.forEach(k => {
      if (k.slug) {
        komsekPages.push({ loc: `/komsek/${k.slug}`, priority: '0.6', changefreq: 'monthly' });
      }
    });
  }

  const allPages = [...staticPages, ...komsekPages];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  allPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${siteUrl}${page.loc}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });
  xml += '</urlset>';

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// Robots.txt
app.get('/robots.txt', (req, res) => {
  const db = getDB();
  const siteUrl = db.general.siteUrl || 'https://aminhermon.org';
  const txt = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /uploads/\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
  res.header('Content-Type', 'text/plain');
  res.send(txt);
});

// ==================== ADMIN ROUTES ====================

// Admin login page
app.get('/admin/login', (req, res) => {
  if (req.session && req.session.isAdmin) return res.redirect('/admin');
  res.render('admin-login', { error: null });
});

// Admin login handler
app.post('/admin/login', adminLimiter, (req, res) => {
  const inputHash = crypto.createHash('sha256').update(req.body.password || '').digest('hex');
  if (inputHash === ADMIN_PASSWORD_HASH) {
    req.session.isAdmin = true;
    return res.redirect('/admin');
  }
  res.render('admin-login', { error: 'Password salah. Silakan coba lagi.' });
});

// Admin logout
app.get('/admin/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

// Helper: Safely delete physical file in uploads/ directory
function deleteUploadedFile(filePath) {
  if (!filePath || typeof filePath !== 'string') return;
  // Ensure path is inside uploads/ and prevent directory traversal
  if (filePath.startsWith('uploads/')) {
    const filename = path.basename(filePath);
    const fullPath = path.join(__dirname, 'uploads', filename);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (err) {
        console.error('Gagal menghapus file:', fullPath, err.message);
      }
    }
  }
}

// Helper: Get list of all uploaded files in uploads/ directory
function getUploadedFiles() {
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) return [];
  try {
    const files = fs.readdirSync(uploadsDir);
    return files.map(file => {
      const fullPath = path.join(uploadsDir, file);
      const stat = fs.statSync(fullPath);
      const isImg = /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(file);
      const isPdf = /\.pdf$/i.test(file);
      return {
        name: file,
        path: 'uploads/' + file,
        size: stat.size,
        sizeFormatted: stat.size >= 1024 * 1024 
          ? (stat.size / (1024 * 1024)).toFixed(2) + ' MB'
          : (stat.size / 1024).toFixed(1) + ' KB',
        isImage: isImg,
        isPdf: isPdf,
        createdAt: stat.birthtime || stat.mtime
      };
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (err) {
    console.error('Error reading uploads folder:', err.message);
    return [];
  }
}

// ---------- Admin Dashboard (tabbed) ----------
app.get('/admin', requireAuth, (req, res) => {
  res.render('admin', { 
    db: getDB(), 
    tab: req.query.tab || 'beranda',
    files: getUploadedFiles()
  });
});

// ===== TAB: BERANDA =====

// General settings (name & logo)
app.post('/admin/general', requireAuth, upload.single('logo'), (req, res) => {
  const db = getDB();
  db.general.churchName = req.body.churchName;
  if (req.file) {
    if (db.general.logoPath && db.general.logoPath.startsWith('uploads/')) {
      deleteUploadedFile(db.general.logoPath);
    }
    db.general.logoPath = 'uploads/' + req.file.filename;
  }
  saveDB(db);
  res.redirect('/admin?tab=beranda');
});

// Delete / reset logo to default
app.post('/admin/delete-file/logo', requireAuth, (req, res) => {
  const db = getDB();
  if (db.general.logoPath && db.general.logoPath.startsWith('uploads/')) {
    deleteUploadedFile(db.general.logoPath);
  }
  db.general.logoPath = 'assets/images/logo-gereja-amin-3d.png';
  saveDB(db);
  res.redirect('/admin?tab=beranda');
});

// Home hero
app.post('/admin/home/hero', requireAuth, upload.single('bgImage'), (req, res) => {
  const db = getDB();
  db.home.hero.titleHTML = req.body.titleHTML;
  db.home.hero.subtitle = req.body.subtitle;
  db.home.hero.ctaText = req.body.ctaText || db.home.hero.ctaText;
  db.home.hero.ctaLink = req.body.ctaLink || db.home.hero.ctaLink;
  if (req.file) {
    if (db.home.hero.bgImage && db.home.hero.bgImage.startsWith('uploads/')) {
      deleteUploadedFile(db.home.hero.bgImage);
    }
    db.home.hero.bgImage = 'uploads/' + req.file.filename;
  }
  saveDB(db);
  res.redirect('/admin?tab=beranda');
});

// Delete / reset home hero image to default
app.post('/admin/delete-file/hero/home', requireAuth, (req, res) => {
  const db = getDB();
  if (db.home.hero.bgImage && db.home.hero.bgImage.startsWith('uploads/')) {
    deleteUploadedFile(db.home.hero.bgImage);
  }
  db.home.hero.bgImage = 'assets/images/church-hero-new.jpg';
  saveDB(db);
  res.redirect('/admin?tab=beranda');
});

// Home stats
app.post('/admin/home/stats', requireAuth, (req, res) => {
  const db = getDB();
  db.home.stats.totalJemaat = parseInt(req.body.totalJemaat) || 0;
  db.home.stats.lakiLaki = parseInt(req.body.lakiLaki) || 0;
  db.home.stats.perempuan = parseInt(req.body.perempuan) || 0;
  db.home.stats.anakAnak = parseInt(req.body.anakAnak) || 0;
  saveDB(db);
  res.redirect('/admin?tab=beranda');
});

// News/events - update
app.post('/admin/home/news/:id', requireAuth, upload.single('image'), (req, res) => {
  const db = getDB();
  const idx = db.home.news.findIndex(n => n.id === req.params.id);
  if (idx > -1) {
    db.home.news[idx].date = req.body.date;
    db.home.news[idx].title = req.body.title;
    db.home.news[idx].desc = req.body.desc;
    if (req.file) {
      if (db.home.news[idx].image && db.home.news[idx].image.startsWith('uploads/')) {
        deleteUploadedFile(db.home.news[idx].image);
      }
      db.home.news[idx].image = 'uploads/' + req.file.filename;
    }
    saveDB(db);
  }
  res.redirect('/admin?tab=beranda');
});

// News/events - delete image only
app.post('/admin/home/news/delete-image/:id', requireAuth, (req, res) => {
  const db = getDB();
  const idx = db.home.news.findIndex(n => n.id === req.params.id);
  if (idx > -1) {
    if (db.home.news[idx].image && db.home.news[idx].image.startsWith('uploads/')) {
      deleteUploadedFile(db.home.news[idx].image);
    }
    db.home.news[idx].image = 'assets/images/slider_ibadah.png';
    saveDB(db);
  }
  res.redirect('/admin?tab=beranda');
});

// News/events - add new
app.post('/admin/home/news/add', requireAuth, upload.single('image'), (req, res) => {
  const db = getDB();
  const newItem = {
    id: String(Date.now()),
    date: req.body.date,
    title: req.body.title,
    desc: req.body.desc,
    image: req.file ? 'uploads/' + req.file.filename : 'assets/images/slider_ibadah.png',
    link: '/pelayanan.html'
  };
  db.home.news.push(newItem);
  saveDB(db);
  res.redirect('/admin?tab=beranda');
});

// News/events - delete item and associated file
app.post('/admin/home/news/delete/:id', requireAuth, (req, res) => {
  const db = getDB();
  const item = db.home.news.find(n => n.id === req.params.id);
  if (item && item.image && item.image.startsWith('uploads/')) {
    deleteUploadedFile(item.image);
  }
  db.home.news = db.home.news.filter(n => n.id !== req.params.id);
  saveDB(db);
  res.redirect('/admin?tab=beranda');
});

// ===== TAB: BARU DI SINI =====

// Visit hero
app.post('/admin/visit/hero', requireAuth, upload.single('bgImage'), (req, res) => {
  const db = getDB();
  db.visit.hero.titleHTML = req.body.titleHTML;
  db.visit.hero.subtitle = req.body.subtitle;
  if (req.file) {
    if (db.visit.hero.bgImage && db.visit.hero.bgImage.startsWith('uploads/')) {
      deleteUploadedFile(db.visit.hero.bgImage);
    }
    db.visit.hero.bgImage = 'uploads/' + req.file.filename;
  }
  saveDB(db);
  res.redirect('/admin?tab=visit');
});

// Delete / reset visit hero image to default
app.post('/admin/delete-file/hero/visit', requireAuth, (req, res) => {
  const db = getDB();
  if (db.visit.hero.bgImage && db.visit.hero.bgImage.startsWith('uploads/')) {
    deleteUploadedFile(db.visit.hero.bgImage);
  }
  db.visit.hero.bgImage = 'assets/images/welcome-visitors.png';
  saveDB(db);
  res.redirect('/admin?tab=visit');
});

// Visit sambutan
app.post('/admin/visit/sambutan', requireAuth, (req, res) => {
  const db = getDB();
  db.visit.sambutan = req.body.sambutan;
  saveDB(db);
  res.redirect('/admin?tab=visit');
});

// Visit jadwal ibadah
app.post('/admin/visit/jadwal', requireAuth, (req, res) => {
  const db = getDB();
  const names = Array.isArray(req.body.nama) ? req.body.nama : [req.body.nama];
  const haris = Array.isArray(req.body.hari) ? req.body.hari : [req.body.hari];
  const jams = Array.isArray(req.body.jam) ? req.body.jam : [req.body.jam];
  const keterangans = Array.isArray(req.body.keterangan) ? req.body.keterangan : [req.body.keterangan];
  db.visit.jadwalIbadah = names.map((n, i) => ({
    nama: n, hari: haris[i], jam: jams[i], keterangan: keterangans[i]
  }));
  saveDB(db);
  res.redirect('/admin?tab=visit');
});

// Visit lokasi
app.post('/admin/visit/lokasi', requireAuth, (req, res) => {
  const db = getDB();
  db.visit.lokasi.judul = req.body.judul;
  db.visit.lokasi.deskripsi = req.body.deskripsi;
  db.visit.lokasi.mapsQuery = req.body.mapsQuery;
  db.visit.lokasi.alamat = req.body.alamat;
  saveDB(db);
  res.redirect('/admin?tab=visit');
});

// Visit sakramen
app.post('/admin/visit/sakramen', requireAuth, (req, res) => {
  const db = getDB();
  const names = Array.isArray(req.body.nama) ? req.body.nama : [req.body.nama];
  const icons = Array.isArray(req.body.icon) ? req.body.icon : [req.body.icon];
  const descs = Array.isArray(req.body.desc) ? req.body.desc : [req.body.desc];
  db.visit.sakramen = names.map((n, i) => ({
    nama: n, icon: icons[i], desc: descs[i]
  }));
  saveDB(db);
  res.redirect('/admin?tab=visit');
});

// ===== TAB: TENTANG GEREJA =====

// About hero
app.post('/admin/about/hero', requireAuth, upload.single('bgImage'), (req, res) => {
  const db = getDB();
  db.about.hero.titleHTML = req.body.titleHTML;
  db.about.hero.subtitle = req.body.subtitle;
  if (req.file) {
    if (db.about.hero.bgImage && db.about.hero.bgImage.startsWith('uploads/')) {
      deleteUploadedFile(db.about.hero.bgImage);
    }
    db.about.hero.bgImage = 'uploads/' + req.file.filename;
  }
  saveDB(db);
  res.redirect('/admin?tab=about');
});

// Delete / reset about hero image to default
app.post('/admin/delete-file/hero/about', requireAuth, (req, res) => {
  const db = getDB();
  if (db.about.hero.bgImage && db.about.hero.bgImage.startsWith('uploads/')) {
    deleteUploadedFile(db.about.hero.bgImage);
  }
  db.about.hero.bgImage = 'assets/images/church-interior.png';
  saveDB(db);
  res.redirect('/admin?tab=about');
});

// About sejarah
app.post('/admin/about/sejarah', requireAuth, (req, res) => {
  const db = getDB();
  db.about.sejarah.title = req.body.title;
  db.about.sejarah.content = req.body.content;
  saveDB(db);
  res.redirect('/admin?tab=about');
});

// About visi & misi
app.post('/admin/about/visimisi', requireAuth, (req, res) => {
  const db = getDB();
  db.about.visiMisi.visi = req.body.visi;
  const misiItems = Array.isArray(req.body.misi) ? req.body.misi : [req.body.misi];
  db.about.visiMisi.misiList = misiItems.filter(m => m && m.trim());
  saveDB(db);
  res.redirect('/admin?tab=about');
});

// About pendeta - update
app.post('/admin/about/pendeta/:idx', requireAuth, upload.single('image'), (req, res) => {
  const db = getDB();
  const idx = parseInt(req.params.idx);
  if (db.about.pemimpin.pendeta[idx]) {
    db.about.pemimpin.pendeta[idx].name = req.body.name;
    db.about.pemimpin.pendeta[idx].role = req.body.role;
    db.about.pemimpin.pendeta[idx].bio = req.body.bio || '';
    if (req.file) {
      if (db.about.pemimpin.pendeta[idx].image && db.about.pemimpin.pendeta[idx].image.startsWith('uploads/')) {
        deleteUploadedFile(db.about.pemimpin.pendeta[idx].image);
      }
      db.about.pemimpin.pendeta[idx].image = 'uploads/' + req.file.filename;
    }
  }
  saveDB(db);
  res.redirect('/admin?tab=about');
});

// About pendeta - delete photo
app.post('/admin/delete-file/pendeta/:idx', requireAuth, (req, res) => {
  const db = getDB();
  const idx = parseInt(req.params.idx);
  if (db.about.pemimpin.pendeta[idx]) {
    if (db.about.pemimpin.pendeta[idx].image && db.about.pemimpin.pendeta[idx].image.startsWith('uploads/')) {
      deleteUploadedFile(db.about.pemimpin.pendeta[idx].image);
    }
    db.about.pemimpin.pendeta[idx].image = '';
    saveDB(db);
  }
  res.redirect('/admin?tab=about');
});

// About pengurus - individual update with photo
app.post('/admin/about/pengurus/:idx', requireAuth, upload.single('image'), (req, res) => {
  const db = getDB();
  const idx = parseInt(req.params.idx);
  if (db.about.pemimpin.pengurus[idx]) {
    db.about.pemimpin.pengurus[idx].name = req.body.name;
    db.about.pemimpin.pengurus[idx].role = req.body.role;
    if (req.file) {
      if (db.about.pemimpin.pengurus[idx].image && db.about.pemimpin.pengurus[idx].image.startsWith('uploads/')) {
        deleteUploadedFile(db.about.pemimpin.pengurus[idx].image);
      }
      db.about.pemimpin.pengurus[idx].image = 'uploads/' + req.file.filename;
    }
  }
  saveDB(db);
  res.redirect('/admin?tab=about');
});

// About pengurus - delete photo
app.post('/admin/delete-file/pengurus/:idx', requireAuth, (req, res) => {
  const db = getDB();
  const idx = parseInt(req.params.idx);
  if (db.about.pemimpin.pengurus[idx]) {
    if (db.about.pemimpin.pengurus[idx].image && db.about.pemimpin.pengurus[idx].image.startsWith('uploads/')) {
      deleteUploadedFile(db.about.pemimpin.pengurus[idx].image);
    }
    db.about.pemimpin.pengurus[idx].image = '';
    saveDB(db);
  }
  res.redirect('/admin?tab=about');
});

// About majelis - individual update with photo
app.post('/admin/about/majelis/:idx', requireAuth, upload.single('image'), (req, res) => {
  const db = getDB();
  const idx = parseInt(req.params.idx);
  if (db.about.pemimpin.majelis[idx]) {
    db.about.pemimpin.majelis[idx].name = req.body.name;
    db.about.pemimpin.majelis[idx].role = req.body.role || 'Majelis';
    if (req.file) {
      if (db.about.pemimpin.majelis[idx].image && db.about.pemimpin.majelis[idx].image.startsWith('uploads/')) {
        deleteUploadedFile(db.about.pemimpin.majelis[idx].image);
      }
      db.about.pemimpin.majelis[idx].image = 'uploads/' + req.file.filename;
    }
  }
  saveDB(db);
  res.redirect('/admin?tab=about');
});

// About majelis - delete photo
app.post('/admin/delete-file/majelis/:idx', requireAuth, (req, res) => {
  const db = getDB();
  const idx = parseInt(req.params.idx);
  if (db.about.pemimpin.majelis[idx]) {
    if (db.about.pemimpin.majelis[idx].image && db.about.pemimpin.majelis[idx].image.startsWith('uploads/')) {
      deleteUploadedFile(db.about.pemimpin.majelis[idx].image);
    }
    db.about.pemimpin.majelis[idx].image = '';
    saveDB(db);
  }
  res.redirect('/admin?tab=about');
});

// ===== TAB: PELAYANAN & WARTA =====

// Pelayanan hero
app.post('/admin/pelayanan/hero', requireAuth, upload.single('bgImage'), (req, res) => {
  const db = getDB();
  db.pelayanan.hero.titleHTML = req.body.titleHTML;
  db.pelayanan.hero.subtitle = req.body.subtitle;
  if (req.file) {
    if (db.pelayanan.hero.bgImage && db.pelayanan.hero.bgImage.startsWith('uploads/')) {
      deleteUploadedFile(db.pelayanan.hero.bgImage);
    }
    db.pelayanan.hero.bgImage = 'uploads/' + req.file.filename;
  }
  saveDB(db);
  res.redirect('/admin?tab=pelayanan');
});

// Delete / reset pelayanan hero image to default
app.post('/admin/delete-file/hero/pelayanan', requireAuth, (req, res) => {
  const db = getDB();
  if (db.pelayanan.hero.bgImage && db.pelayanan.hero.bgImage.startsWith('uploads/')) {
    deleteUploadedFile(db.pelayanan.hero.bgImage);
  }
  db.pelayanan.hero.bgImage = 'assets/images/church-interior.png';
  saveDB(db);
  res.redirect('/admin?tab=pelayanan');
});

// Pelayanan - jadwal pelayan
app.post('/admin/pelayanan/jadwal', requireAuth, (req, res) => {
  const db = getDB();
  db.pelayanan.jadwalPelayan.mingguIni = req.body.mingguIni;
  const fields = ['pengkhotbah','liturgos','doaKonsistori','pemusik','prokantor','penerimaJemaat','petugasKolekte','kp2'];
  fields.forEach(f => {
    db.pelayanan.jadwalPelayan.ibadah1[f] = req.body['ibadah1_' + f];
    db.pelayanan.jadwalPelayan.ibadah2[f] = req.body['ibadah2_' + f];
  });
  saveDB(db);
  res.redirect('/admin?tab=pelayanan');
});

// ===== TAB: MEDIA =====

// Media hero
app.post('/admin/media/hero', requireAuth, upload.single('bgImage'), (req, res) => {
  const db = getDB();
  db.mediaGaleri.hero.titleHTML = req.body.titleHTML;
  db.mediaGaleri.hero.subtitle = req.body.subtitle;
  if (req.file) {
    if (db.mediaGaleri.hero.bgImage && db.mediaGaleri.hero.bgImage.startsWith('uploads/')) {
      deleteUploadedFile(db.mediaGaleri.hero.bgImage);
    }
    db.mediaGaleri.hero.bgImage = 'uploads/' + req.file.filename;
  }
  saveDB(db);
  res.redirect('/admin?tab=media');
});

// Delete / reset media hero image to default
app.post('/admin/delete-file/hero/media', requireAuth, (req, res) => {
  const db = getDB();
  if (db.mediaGaleri.hero.bgImage && db.mediaGaleri.hero.bgImage.startsWith('uploads/')) {
    deleteUploadedFile(db.mediaGaleri.hero.bgImage);
  }
  db.mediaGaleri.hero.bgImage = 'assets/images/church-interior.png';
  saveDB(db);
  res.redirect('/admin?tab=media');
});

// Gallery photo upload
app.post('/admin/media/photo', requireAuth, upload.single('photo'), (req, res) => {
  const db = getDB();
  if (req.file) {
    const newPhoto = {
      id: String(Date.now()),
      src: 'uploads/' + req.file.filename,
      caption: req.body.caption || ''
    };
    db.mediaGaleri.photos.push(newPhoto);
    saveDB(db);
  }
  res.redirect('/admin?tab=media');
});

// Delete gallery photo and physical file
app.post('/admin/media/photo/delete/:id', requireAuth, (req, res) => {
  const db = getDB();
  const photo = db.mediaGaleri.photos.find(p => p.id === req.params.id);
  if (photo && photo.src && photo.src.startsWith('uploads/')) {
    deleteUploadedFile(photo.src);
  }
  db.mediaGaleri.photos = db.mediaGaleri.photos.filter(p => p.id !== req.params.id);
  saveDB(db);
  res.redirect('/admin?tab=media');
});

// Warta upload
app.post('/admin/media/warta', requireAuth, upload.single('file'), (req, res) => {
  const db = getDB();
  const newWarta = {
    id: String(Date.now()),
    judul: req.body.judul,
    tanggal: req.body.tanggal,
    file: req.file ? 'uploads/' + req.file.filename : ''
  };
  db.pelayanan.warta.unshift(newWarta);
  saveDB(db);
  res.redirect('/admin?tab=media');
});

// Warta delete and physical file
app.post('/admin/media/warta/delete/:id', requireAuth, (req, res) => {
  const db = getDB();
  const warta = db.pelayanan.warta.find(w => w.id === req.params.id);
  if (warta && warta.file && warta.file.startsWith('uploads/')) {
    deleteUploadedFile(warta.file);
  }
  db.pelayanan.warta = db.pelayanan.warta.filter(w => w.id !== req.params.id);
  saveDB(db);
  res.redirect('/admin?tab=media');
});

// Renungan add
app.post('/admin/media/renungan', requireAuth, (req, res) => {
  const db = getDB();
  if (!db.mediaGaleri.renungan) db.mediaGaleri.renungan = [];
  db.mediaGaleri.renungan.push({
    id: String(Date.now()),
    judul: req.body.judul,
    tanggal: req.body.tanggal,
    ayat: req.body.ayat,
    isi: req.body.isi
  });
  saveDB(db);
  res.redirect('/admin?tab=media');
});

// Renungan delete
app.post('/admin/media/renungan/delete/:id', requireAuth, (req, res) => {
  const db = getDB();
  if (db.mediaGaleri.renungan) {
    db.mediaGaleri.renungan = db.mediaGaleri.renungan.filter(r => r.id !== req.params.id);
  }
  saveDB(db);
  res.redirect('/admin?tab=media');
});

// Video add
app.post('/admin/media/video', requireAuth, (req, res) => {
  const db = getDB();
  if (!db.mediaGaleri.videos) db.mediaGaleri.videos = [];
  db.mediaGaleri.videos.push({
    id: String(Date.now()),
    judul: req.body.judul,
    tanggal: req.body.tanggal,
    pembicara: req.body.pembicara,
    embedUrl: req.body.embedUrl
  });
  saveDB(db);
  res.redirect('/admin?tab=media');
});

// Video delete
app.post('/admin/media/video/delete/:id', requireAuth, (req, res) => {
  const db = getDB();
  if (db.mediaGaleri.videos) {
    db.mediaGaleri.videos = db.mediaGaleri.videos.filter(v => v.id !== req.params.id);
  }
  saveDB(db);
  res.redirect('/admin?tab=media');
});

// ===== TAB: HUBUNGI KAMI =====

// Contact hero
app.post('/admin/contact/hero', requireAuth, upload.single('bgImage'), (req, res) => {
  const db = getDB();
  db.contactFaq.hero.titleHTML = req.body.titleHTML;
  db.contactFaq.hero.subtitle = req.body.subtitle;
  if (req.file) {
    if (db.contactFaq.hero.bgImage && db.contactFaq.hero.bgImage.startsWith('uploads/')) {
      deleteUploadedFile(db.contactFaq.hero.bgImage);
    }
    db.contactFaq.hero.bgImage = 'uploads/' + req.file.filename;
  }
  saveDB(db);
  res.redirect('/admin?tab=contact');
});

// Delete / reset contact hero image to default
app.post('/admin/delete-file/hero/contact', requireAuth, (req, res) => {
  const db = getDB();
  if (db.contactFaq.hero.bgImage && db.contactFaq.hero.bgImage.startsWith('uploads/')) {
    deleteUploadedFile(db.contactFaq.hero.bgImage);
  }
  db.contactFaq.hero.bgImage = 'assets/images/church-interior.png';
  saveDB(db);
  res.redirect('/admin?tab=contact');
});

// Contact WhatsApp
app.post('/admin/contact/whatsapp', requireAuth, (req, res) => {
  const db = getDB();
  db.contactFaq.whatsapp.number = req.body.number;
  db.contactFaq.whatsapp.message = req.body.message;
  db.contactFaq.whatsapp.label = req.body.label;
  saveDB(db);
  res.redirect('/admin?tab=contact');
});

// ===== TAB: KALENDER =====

// Kalender add
app.post('/admin/kalender/add', requireAuth, (req, res) => {
  const db = getDB();
  if (!db.kalender) db.kalender = [];
  db.kalender.push({
    id: String(Date.now()),
    judul: req.body.judul,
    tanggal: req.body.tanggal,
    kategori: req.body.kategori,
    desc: req.body.desc
  });
  saveDB(db);
  res.redirect('/admin?tab=kalender');
});

// Kalender delete
app.post('/admin/kalender/delete/:id', requireAuth, (req, res) => {
  const db = getDB();
  if (db.kalender) {
    db.kalender = db.kalender.filter(k => k.id !== req.params.id);
  }
  saveDB(db);
  res.redirect('/admin?tab=kalender');
});

// ===== TAB: FILE MANAGER (UPLOAD & DELETE ALL FILES) =====

// Direct upload to uploads/ folder
app.post('/admin/files/upload', requireAuth, upload.array('files', 10), (req, res) => {
  res.redirect('/admin?tab=files');
});

// Permanently delete any file in uploads/
app.post('/admin/files/delete/:filename', requireAuth, (req, res) => {
  const safeFilename = path.basename(req.params.filename);
  const filePath = 'uploads/' + safeFilename;
  deleteUploadedFile(filePath);

  // Also clean up references in database if this file was used
  const db = getDB();
  let changed = false;

  if (db.general.logoPath === filePath) {
    db.general.logoPath = 'assets/images/logo-gereja-amin-3d.png';
    changed = true;
  }
  if (db.home.hero.bgImage === filePath) {
    db.home.hero.bgImage = 'assets/images/church-hero-new.jpg';
    changed = true;
  }
  if (db.visit.hero.bgImage === filePath) {
    db.visit.hero.bgImage = 'assets/images/welcome-visitors.png';
    changed = true;
  }
  if (db.about.hero.bgImage === filePath) {
    db.about.hero.bgImage = 'assets/images/church-interior.png';
    changed = true;
  }
  if (db.pelayanan.hero.bgImage === filePath) {
    db.pelayanan.hero.bgImage = 'assets/images/church-interior.png';
    changed = true;
  }
  if (db.mediaGaleri.hero.bgImage === filePath) {
    db.mediaGaleri.hero.bgImage = 'assets/images/church-interior.png';
    changed = true;
  }
  if (db.contactFaq.hero.bgImage === filePath) {
    db.contactFaq.hero.bgImage = 'assets/images/church-interior.png';
    changed = true;
  }

  // Check Leaders
  if (db.about && db.about.pemimpin) {
    if (db.about.pemimpin.pendeta) {
      db.about.pemimpin.pendeta.forEach(p => {
        if (p.image === filePath) { p.image = ''; changed = true; }
      });
    }
    if (db.about.pemimpin.pengurus) {
      db.about.pemimpin.pengurus.forEach(p => {
        if (p.image === filePath) { p.image = ''; changed = true; }
      });
    }
    if (db.about.pemimpin.majelis) {
      db.about.pemimpin.majelis.forEach(m => {
        if (m.image === filePath) { m.image = ''; changed = true; }
      });
    }
  }

  // Check News
  if (db.home && db.home.news) {
    db.home.news.forEach(n => {
      if (n.image === filePath) { n.image = 'assets/images/slider_ibadah.png'; changed = true; }
    });
  }

  // Check Photos
  if (db.mediaGaleri && db.mediaGaleri.photos) {
    const beforeCount = db.mediaGaleri.photos.length;
    db.mediaGaleri.photos = db.mediaGaleri.photos.filter(p => p.src !== filePath);
    if (db.mediaGaleri.photos.length !== beforeCount) changed = true;
  }

  // Check Warta
  if (db.pelayanan && db.pelayanan.warta) {
    const beforeCount = db.pelayanan.warta.length;
    db.pelayanan.warta = db.pelayanan.warta.filter(w => w.file !== filePath);
    if (db.pelayanan.warta.length !== beforeCount) changed = true;
  }

  if (changed) saveDB(db);

  res.redirect('/admin?tab=files');
});

// ==================== ERROR HANDLING ====================

// Multer file validation error handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).send('File terlalu besar. Maksimal 10 MB.');
    }
    return res.status(400).send('Error upload: ' + err.message);
  }
  if (err && err.message && err.message.includes('Tipe file tidak diizinkan')) {
    return res.status(400).send(err.message);
  }
  next(err);
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('index', { ...getDB(), pageNotFound: true });
});

// Export app for Phusion Passenger (Hostinger)
module.exports = app;

// Only listen when run directly (not via Passenger)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}
