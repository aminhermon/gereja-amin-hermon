const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== PERFORMANCE ====================

// Gzip / Brotli compression
app.use(compression({ level: 6, threshold: 1024 }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

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

// ---------- Admin Dashboard (tabbed) ----------
app.get('/admin', (req, res) => {
  res.render('admin', { db: getDB(), tab: req.query.tab || 'beranda' });
});

// ===== TAB: BERANDA =====

// General settings (name)
app.post('/admin/general', upload.single('logo'), (req, res) => {
  const db = getDB();
  db.general.churchName = req.body.churchName;
  if (req.file) db.general.logoPath = 'uploads/' + req.file.filename;
  saveDB(db);
  res.redirect('/admin?tab=beranda');
});

// Home hero
app.post('/admin/home/hero', upload.single('bgImage'), (req, res) => {
  const db = getDB();
  db.home.hero.titleHTML = req.body.titleHTML;
  db.home.hero.subtitle = req.body.subtitle;
  db.home.hero.ctaText = req.body.ctaText || db.home.hero.ctaText;
  db.home.hero.ctaLink = req.body.ctaLink || db.home.hero.ctaLink;
  if (req.file) db.home.hero.bgImage = 'uploads/' + req.file.filename;
  saveDB(db);
  res.redirect('/admin?tab=beranda');
});

// Home stats
app.post('/admin/home/stats', (req, res) => {
  const db = getDB();
  db.home.stats.totalJemaat = parseInt(req.body.totalJemaat) || 0;
  db.home.stats.lakiLaki = parseInt(req.body.lakiLaki) || 0;
  db.home.stats.perempuan = parseInt(req.body.perempuan) || 0;
  db.home.stats.anakAnak = parseInt(req.body.anakAnak) || 0;
  saveDB(db);
  res.redirect('/admin?tab=beranda');
});

// News/events - update
app.post('/admin/home/news/:id', upload.single('image'), (req, res) => {
  const db = getDB();
  const idx = db.home.news.findIndex(n => n.id === req.params.id);
  if (idx > -1) {
    db.home.news[idx].date = req.body.date;
    db.home.news[idx].title = req.body.title;
    db.home.news[idx].desc = req.body.desc;
    if (req.file) db.home.news[idx].image = 'uploads/' + req.file.filename;
    saveDB(db);
  }
  res.redirect('/admin?tab=beranda');
});

// News/events - add new
app.post('/admin/home/news/add', upload.single('image'), (req, res) => {
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

// News/events - delete
app.post('/admin/home/news/delete/:id', (req, res) => {
  const db = getDB();
  db.home.news = db.home.news.filter(n => n.id !== req.params.id);
  saveDB(db);
  res.redirect('/admin?tab=beranda');
});

// ===== TAB: BARU DI SINI =====

// Visit hero
app.post('/admin/visit/hero', upload.single('bgImage'), (req, res) => {
  const db = getDB();
  db.visit.hero.titleHTML = req.body.titleHTML;
  db.visit.hero.subtitle = req.body.subtitle;
  if (req.file) db.visit.hero.bgImage = 'uploads/' + req.file.filename;
  saveDB(db);
  res.redirect('/admin?tab=visit');
});

// Visit sambutan
app.post('/admin/visit/sambutan', (req, res) => {
  const db = getDB();
  db.visit.sambutan = req.body.sambutan;
  saveDB(db);
  res.redirect('/admin?tab=visit');
});

// Visit jadwal ibadah
app.post('/admin/visit/jadwal', (req, res) => {
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
app.post('/admin/visit/lokasi', (req, res) => {
  const db = getDB();
  db.visit.lokasi.judul = req.body.judul;
  db.visit.lokasi.deskripsi = req.body.deskripsi;
  db.visit.lokasi.mapsQuery = req.body.mapsQuery;
  db.visit.lokasi.alamat = req.body.alamat;
  saveDB(db);
  res.redirect('/admin?tab=visit');
});

// Visit sakramen
app.post('/admin/visit/sakramen', (req, res) => {
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
app.post('/admin/about/hero', upload.single('bgImage'), (req, res) => {
  const db = getDB();
  db.about.hero.titleHTML = req.body.titleHTML;
  db.about.hero.subtitle = req.body.subtitle;
  if (req.file) db.about.hero.bgImage = 'uploads/' + req.file.filename;
  saveDB(db);
  res.redirect('/admin?tab=about');
});

// About sejarah
app.post('/admin/about/sejarah', (req, res) => {
  const db = getDB();
  db.about.sejarah.title = req.body.title;
  db.about.sejarah.content = req.body.content;
  saveDB(db);
  res.redirect('/admin?tab=about');
});

// About visi & misi
app.post('/admin/about/visimisi', (req, res) => {
  const db = getDB();
  db.about.visiMisi.visi = req.body.visi;
  const misiItems = Array.isArray(req.body.misi) ? req.body.misi : [req.body.misi];
  db.about.visiMisi.misiList = misiItems.filter(m => m && m.trim());
  saveDB(db);
  res.redirect('/admin?tab=about');
});

// About pendeta - update
app.post('/admin/about/pendeta/:idx', upload.single('image'), (req, res) => {
  const db = getDB();
  const idx = parseInt(req.params.idx);
  if (db.about.pemimpin.pendeta[idx]) {
    db.about.pemimpin.pendeta[idx].name = req.body.name;
    db.about.pemimpin.pendeta[idx].role = req.body.role;
    db.about.pemimpin.pendeta[idx].bio = req.body.bio || '';
    if (req.file) db.about.pemimpin.pendeta[idx].image = 'uploads/' + req.file.filename;
  }
  saveDB(db);
  res.redirect('/admin?tab=about');
});

// About pengurus - individual update with photo
app.post('/admin/about/pengurus/:idx', upload.single('image'), (req, res) => {
  const db = getDB();
  const idx = parseInt(req.params.idx);
  if (db.about.pemimpin.pengurus[idx]) {
    db.about.pemimpin.pengurus[idx].name = req.body.name;
    db.about.pemimpin.pengurus[idx].role = req.body.role;
    if (req.file) db.about.pemimpin.pengurus[idx].image = 'uploads/' + req.file.filename;
  }
  saveDB(db);
  res.redirect('/admin?tab=about');
});

// About majelis - individual update with photo
app.post('/admin/about/majelis/:idx', upload.single('image'), (req, res) => {
  const db = getDB();
  const idx = parseInt(req.params.idx);
  if (db.about.pemimpin.majelis[idx]) {
    db.about.pemimpin.majelis[idx].name = req.body.name;
    db.about.pemimpin.majelis[idx].role = req.body.role || 'Majelis';
    if (req.file) db.about.pemimpin.majelis[idx].image = 'uploads/' + req.file.filename;
  }
  saveDB(db);
  res.redirect('/admin?tab=about');
});

// ===== TAB: PELAYANAN & WARTA =====

// Pelayanan hero
app.post('/admin/pelayanan/hero', upload.single('bgImage'), (req, res) => {
  const db = getDB();
  db.pelayanan.hero.titleHTML = req.body.titleHTML;
  db.pelayanan.hero.subtitle = req.body.subtitle;
  if (req.file) db.pelayanan.hero.bgImage = 'uploads/' + req.file.filename;
  saveDB(db);
  res.redirect('/admin?tab=pelayanan');
});

// Pelayanan - jadwal pelayan
app.post('/admin/pelayanan/jadwal', (req, res) => {
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
app.post('/admin/media/hero', upload.single('bgImage'), (req, res) => {
  const db = getDB();
  db.mediaGaleri.hero.titleHTML = req.body.titleHTML;
  db.mediaGaleri.hero.subtitle = req.body.subtitle;
  if (req.file) db.mediaGaleri.hero.bgImage = 'uploads/' + req.file.filename;
  saveDB(db);
  res.redirect('/admin?tab=media');
});

// Gallery photo upload
app.post('/admin/media/photo', upload.single('photo'), (req, res) => {
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

// Delete gallery photo
app.post('/admin/media/photo/delete/:id', (req, res) => {
  const db = getDB();
  db.mediaGaleri.photos = db.mediaGaleri.photos.filter(p => p.id !== req.params.id);
  saveDB(db);
  res.redirect('/admin?tab=media');
});

// Warta upload
app.post('/admin/media/warta', upload.single('file'), (req, res) => {
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

// Warta delete
app.post('/admin/media/warta/delete/:id', (req, res) => {
  const db = getDB();
  db.pelayanan.warta = db.pelayanan.warta.filter(w => w.id !== req.params.id);
  saveDB(db);
  res.redirect('/admin?tab=media');
});

// Renungan add
app.post('/admin/media/renungan', (req, res) => {
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
app.post('/admin/media/renungan/delete/:id', (req, res) => {
  const db = getDB();
  if (db.mediaGaleri.renungan) {
    db.mediaGaleri.renungan = db.mediaGaleri.renungan.filter(r => r.id !== req.params.id);
  }
  saveDB(db);
  res.redirect('/admin?tab=media');
});

// Video add
app.post('/admin/media/video', (req, res) => {
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
app.post('/admin/media/video/delete/:id', (req, res) => {
  const db = getDB();
  if (db.mediaGaleri.videos) {
    db.mediaGaleri.videos = db.mediaGaleri.videos.filter(v => v.id !== req.params.id);
  }
  saveDB(db);
  res.redirect('/admin?tab=media');
});

// ===== TAB: HUBUNGI KAMI =====

// Contact hero
app.post('/admin/contact/hero', upload.single('bgImage'), (req, res) => {
  const db = getDB();
  db.contactFaq.hero.titleHTML = req.body.titleHTML;
  db.contactFaq.hero.subtitle = req.body.subtitle;
  if (req.file) db.contactFaq.hero.bgImage = 'uploads/' + req.file.filename;
  saveDB(db);
  res.redirect('/admin?tab=contact');
});

// Contact WhatsApp
app.post('/admin/contact/whatsapp', (req, res) => {
  const db = getDB();
  db.contactFaq.whatsapp.number = req.body.number;
  db.contactFaq.whatsapp.message = req.body.message;
  db.contactFaq.whatsapp.label = req.body.label;
  saveDB(db);
  res.redirect('/admin?tab=contact');
});

// ===== TAB: KALENDER =====

// Kalender add
app.post('/admin/kalender/add', (req, res) => {
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
app.post('/admin/kalender/delete/:id', (req, res) => {
  const db = getDB();
  if (db.kalender) {
    db.kalender = db.kalender.filter(k => k.id !== req.params.id);
  }
  saveDB(db);
  res.redirect('/admin?tab=kalender');
});

// Export app for Phusion Passenger (Hostinger)
module.exports = app;

// Only listen when run directly (not via Passenger)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}
