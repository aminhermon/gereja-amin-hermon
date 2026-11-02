/**
 * CMS Upgrade Phase 1: Footer + Contact Info + FAQ Editor
 * This script modifies: db.seed.json, server.js, admin.ejs, footer.ejs
 */
const fs = require('fs');
const path = require('path');

const projectDir = __dirname;

// ========== 1. UPDATE db.seed.json ==========
console.log('📦 Updating db.seed.json...');
const seedPath = path.join(projectDir, 'data', 'db.seed.json');
const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

// Add footer key
if (!seed.footer) {
  seed.footer = {
    description: "Komunitas yang bertumbuh dalam iman, kasih, dan pengharapan. Mari bergabung dan bertumbuh bersama kami dalam anugerah Tuhan.",
    socials: {
      facebook: "https://web.facebook.com/profile.php?id=61593610491064",
      instagram: "https://www.instagram.com/amin_hermon/",
      youtube: "https://www.youtube.com/@GerejaAMINJemaatHermon"
    },
    address: "Jl. Kresek Griya Agung No.58, RT.004/RW.004, Jatimelati, Kec. Pd. Melati, Kota Bks, Jawa Barat 17415, Indonesia",
    addressMapLink: "https://www.google.com/maps/search/?api=1&query=Jl.+Kresek+Griya+Agung+No.58,+RT.004/RW.004,+Jatimelati,+Kec.+Pd.+Melati,+Kota+Bks,+Jawa+Barat+17415",
    phone: "Sekretariat Gereja",
    email: "mail@aminhermon.or.id",
    scheduleDay: "Minggu",
    scheduleTime: "09.00 WIB",
    scheduleDesc: "Ibadah Raya Mingguan",
    floatingSocials: {
      instagram: "https://www.instagram.com/amin_hermon/",
      facebook: "https://web.facebook.com/profile.php?id=61593610491064"
    }
  };
  console.log('  ✅ footer key added');
}

// Add contact info to contactFaq
if (!seed.contactFaq.contactInfo) {
  seed.contactFaq.contactInfo = {
    address: "Jl. Kresek Griya Agung No.58, RT.004/RW.004, Jatimelati, Kec. Pd. Melati, Kota Bks, Jawa Barat 17415, Indonesia",
    addressMapLink: "https://www.google.com/maps/search/?api=1&query=Jl.+Kresek+Griya+Agung+No.58,+RT.004/RW.004,+Jatimelati,+Kec.+Pd.+Melati,+Kota+Bks,+Jawa+Barat+17415",
    phone: "Sekretariat Gereja",
    email: "mail@aminhermon.or.id",
    mapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.8!2d106.9!3d-6.3!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTgnMDAuMCJTIDEwNsKwNTQnMDAuMCJF!5e0!3m2!1sid!2sid!4v1"
  };
  console.log('  ✅ contactFaq.contactInfo key added');
}

fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2));
console.log('  💾 db.seed.json saved');

// ========== 2. UPDATE server.js ==========
console.log('\n🔧 Updating server.js...');
let serverContent = fs.readFileSync(path.join(projectDir, 'server.js'), 'utf8');

// 2a. Add footer + contactInfo migration to enrichMissingTopLevelKeys
const migrationMarker = '// Migrate old single popupBanner to popupBanners array';
const footerMigration = `// Ensure footer key exists with defaults from seed
    if (!targetDb.footer || typeof targetDb.footer !== 'object') {
      if (seedDb.footer) {
        targetDb.footer = JSON.parse(JSON.stringify(seedDb.footer));
        modified = true;
        console.log('✨ Footer editable key ditambahkan ke database');
      }
    }

    // Ensure contactFaq.contactInfo exists
    if (targetDb.contactFaq && !targetDb.contactFaq.contactInfo) {
      if (seedDb.contactFaq && seedDb.contactFaq.contactInfo) {
        targetDb.contactFaq.contactInfo = JSON.parse(JSON.stringify(seedDb.contactFaq.contactInfo));
        modified = true;
        console.log('✨ Contact info editable key ditambahkan ke database');
      }
    }

    ` + migrationMarker;

if (!serverContent.includes('Ensure footer key exists')) {
  serverContent = serverContent.replace(migrationMarker, footerMigration);
  console.log('  ✅ Migration logic for footer + contactInfo added');
}

