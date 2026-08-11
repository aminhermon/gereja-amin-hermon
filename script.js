/* ═══════════════════════════════════════════════════════════════
   GEREJA AMIN HERMON — Main JavaScript
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initParticles();
  initSlideshow();
  initCountUp();
  initRevealAnimations();
  initCalendar();
  initMajelisGrid();
  initBackToTop();
});

/* ═══════════════════════════════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════════════════════════════ */
function initNavigation() {
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile toggle
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
  });

  // Smooth scroll & active state
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Active section on scroll
  const sections = document.querySelectorAll('section[id]');
  const observerOptions = { rootMargin: '-30% 0px -70% 0px' };
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === id);
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => sectionObserver.observe(section));
}

/* ═══════════════════════════════════════════════════════════════
   HERO PARTICLES
   ═══════════════════════════════════════════════════════════════ */
function initParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;

  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.classList.add('hero-particle');
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.width = particle.style.height = `${2 + Math.random() * 4}px`;
    particle.style.animationDuration = `${6 + Math.random() * 10}s`;
    particle.style.animationDelay = `${Math.random() * 8}s`;
    particle.style.opacity = `${0.1 + Math.random() * 0.3}`;
    container.appendChild(particle);
  }
}

/* ═══════════════════════════════════════════════════════════════
   NEWS SLIDESHOW
   ═══════════════════════════════════════════════════════════════ */
let currentSlide = 0;
let slideInterval;

const newsData = [
  {
    title: 'Ibadah Syukur HUT Gereja AMIN Hermon',
    date: '29 Juni 2026',
    category: 'Ibadah',
    content: 'Puji syukur kepada Tuhan atas penyertaan-Nya selama bertahun-tahun bersama Gereja AMIN Hermon. Ibadah syukur akan diselenggarakan dengan meriah, menampilkan pentas seni dari berbagai komisi pelayanan, kebaktian khusus, dan persekutuan makan bersama seluruh jemaat.\n\nSeluruh jemaat dan simpatisan diharapkan hadir dalam perayaan penuh sukacita ini. Mari kita bersama memuliakan Tuhan atas setiap berkat dan kasih-Nya yang tak berkesudahan.'
  },
  {
    title: 'Pendaftaran Katekisasi & Sidi Angkatan 2026',
    date: '6 Juli 2026',
    category: 'Pelayanan',
    content: 'Pendaftaran kelas katekisasi untuk persiapan peneguhan sidi telah resmi dibuka. Kelas ini dirancang untuk remaja dan dewasa yang ingin memahami lebih dalam tentang iman Kristen dan berkomitmen menjadi anggota penuh jemaat.\n\nPersyaratan:\n• Usia minimal 15 tahun (atau sesuai ketentuan gereja)\n• Mengisi formulir pendaftaran di sekretariat\n• Bersedia mengikuti seluruh rangkaian kelas\n\nKelas akan dimulai pada bulan Agustus 2026. Hubungi sekretariat gereja untuk informasi lengkap.'
  },
  {
    title: 'Retreat Pemuda-Remaja 2026',
    date: '13 Juli 2026',
    category: 'Kegiatan',
    content: 'Retreat tahunan pemuda-remaja Gereja AMIN Hermon akan diselenggarakan dengan tema "Berberani untuk Kristus". Acara ini bertujuan mempererat persaudaraan, memperdalam iman, dan membangun karakter pemuda yang berdasarkan Firman Tuhan.\n\nRangkaian acara meliputi:\n• Sesi pembinaan rohani bersama narasumber\n• Diskusi kelompok kecil\n• Outbound dan games\n• Malam pujian dan penyembahan\n\nPendaftaran terbatas. Segera daftarkan diri Anda!'
  },
  {
    title: 'Bakti Sosial & Pelayanan Kasih',
    date: '20 Juli 2026',
    category: 'Diakonia',
    content: 'Gereja AMIN Hermon akan mengadakan program bakti sosial sebagai wujud pelayanan kasih kepada masyarakat sekitar. Program ini meliputi pembagian sembako, pemeriksaan kesehatan gratis, dan kegiatan bersih lingkungan.\n\nKami mengajak seluruh jemaat untuk terlibat aktif dalam pelayanan ini, baik melalui tenaga, doa, maupun persembahan. "Sebab kasih karunia Tuhan kita Yesus Kristus, bahwa Ia, yang oleh karena kamu menjadi miskin, sekalipun Ia kaya, supaya kamu menjadi kaya oleh karena kemiskinan-Nya." (2 Korintus 8:9)'
  }
];