// 2b. Add admin POST routes for Footer
const footerRoutes = `
// ===== TAB: FOOTER (EDITABLE) =====

app.post('/admin/footer', requireAuth, (req, res) => {
  const db = getDB();
  if (!db.footer) db.footer = {};
  db.footer.description = req.body.description || '';
  db.footer.address = req.body.address || '';
  db.footer.addressMapLink = req.body.addressMapLink || '';
  db.footer.phone = req.body.phone || '';
  db.footer.email = req.body.email || '';
  db.footer.scheduleDay = req.body.scheduleDay || '';
  db.footer.scheduleTime = req.body.scheduleTime || '';
  db.footer.scheduleDesc = req.body.scheduleDesc || '';
  if (!db.footer.socials) db.footer.socials = {};
  db.footer.socials.facebook = req.body.socialFacebook || '';
  db.footer.socials.instagram = req.body.socialInstagram || '';
  db.footer.socials.youtube = req.body.socialYoutube || '';
  if (!db.footer.floatingSocials) db.footer.floatingSocials = {};
  db.footer.floatingSocials.instagram = req.body.floatingInstagram || '';
  db.footer.floatingSocials.facebook = req.body.floatingFacebook || '';
  saveDB(db);
  res.redirect('/admin?tab=footer&msg=' + encodeURIComponent('Footer berhasil diperbarui!'));
});

// ===== TAB: CONTACT — FAQ CRUD =====

app.post('/admin/contact/info', requireAuth, (req, res) => {
  const db = getDB();
  if (!db.contactFaq.contactInfo) db.contactFaq.contactInfo = {};
  db.contactFaq.contactInfo.address = req.body.address || '';
  db.contactFaq.contactInfo.addressMapLink = req.body.addressMapLink || '';
  db.contactFaq.contactInfo.phone = req.body.phone || '';
  db.contactFaq.contactInfo.email = req.body.email || '';
  db.contactFaq.contactInfo.mapsEmbed = req.body.mapsEmbed || '';
  saveDB(db);
  res.redirect('/admin?tab=contact&msg=' + encodeURIComponent('Info kontak berhasil diperbarui!'));
});

app.post('/admin/contact/faq/add', requireAuth, (req, res) => {
  const db = getDB();
  if (!db.contactFaq.faq) db.contactFaq.faq = [];
  db.contactFaq.faq.push({
    q: req.body.q || '',
    a: req.body.a || ''
  });
  saveDB(db);
  res.redirect('/admin?tab=contact&msg=' + encodeURIComponent('FAQ berhasil ditambahkan!'));
});

app.post('/admin/contact/faq/edit/:idx', requireAuth, (req, res) => {
  const db = getDB();
  const idx = parseInt(req.params.idx);
  if (db.contactFaq.faq && db.contactFaq.faq[idx]) {
    db.contactFaq.faq[idx].q = req.body.q || '';
    db.contactFaq.faq[idx].a = req.body.a || '';
  }
  saveDB(db);
  res.redirect('/admin?tab=contact&msg=' + encodeURIComponent('FAQ berhasil diperbarui!'));
});

app.post('/admin/contact/faq/delete/:idx', requireAuth, (req, res) => {
  const db = getDB();
  const idx = parseInt(req.params.idx);
  if (db.contactFaq.faq && db.contactFaq.faq[idx]) {
    db.contactFaq.faq.splice(idx, 1);
  }
  saveDB(db);
  res.redirect('/admin?tab=contact&msg=' + encodeURIComponent('FAQ berhasil dihapus!'));
});

`;

// Insert before the kalender section
const kalenderMarker = "// ===== TAB: KALENDER (INTEGRASI KOMSEK & BERANDA) =====";
if (!serverContent.includes("TAB: FOOTER (EDITABLE)")) {
  serverContent = serverContent.replace(kalenderMarker, footerRoutes + kalenderMarker);
  console.log('  ✅ Footer + Contact FAQ admin routes added');
}

fs.writeFileSync(path.join(projectDir, 'server.js'), serverContent);
console.log('  💾 server.js saved');

// ========== 3. UPDATE admin.ejs ==========
console.log('\n🎨 Updating admin.ejs...');
let adminContent = fs.readFileSync(path.join(projectDir, 'views', 'admin.ejs'), 'utf8');

// 3a. Add Footer tab to sidebar nav (after contact, before files)
const filesNavItem = `<li><a href="/admin?tab=files"`;
const footerNavItem = `<li><a href="/admin?tab=footer" class="<%= tab === 'footer' ? 'active' : '' %>"><span class="emoji">🦶</span> Footer & Sosmed</a></li>\r\n      ${filesNavItem}`;

if (!adminContent.includes("tab=footer")) {
  adminContent = adminContent.replace(filesNavItem, footerNavItem);
  console.log('  ✅ Footer nav item added to sidebar');
}

// 3b. Add Footer tab title in topbar
const topbarFilesTitle = `<% } else if (tab === 'files') { %>`;
const topbarFooterTitle = `<% } else if (tab === 'footer') { %>🦶 Kelola Footer & Sosmed\r\n        ${topbarFilesTitle}`;

if (!adminContent.includes("tab === 'footer'") || !adminContent.includes("Kelola Footer")) {
  adminContent = adminContent.replace(topbarFilesTitle, topbarFooterTitle);
  console.log('  ✅ Footer topbar title added');
}

// 3c. Add Footer tab content panel (before kalender tab)
const kalenderTabPanel = `<!-- ============================== TAB: KALENDER`;
const footerTabPanel = `<!-- ============================== TAB: FOOTER & SOSMED ============================== -->
      <div class="tab-content <%= tab === 'footer' ? 'active' : '' %>">

        <!-- Footer Deskripsi & Jadwal -->
        <div class="card">
          <h2 class="card-title">📝 Konten Footer</h2>
          <p class="card-subtitle">Edit deskripsi gereja, info kontak, dan jadwal ibadah yang tampil di bagian bawah website.</p>
          <form action="/admin/footer" method="POST">
            <div class="form-group">
              <label>Deskripsi Gereja (Footer)</label>
              <textarea name="description" rows="3"><%= (db.footer && db.footer.description) ? db.footer.description : 'Komunitas yang bertumbuh dalam iman, kasih, dan pengharapan.' %></textarea>
              <span class="help-text">Teks singkat tentang gereja yang tampil di kolom brand footer</span>
            </div>
            <hr class="divider">
            <h4 style="color:var(--navy); margin-bottom:1rem;">📍 Kontak di Footer</h4>
            <div class="grid-2">
              <div class="form-group">
                <label>Alamat Lengkap</label>
                <textarea name="address" rows="2"><%= (db.footer && db.footer.address) ? db.footer.address : '' %></textarea>
              </div>
              <div class="form-group">
                <label>Link Google Maps</label>
                <input type="text" name="addressMapLink" value="<%= (db.footer && db.footer.addressMapLink) ? db.footer.addressMapLink : '' %>">
                <span class="help-text">URL untuk tombol "Buka di Google Maps"</span>
              </div>
            </div>
            <div class="grid-2">
              <div class="form-group">
                <label>Label Telepon</label>
                <input type="text" name="phone" value="<%= (db.footer && db.footer.phone) ? db.footer.phone : '' %>">
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="text" name="email" value="<%= (db.footer && db.footer.email) ? db.footer.email : '' %>">
              </div>
            </div>
            <hr class="divider">
            <h4 style="color:var(--navy); margin-bottom:1rem;">⏰ Jadwal Ibadah (Footer)</h4>
            <div class="grid-3">
              <div class="form-group">
                <label>Hari</label>
                <input type="text" name="scheduleDay" value="<%= (db.footer && db.footer.scheduleDay) ? db.footer.scheduleDay : 'Minggu' %>">
              </div>
              <div class="form-group">
                <label>Jam</label>
                <input type="text" name="scheduleTime" value="<%= (db.footer && db.footer.scheduleTime) ? db.footer.scheduleTime : '09.00 WIB' %>">
              </div>
              <div class="form-group">
                <label>Keterangan</label>
                <input type="text" name="scheduleDesc" value="<%= (db.footer && db.footer.scheduleDesc) ? db.footer.scheduleDesc : 'Ibadah Raya Mingguan' %>">
              </div>
            </div>
            <hr class="divider">
            <h4 style="color:var(--navy); margin-bottom:1rem;">🔗 Link Media Sosial (Footer)</h4>
            <div class="grid-3">
              <div class="form-group">
                <label>Facebook URL</label>
                <input type="text" name="socialFacebook" value="<%= (db.footer && db.footer.socials && db.footer.socials.facebook) ? db.footer.socials.facebook : '' %>" placeholder="https://facebook.com/...">
              </div>
              <div class="form-group">
                <label>Instagram URL</label>
                <input type="text" name="socialInstagram" value="<%= (db.footer && db.footer.socials && db.footer.socials.instagram) ? db.footer.socials.instagram : '' %>" placeholder="https://instagram.com/...">
              </div>
              <div class="form-group">
                <label>YouTube URL</label>
                <input type="text" name="socialYoutube" value="<%= (db.footer && db.footer.socials && db.footer.socials.youtube) ? db.footer.socials.youtube : '' %>" placeholder="https://youtube.com/...">
              </div>
            </div>
            <hr class="divider">
            <h4 style="color:var(--navy); margin-bottom:1rem;">📱 Floating Social Buttons</h4>
            <p class="card-subtitle">Tombol sosial media melayang di kanan bawah website (WhatsApp diambil dari tab Hubungi Kami).</p>
            <div class="grid-2">
              <div class="form-group">
                <label>Instagram URL (Floating)</label>
                <input type="text" name="floatingInstagram" value="<%= (db.footer && db.footer.floatingSocials && db.footer.floatingSocials.instagram) ? db.footer.floatingSocials.instagram : '' %>">
              </div>
              <div class="form-group">
                <label>Facebook URL (Floating)</label>
                <input type="text" name="floatingFacebook" value="<%= (db.footer && db.footer.floatingSocials && db.footer.floatingSocials.facebook) ? db.footer.floatingSocials.facebook : '' %>">
              </div>
            </div>
            <button type="submit" class="btn btn--gold">💾 Simpan Footer</button>
          </form>
        </div>

      </div>

      ${kalenderTabPanel}`;