function initSlideshow() {
  const track = document.getElementById('slideshowTrack');
  const dotsContainer = document.getElementById('slideDots');
  const prevBtn = document.getElementById('slidePrev');
  const nextBtn = document.getElementById('slideNext');
  if (!track || !dotsContainer) return;

  const slides = track.querySelectorAll('.slide-card');
  const totalSlides = slides.length;

  // Create dots
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('div');
    dot.classList.add('slide-dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  }

  function updateSlideshow() {
    const slideWidth = slides[0].offsetWidth + 24; // gap
    const maxOffset = track.scrollWidth - track.parentElement.offsetWidth;
    let offset = currentSlide * slideWidth;
    if (offset > maxOffset) offset = maxOffset;
    track.style.transform = `translateX(-${offset}px)`;

    dotsContainer.querySelectorAll('.slide-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  function goToSlide(index) {
    currentSlide = Math.max(0, Math.min(index, totalSlides - 1));
    updateSlideshow();
    resetAutoplay();
  }

  prevBtn.addEventListener('click', () => {
    goToSlide(currentSlide <= 0 ? totalSlides - 1 : currentSlide - 1);
  });

  nextBtn.addEventListener('click', () => {
    goToSlide(currentSlide >= totalSlides - 1 ? 0 : currentSlide + 1);
  });

  // Autoplay
  function resetAutoplay() {
    clearInterval(slideInterval);
    slideInterval = setInterval(() => {
      goToSlide(currentSlide >= totalSlides - 1 ? 0 : currentSlide + 1);
    }, 5000);
  }

  resetAutoplay();

  // Touch/swipe support
  let startX = 0;
  let isDragging = false;

  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToSlide(currentSlide + 1);
      else goToSlide(currentSlide - 1);
    }
    isDragging = false;
  }, { passive: true });

  // Responsive resize
  window.addEventListener('resize', updateSlideshow);
}