if (!adminContent.includes("TAB: FOOTER")) {
  adminContent = adminContent.replace(kalenderTabPanel, footerTabPanel);
  console.log('  ✅ Footer tab panel added');
}

// 3d. Extend Contact tab with FAQ CRUD + Contact Info editor
// Find the end of the WhatsApp card in the contact tab and add Contact Info + FAQ sections
const contactTabEndOld = `        <!-- WhatsApp -->
        <div class="card">
          <h2 class="card-title">💬 WhatsApp</h2>
          <form action="/admin/contact/whatsapp" method="POST">
            <div class="grid-3">
              <div class="form-group"><label>Nomor WhatsApp</label><input type="text" name="number" value="<%= db.contactFaq.whatsapp.number %>"><span class="help-text">Format: 6281234567890</span></div>
              <div class="form-group"><label>Label Tombol</label><input type="text" name="label" value="<%= db.contactFaq.whatsapp.label %>"></div>
              <div class="form-group"><label>Pesan Default</label><input type="text" name="message" value="<%= db.contactFaq.whatsapp.message %>"></div>
            </div>
            <button type="submit" class="btn btn--gold">💾 Simpan</button>
          </form>
        </div>

      </div>`;

const contactTabEndNew = `        <!-- WhatsApp -->
        <div class="card">
          <h2 class="card-title">💬 WhatsApp</h2>
          <form action="/admin/contact/whatsapp" method="POST">
            <div class="grid-3">
              <div class="form-group"><label>Nomor WhatsApp</label><input type="text" name="number" value="<%= db.contactFaq.whatsapp.number %>"><span class="help-text">Format: 6281234567890</span></div>
              <div class="form-group"><label>Label Tombol</label><input type="text" name="label" value="<%= db.contactFaq.whatsapp.label %>"></div>
              <div class="form-group"><label>Pesan Default</label><input type="text" name="message" value="<%= db.contactFaq.whatsapp.message %>"></div>
            </div>
            <button type="submit" class="btn btn--gold">💾 Simpan</button>
          </form>
        </div>

        <!-- Info Kontak -->
        <div class="card">
          <h2 class="card-title">📍 Informasi Kontak</h2>
          <p class="card-subtitle">Data ini digunakan di halaman Hubungi Kami dan kartu kontak.</p>
          <form action="/admin/contact/info" method="POST">
            <div class="grid-2">
              <div class="form-group">
                <label>Alamat Lengkap</label>
                <textarea name="address" rows="2"><%= (db.contactFaq.contactInfo && db.contactFaq.contactInfo.address) ? db.contactFaq.contactInfo.address : '' %></textarea>
              </div>
              <div class="form-group">
                <label>Link Google Maps</label>
                <input type="text" name="addressMapLink" value="<%= (db.contactFaq.contactInfo && db.contactFaq.contactInfo.addressMapLink) ? db.contactFaq.contactInfo.addressMapLink : '' %>">
              </div>
            </div>
            <div class="grid-3">
              <div class="form-group">
                <label>Telepon / Label</label>
                <input type="text" name="phone" value="<%= (db.contactFaq.contactInfo && db.contactFaq.contactInfo.phone) ? db.contactFaq.contactInfo.phone : '' %>">
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="text" name="email" value="<%= (db.contactFaq.contactInfo && db.contactFaq.contactInfo.email) ? db.contactFaq.contactInfo.email : '' %>">
              </div>
              <div class="form-group">
                <label>URL Google Maps Embed</label>
                <input type="text" name="mapsEmbed" value="<%= (db.contactFaq.contactInfo && db.contactFaq.contactInfo.mapsEmbed) ? db.contactFaq.contactInfo.mapsEmbed : '' %>">
                <span class="help-text">URL iframe embed Google Maps</span>
              </div>
            </div>
            <button type="submit" class="btn btn--gold">💾 Simpan Kontak</button>
          </form>
        </div>

        <!-- FAQ Management -->
        <div class="card">
          <h2 class="card-title">❓ FAQ (Pertanyaan yang Sering Diajukan)</h2>
          <p class="card-subtitle">Kelola daftar pertanyaan dan jawaban yang tampil di halaman Hubungi Kami.</p>

          <!-- Add FAQ -->
          <div style="background:var(--bg); border:1px solid var(--border); border-radius:var(--radius); padding:1rem; margin-bottom:1.2rem;">
            <h4 style="color:var(--navy); margin-bottom:0.8rem; font-size:0.85rem;">➕ Tambah FAQ Baru</h4>
            <form action="/admin/contact/faq/add" method="POST">
              <div class="form-group">
                <label>Pertanyaan</label>
                <input type="text" name="q" placeholder="Contoh: Di mana lokasi Gereja AMIN Hermon?" required>
              </div>
              <div class="form-group">
                <label>Jawaban</label>
                <textarea name="a" rows="2" placeholder="Ketik jawaban..." required></textarea>
              </div>
              <button type="submit" class="btn btn--gold btn--sm">➕ Tambah FAQ</button>
            </form>
          </div>

          <hr class="divider">
          <h4 style="color:var(--navy); margin-bottom:0.8rem;">📋 Daftar FAQ (<%= db.contactFaq.faq ? db.contactFaq.faq.length : 0 %>)</h4>

          <% if (db.contactFaq.faq && db.contactFaq.faq.length > 0) { %>
            <% db.contactFaq.faq.forEach(function(item, idx) { %>
            <div class="faq-row">
              <form action="/admin/contact/faq/edit/<%= idx %>" method="POST">
                <div class="form-group" style="margin-bottom:0.6rem;">
                  <label>Pertanyaan #<%= idx + 1 %></label>
                  <input type="text" name="q" value="<%= item.q %>" required>
                </div>
                <div class="form-group" style="margin-bottom:0.6rem;">
                  <label>Jawaban</label>
                  <textarea name="a" rows="2" required><%= item.a %></textarea>
                </div>
                <div style="display:flex; gap:6px;">
                  <button type="submit" class="btn btn--gold btn--xs">💾 Simpan</button>
                  <button type="button" class="btn btn--danger btn--xs" onclick="if(confirm('Hapus FAQ ini?')) document.getElementById('faqDel<%= idx %>').submit();">🗑️ Hapus</button>
                </div>
              </form>
              <form id="faqDel<%= idx %>" action="/admin/contact/faq/delete/<%= idx %>" method="POST" style="display:none;"></form>
            </div>
            <% }); %>
          <% } else { %>
            <div style="text-align:center; padding:2rem; color:var(--text-muted); background:var(--bg); border-radius:var(--radius); border:1px solid var(--border);">
              <div style="font-size:2rem; margin-bottom:6px;">❓</div>
              <p style="margin:0; font-weight:600;">Belum ada FAQ. Tambahkan melalui form di atas.</p>
            </div>
          <% } %>
        </div>

      </div>`;

if (!adminContent.includes("Informasi Kontak") && !adminContent.includes("admin/contact/info")) {
  adminContent = adminContent.replace(contactTabEndOld, contactTabEndNew);
  console.log('  ✅ Contact Info + FAQ CRUD panels added to contact tab');
}

fs.writeFileSync(path.join(projectDir, 'views', 'admin.ejs'), adminContent);
console.log('  💾 admin.ejs saved');

// ========== 4. UPDATE footer.ejs ==========
console.log('\n🦶 Updating footer.ejs...');
const footerPath = path.join(projectDir, 'views', 'partials', 'footer.ejs');

const newFooter = `  <!-- ========== FOOTER ========== -->
  <footer class="footer" id="footer">
    <!-- Nias Traditional Cultural Pattern Border Ribbon -->
    <div class="nias-pattern-border nias-pattern-border--footer" aria-hidden="true"></div>
    <div class="footer__inner">
      <div class="container">
        <!-- Nias Ornament Strip -->
        <div class="nias-ornament-strip" aria-hidden="true">
          <span class="nias-line"></span>
          <span class="nias-diamond nias-diamond--red"></span>
          <span class="nias-diamond"></span>
          <span class="nias-diamond nias-diamond--lg"></span>
          <span class="nias-diamond"></span>
          <span class="nias-diamond nias-diamond--red"></span>
          <span class="nias-line"></span>
        </div>
        <div class="footer__grid">
          <!-- Column 1: Brand & Socials -->
          <div class="footer__col footer__brand">
            <a href="/" class="footer__logo-link">
              <h2 class="footer__logo-text"><%= general.churchName %></h2>
            </a>
            <p class="footer__desc"><%= (typeof footer !== 'undefined' && footer && footer.description) ? footer.description : 'Komunitas yang bertumbuh dalam iman, kasih, dan pengharapan. Mari bergabung dan bertumbuh bersama kami dalam anugerah Tuhan.' %></p>
            <div class="footer__socials">
              <% var fbUrl = (typeof footer !== 'undefined' && footer && footer.socials && footer.socials.facebook) ? footer.socials.facebook : 'https://web.facebook.com/profile.php?id=61593610491064'; %>
              <% var igUrl = (typeof footer !== 'undefined' && footer && footer.socials && footer.socials.instagram) ? footer.socials.instagram : 'https://www.instagram.com/amin_hermon/'; %>
              <% var ytUrl = (typeof footer !== 'undefined' && footer && footer.socials && footer.socials.youtube) ? footer.socials.youtube : 'https://www.youtube.com/@GerejaAMINJemaatHermon'; %>
              <% if (fbUrl) { %>
              <a href="<%= fbUrl %>" class="footer__social-link" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <% } %>
              <% if (igUrl) { %>
              <a href="<%= igUrl %>" class="footer__social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <% } %>
              <% if (ytUrl) { %>
              <a href="<%= ytUrl %>" class="footer__social-link" aria-label="YouTube" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
              </a>
              <% } %>
            </div>
          </div>

          <!-- Column 2: Quick Links -->
          <div class="footer__col">
            <h4 class="footer__heading">Navigasi</h4>
            <ul class="footer__links">
              <li><a href="/">Beranda</a></li>
              <li><a href="/visit">Baru di Sini?</a></li>
              <li><a href="/about">Tentang Gereja</a></li>
              <li><a href="/pelayanan" class="footer-link">Pelayanan</a></li>
              <li><a href="/media">Media</a></li>
              <li><a href="/contact">Hubungi Kami</a></li>
            </ul>
          </div>

          <!-- Column 3: Contact Info -->
          <div class="footer__col">
            <h4 class="footer__heading">Kontak</h4>
            <ul class="footer__contact-list">
              <li class="footer__contact-item">
                <div class="footer__contact-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div class="footer__contact-text">
                  <strong>Alamat</strong><br>
                  <% var fAddr = (typeof footer !== 'undefined' && footer && footer.address) ? footer.address : 'Jl. Kresek Griya Agung No.58, RT.004/RW.004, Jatimelati, Kec. Pd. Melati, Kota Bks, Jawa Barat 17415, Indonesia'; %>
                  <% var fMapLink = (typeof footer !== 'undefined' && footer && footer.addressMapLink) ? footer.addressMapLink : 'https://www.google.com/maps/search/?api=1&query=Jl.+Kresek+Griya+Agung+No.58'; %>
                  <a href="<%= fMapLink %>" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: none; display: block; line-height: 1.5; margin-top: 2px;">
                    <%= fAddr %>
                    <span style="display: block; margin-top: 4px; font-size: 0.75rem; color: var(--gold); font-weight: 600;">📍 Buka di Google Maps &rarr;</span>
                  </a>
                </div>
              </li>
              <li class="footer__contact-item">
                <div class="footer__contact-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.8.36 1.59.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c1.22.34 2.01.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </div>
                <div class="footer__contact-text">
                  <strong>Telepon</strong><br>
                  <%= (typeof footer !== 'undefined' && footer && footer.phone) ? footer.phone : 'Sekretariat Gereja' %>
                </div>
              </li>
              <li class="footer__contact-item">
                <div class="footer__contact-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <div class="footer__contact-text">
                  <strong>Email</strong><br>
                  <% var fEmail = (typeof footer !== 'undefined' && footer && footer.email) ? footer.email : 'mail@aminhermon.or.id'; %>
                  <a href="mailto:<%= fEmail %>" style="color: inherit; text-decoration: none;"><%= fEmail %></a>
                </div>
              </li>
            </ul>
          </div>

          <!-- Column 4: Schedule Snippet -->
          <div class="footer__col">
            <h4 class="footer__heading">Jadwal Ibadah</h4>
            <div class="footer__schedule-box">
              <div class="footer__schedule-row">
                <span class="footer__schedule-day"><%= (typeof footer !== 'undefined' && footer && footer.scheduleDay) ? footer.scheduleDay : 'Minggu' %></span>
                <span class="footer__schedule-time"><%= (typeof footer !== 'undefined' && footer && footer.scheduleTime) ? footer.scheduleTime : '09.00 WIB' %></span>
              </div>
              <p class="footer__schedule-desc"><%= (typeof footer !== 'undefined' && footer && footer.scheduleDesc) ? footer.scheduleDesc : 'Ibadah Raya Mingguan' %></p>
              <a href="/pelayanan" class="footer__schedule-link">Lihat semua jadwal &rarr;</a>
            </div>
          </div>

        </div>
      </div>
    </div>
    
    <div class="footer__bottom">
      <div class="container footer__bottom-inner">
        <div class="footer__copyright">
          &copy; <%= new Date().getFullYear() %> <%= general.churchName %>. Semua hak cipta dilindungi.
        </div>
        <div class="footer__legal">
          <a href="#">Kebijakan Privasi</a>
          <span class="footer__separator">|</span>
          <a href="#">Syarat & Ketentuan</a>
        </div>
        <div class="visitor-live-badge" id="visitorBadge">
          <span class="pulse-dot"></span>
          <span id="visitorOnline"><%= (typeof _visitors !== 'undefined' && _visitors && typeof _visitors.online === 'number') ? _visitors.online : (typeof _onlineVisitors === 'number' ? _onlineVisitors : 1) %></span> online
          <span class="visitor-sep">•</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          <span id="visitorTotal"><%= (typeof _visitors !== 'undefined' && _visitors && typeof _visitors.total === 'number') ? _visitors.total.toLocaleString('id-ID') : 0 %></span> kunjungan
        </div>
      </div>
    </div>
  </footer>

  <!-- ========== FLOATING SOCIAL BADGES ========== -->
  <div class="floating-social" id="floating-social">
    <% var floatIg = (typeof footer !== 'undefined' && footer && footer.floatingSocials && footer.floatingSocials.instagram) ? footer.floatingSocials.instagram : 'https://www.instagram.com/amin_hermon/'; %>
    <% var floatFb = (typeof footer !== 'undefined' && footer && footer.floatingSocials && footer.floatingSocials.facebook) ? footer.floatingSocials.facebook : 'https://web.facebook.com/profile.php?id=61593610491064'; %>
    <% var floatWa = (typeof contactFaq !== 'undefined' && contactFaq.whatsapp) ? contactFaq.whatsapp.number : '6281234567890'; %>
    <!-- Instagram -->
    <% if (floatIg) { %>
    <a href="<%= floatIg %>" target="_blank" rel="noopener noreferrer" class="floating-social__btn floating-social__btn--ig" aria-label="Instagram">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
    </a>
    <% } %>
    <!-- Facebook -->
    <% if (floatFb) { %>
    <a href="<%= floatFb %>" target="_blank" rel="noopener noreferrer" class="floating-social__btn floating-social__btn--fb" aria-label="Facebook">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07c0 6.02 4.39 11.02 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.23 2.68.23v2.97h-1.51c-1.49 0-1.95.93-1.95 1.87v2.26h3.33l-.53 3.49h-2.8v8.44C19.61 23.09 24 18.09 24 12.07z"/></svg>
    </a>
    <% } %>
    <!-- WhatsApp -->
    <a href="https://wa.me/<%= floatWa %>" target="_blank" rel="noopener noreferrer" class="floating-social__btn floating-social__btn--wa" aria-label="Chat WhatsApp">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.28-.1-.48-.15-.68.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.78-1.68-2.08-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.64-.93-2.25-.25-.58-.5-.5-.68-.51-.18-.01-.38-.01-.58-.01s-.53.07-.8.38c-.28.3-1.06 1.03-1.06 2.52 0 1.49 1.08 2.92 1.23 3.12.15.2 2.13 3.25 5.16 4.56.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zm-5.42 7.4A9.87 9.87 0 0 1 7 20.14l-.36-.21-3.73.98.99-3.63-.24-.37a9.88 9.88 0 0 1-1.51-5.26c0-5.46 4.44-9.9 9.9-9.9 2.65 0 5.13 1.03 7 2.9a9.84 9.84 0 0 1 2.9 7c0 5.46-4.44 9.9-9.9 9.9zm8.41-18.31A11.82 11.82 0 0 0 12.05.03C5.5.03.16 5.37.16 11.92c0 2.1.55 4.14 1.58 5.95L0 24l6.3-1.65a11.87 11.87 0 0 0 5.75 1.47c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.48-8.41z"/></svg>
    </a>
  </div>

  <!-- ========== RENUNGAN HARIAN FLOATING WIDGET ========== -->
  <a href="/renungan" class="renungan-float-btn" aria-label="Renungan Harian" style="position: fixed; bottom: 30px; left: 30px; background-color: var(--navy); color: var(--gold); border: 2px solid var(--gold); padding: 10px 20px; border-radius: 50px; text-align: center; font-family: var(--font-heading); font-size: 16px; font-weight: 600; box-shadow: 0px 4px 10px rgba(0,0,0,0.3); z-index: 1000; display: flex; align-items: center; gap: 8px; transition: transform 0.3s ease, background-color 0.3s ease; text-decoration: none;">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
    Renungan Harian
  </a>

  <!-- ========== BACK TO TOP BUTTON ========== -->
  <button id="backToTopBtn" class="back-to-top" aria-label="Kembali ke atas">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
  </button>

  <style>
    /* ---- Floating Social Stack ---- */
    .floating-social {
      position: fixed;
      bottom: 30px;
      right: 30px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
    }
    .floating-social__btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      color: #fff;
      text-decoration: none;
      box-shadow: 0 4px 14px rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.15);
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
      animation: floatSocialIn 0.5s ease both;
    }
    .floating-social__btn:hover {
      transform: scale(1.15);
      box-shadow: 0 6px 20px rgba(0,0,0,0.35);
    }
    /* WhatsApp - largest */
    .floating-social__btn--wa {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
      animation-delay: 0s;
    }
    .floating-social__btn--wa:hover {
      background: linear-gradient(135deg, #20b858 0%, #0e7a6e 100%);
    }
    /* Facebook */
    .floating-social__btn--fb {
      background: linear-gradient(135deg, #1877f2 0%, #0d5bbf 100%);
      animation-delay: 0.1s;
    }
    .floating-social__btn--fb:hover {
      background: linear-gradient(135deg, #1565d8 0%, #0a4fa6 100%);
    }
    /* Instagram */
    .floating-social__btn--ig {
      background: linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
      animation-delay: 0.2s;
    }
    .floating-social__btn--ig:hover {
      background: linear-gradient(135deg, #e58529 0%, #d45d33 25%, #c9203b 50%, #b81e5b 75%, #a8147a 100%);
    }

    @keyframes floatSocialIn {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.8);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* Mobile adjustments */
    @media (max-width: 768px) {
      .floating-social {
        bottom: 20px;
        right: 20px;
        gap: 12px;
      }
      .floating-social__btn {
        width: 44px;
        height: 44px;
      }
      .floating-social__btn--wa {
        width: 54px;
        height: 54px;
      }
      .floating-social__btn svg {
        width: 22px;
        height: 22px;
      }
      .floating-social__btn--wa svg {
        width: 26px;
        height: 26px;
      }
    }

    .renungan-float-btn:hover { transform: translateY(-5px); background-color: var(--gold); color: var(--navy); }
  </style>
`;

fs.writeFileSync(footerPath, newFooter);
console.log('  ✅ footer.ejs fully rewritten with dynamic data');
console.log('  💾 footer.ejs saved');

console.log('\n✅ CMS Upgrade Phase 1 complete!');
console.log('   - Footer content now editable from CMS (new "Footer & Sosmed" tab)');
console.log('   - Contact Info editable from CMS (Contact tab)');
console.log('   - FAQ CRUD (add/edit/delete) from CMS (Contact tab)');
console.log('   - Floating social buttons editable from CMS');
console.log('\nNext: Run `node build.js` and bump CSS version.');