/* News Modal */
function openNewsModal(index) {
  const modal = document.getElementById('newsModal');
  const body = document.getElementById('newsModalBody');
  const news = newsData[index];
  if (!news) return;

  body.innerHTML = `
    <h2>${news.title}</h2>
    <div class="modal-date">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      ${news.date} &nbsp;•&nbsp; ${news.category}
    </div>
    ${news.content.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('')}
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeNewsModal() {
  document.getElementById('newsModal').classList.remove('active');
  document.body.style.overflow = '';
}

/* ═══════════════════════════════════════════════════════════════
   COUNT UP ANIMATION
   ═══════════════════════════════════════════════════════════════ */
function initCountUp() {
  const statNumbers = document.querySelectorAll('.stat-number');
  const statBars = document.querySelectorAll('.stat-bar-fill');
  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        statNumbers.forEach(el => {
          const target = parseInt(el.dataset.target);
          animateCounter(el, target);
        });
        statBars.forEach(bar => {
          setTimeout(() => bar.classList.add('animated'), 300);
        });
      }
    });
  }, { threshold: 0.3 });

  const dashboard = document.querySelector('.dashboard-section');
  if (dashboard) observer.observe(dashboard);
}

function animateCounter(el, target) {
  const duration = 2000;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }

  requestAnimationFrame(update);
}

/* ═══════════════════════════════════════════════════════════════
   REVEAL ON SCROLL
   ═══════════════════════════════════════════════════════════════ */
function initRevealAnimations() {
  const reveals = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay) || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  reveals.forEach(el => observer.observe(el));
}

/* ═══════════════════════════════════════════════════════════════
   LEADER TABS
   ═══════════════════════════════════════════════════════════════ */
function switchLeaderTab(tab) {
  document.querySelectorAll('.leader-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  document.querySelectorAll('.leader-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `panel-${tab}`);
  });
}

/* ═══════════════════════════════════════════════════════════════
   MAJELIS GRID (generate 21 cards)
   ═══════════════════════════════════════════════════════════════ */
function initMajelisGrid() {
  const grid = document.getElementById('majelisGrid');
  if (!grid) return;

  for (let i = 1; i <= 21; i++) {
    const card = document.createElement('div');
    card.className = 'leader-card';
    card.id = `majelis-${i}`;
    card.innerHTML = `
      <div class="leader-avatar">
        <div class="avatar-placeholder avatar-sm">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
      </div>
      <div class="leader-info">
        <span class="leader-role">Majelis</span>
        <h3 class="leader-name">[Nama Majelis ${i}]</h3>
      </div>
    `;
    grid.appendChild(card);
  }
}

/* ═══════════════════════════════════════════════════════════════
   SERVICE TABLE TABS
   ═══════════════════════════════════════════════════════════════ */
function switchServiceTab(index) {
  document.querySelectorAll('.table-tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === index);
  });
  document.querySelectorAll('.table-panel').forEach((panel, i) => {
    panel.classList.toggle('active', i === index);
  });
}

/* ═══════════════════════════════════════════════════════════════
   CALENDAR
   ═══════════════════════════════════════════════════════════════ */
const calendarEvents = [
  { date: '2026-06-07', title: 'Ibadah Minggu', type: 'ibadah', desc: 'Ibadah penyembahan dan pemberitaan Firman Tuhan.' },
  { date: '2026-06-14', title: 'Ibadah Minggu', type: 'ibadah', desc: 'Ibadah penyembahan dan pemberitaan Firman Tuhan.' },
  { date: '2026-06-15', title: 'Rapat BPH', type: 'kegiatan', desc: 'Rapat koordinasi Badan Pekerja Harian (BPH).' },
  { date: '2026-06-21', title: 'Ibadah Minggu', type: 'ibadah', desc: 'Ibadah penyembahan dan pemberitaan Firman Tuhan.' },
  { date: '2026-06-25', title: 'Latihan Paduan Suara', type: 'pelayanan', desc: 'Latihan rutin paduan suara gereja.' },
  { date: '2026-06-28', title: 'Ibadah Minggu', type: 'ibadah', desc: 'Ibadah penyembahan dan pemberitaan Firman Tuhan.' },
  { date: '2026-06-29', title: 'Ibadah Syukur HUT', type: 'kegiatan', desc: 'Perayaan syukur HUT Gereja AMIN Hermon.' },
  { date: '2026-07-05', title: 'Ibadah Minggu', type: 'ibadah', desc: 'Ibadah penyembahan dan pemberitaan Firman Tuhan.' },
  { date: '2026-07-06', title: 'Pendaftaran Katekisasi', type: 'pelayanan', desc: 'Pembukaan pendaftaran kelas katekisasi/sidi.' },
  { date: '2026-07-12', title: 'Ibadah Minggu', type: 'ibadah', desc: 'Ibadah penyembahan dan pemberitaan Firman Tuhan.' },
  { date: '2026-07-13', title: 'Retreat Pemuda', type: 'kegiatan', desc: 'Retreat pemuda-remaja gereja.' },
  { date: '2026-07-19', title: 'Ibadah Minggu', type: 'ibadah', desc: 'Ibadah penyembahan dan pemberitaan Firman Tuhan.' },
  { date: '2026-07-20', title: 'Bakti Sosial', type: 'pelayanan', desc: 'Program bakti sosial pelayanan kasih kepada masyarakat.' },
  { date: '2026-07-26', title: 'Ibadah Minggu', type: 'ibadah', desc: 'Ibadah penyembahan dan pemberitaan Firman Tuhan.' },
];

let calendarMonth = 5; // June (0-indexed)
let calendarYear = 2026;

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function initCalendar() {
  const prevBtn = document.getElementById('calPrev');
  const nextBtn = document.getElementById('calNext');

  if (prevBtn) prevBtn.addEventListener('click', () => changeMonth(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => changeMonth(1));

  renderCalendar();
}

function changeMonth(dir) {
  calendarMonth += dir;
  if (calendarMonth < 0) { calendarMonth = 11; calendarYear--; }
  if (calendarMonth > 11) { calendarMonth = 0; calendarYear++; }
  renderCalendar();
}

function renderCalendar() {
  const grid = document.getElementById('calendarGrid');
  const title = document.getElementById('calMonthTitle');
  if (!grid || !title) return;

  title.textContent = `${monthNames[calendarMonth]} ${calendarYear}`;
  grid.innerHTML = '';

  // Day headers
  dayNames.forEach(day => {
    const headerCell = document.createElement('div');
    headerCell.className = 'cal-header-cell';
    headerCell.textContent = day;
    grid.appendChild(headerCell);
  });

  const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(calendarYear, calendarMonth, 0).getDate();
  const today = new Date();

  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    const cell = createCalCell(daysInPrevMonth - i, true);
    grid.appendChild(cell);
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = today.getDate() === d && today.getMonth() === calendarMonth && today.getFullYear() === calendarYear;
    const events = calendarEvents.filter(e => e.date === dateStr);
    const cell = createCalCell(d, false, isToday, events);
    grid.appendChild(cell);
  }

  // Next month days
  const totalCells = grid.children.length;
  const remaining = 42 - totalCells; // 6 rows
  for (let i = 1; i <= remaining; i++) {
    // Only add if needed to complete the grid to at least 5 rows
    if (totalCells + i > 42) break;
    const cell = createCalCell(i, true);
    grid.appendChild(cell);
  }
}

function createCalCell(day, isOtherMonth, isToday = false, events = []) {
  const cell = document.createElement('div');
  cell.className = 'cal-cell';
  if (isOtherMonth) cell.classList.add('other-month');
  if (isToday) cell.classList.add('today');

  let html = `<div class="cal-day">${day}</div>`;

  events.forEach(event => {
    html += `<div class="cal-event cal-event-${event.type}" onclick="openCalendarEvent(event, '${event.title}', '${event.date}', '${event.desc}')">${event.title}</div>`;
  });

  cell.innerHTML = html;
  return cell;
}

function openCalendarEvent(e, title, date, desc) {
  e.stopPropagation();
  const modal = document.getElementById('calendarModal');
  const body = document.getElementById('calendarModalBody');

  const dateObj = new Date(date);
  const formattedDate = `${dateObj.getDate()} ${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

  body.innerHTML = `
    <h2>${title}</h2>
    <div class="modal-date">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      ${formattedDate}
    </div>
    <p>${desc}</p>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCalendarModal() {
  document.getElementById('calendarModal').classList.remove('active');
  document.body.style.overflow = '';
}

/* ═══════════════════════════════════════════════════════════════
   GALLERY & LIGHTBOX
   ═══════════════════════════════════════════════════════════════ */
const galleryData = [
  {
    title: 'Ibadah Minggu',
    desc: 'Suasana ibadah penyembahan bersama seluruh jemaat Gereja AMIN Hermon.',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    title: 'Retreat Pemuda',
    desc: 'Kebersamaan pemuda-remaja dalam acara retreat tahunan yang penuh berkat.',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    title: 'Pelayanan Diakonia',
    desc: 'Bakti sosial dan pelayanan kasih kepada masyarakat sekitar.',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    title: 'Sekolah Minggu',
    desc: 'Anak-anak belajar Firman Tuhan dengan penuh sukacita dan kreativitas.',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  {
    title: 'Perayaan Natal',
    desc: 'Malam Natal penuh sukacita bersama seluruh jemaat dan keluarga.',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  },
  {
    title: 'Paduan Suara',
    desc: 'Pelayanan pujian dari tim paduan suara gereja yang memberkati.',
    gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'
  }
];

let currentLightbox = 0;

function filterGallery(category) {
  const items = document.querySelectorAll('.gallery-item');
  const buttons = document.querySelectorAll('.filter-btn');

  buttons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === category);
  });

  items.forEach(item => {
    if (category === 'all' || item.dataset.category === category) {
      item.classList.remove('hidden');
      item.style.animation = 'fadeUp 0.5s var(--ease) forwards';
    } else {
      item.classList.add('hidden');
    }
  });
}

function openLightbox(index) {
  currentLightbox = index;
  updateLightbox();
  document.getElementById('lightboxModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightboxModal').classList.remove('active');
  document.body.style.overflow = '';
}

function navigateLightbox(dir) {
  currentLightbox = (currentLightbox + dir + galleryData.length) % galleryData.length;
  updateLightbox();
}

function updateLightbox() {
  const content = document.getElementById('lightboxContent');
  const caption = document.getElementById('lightboxCaption');
  const item = galleryData[currentLightbox];

  content.innerHTML = `<div class="lightbox-image" style="background: ${item.gradient};">
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.5">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  </div>`;

  caption.innerHTML = `<h3>${item.title}</h3><p>${item.desc}</p>`;
}

// Keyboard nav for lightbox
document.addEventListener('keydown', (e) => {
  const lightbox = document.getElementById('lightboxModal');
  if (!lightbox.classList.contains('active')) return;

  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') navigateLightbox(-1);
  if (e.key === 'ArrowRight') navigateLightbox(1);
});

/* ═══════════════════════════════════════════════════════════════
   FAQ ACCORDION
   ═══════════════════════════════════════════════════════════════ */
function toggleFaq(button) {
  const item = button.parentElement;
  const isOpen = item.classList.contains('open');

  // Close all
  document.querySelectorAll('.faq-item').forEach(faq => faq.classList.remove('open'));

  // Toggle current
  if (!isOpen) {
    item.classList.add('open');
  }
}

/* ═══════════════════════════════════════════════════════════════
   BACK TO TOP
   ═══════════════════════════════════════════════════════════════ */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 600);
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ═══════════════════════════════════════════════════════════════
   MODAL CLOSE ON OVERLAY CLICK
   ═══════════════════════════════════════════════════════════════ */
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
});

document.getElementById('lightboxModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'lightboxModal') {
    closeLightbox();
  }
});

// Close modals with Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(modal => {
      modal.classList.remove('active');
    });
    closeLightbox();
    document.body.style.overflow = '';
  }
});
