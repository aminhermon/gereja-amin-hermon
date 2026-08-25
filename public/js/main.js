/* =========================================
   GEREJA AMIN HERMON — Main JavaScript
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      offset: 100
    });
  }
  initRegistrationForm();
  initGallery();
  initSmoothScroll();
  setActiveNavLink();
  initGlobalLightbox();
  initVisitorCounter();
  initSwiper();
  initNewsSwiper();
  initStatsCounter();
  initFaqAccordion();
  initKomsekDropdown();
  initBackToTop();
  initDailyVerse();
  initRenunganFeatures();
});

/* ---------- Navbar Dropdowns (Mobile toggle) ---------- */
function initKomsekDropdown() {
  const dropdowns = document.querySelectorAll('.navbar__dropdown');
  if (!dropdowns.length) return;

  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.navbar__dropdown-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.innerWidth <= 768) {
        // Close other dropdowns
        dropdowns.forEach(d => { if (d !== dropdown) d.classList.remove('mobile-open'); });
        dropdown.classList.toggle('mobile-open');
      }
    });
  });

  // Close all dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar__dropdown')) {
      dropdowns.forEach(d => d.classList.remove('mobile-open'));
    }
  });
}

/* ---------- Lundev Carousel ---------- */
function initNewsSwiper() {
  const carousel = document.querySelector('.carousel');
  if (!carousel) return;

  const list   = carousel.querySelector('.carousel__list');
  const thumbs = carousel.querySelector('.carousel__thumbs');
  const nextBtn = document.getElementById('carouselNext');
  const prevBtn = document.getElementById('carouselPrev');

  if (!list || !thumbs || !nextBtn || !prevBtn) return;

  const ANIM_TIME = 500;   // matches CSS animation duration
  const AUTO_TIME = 3000;  // autoplay 3 seconds

  let animTimeout;
  let autoTimeout;

  function showSlider(direction) {
    const items  = list.querySelectorAll('.carousel__item');
    const tItems = thumbs.querySelectorAll('.carousel__thumb');

    if (direction === 'next') {
      list.appendChild(items[0]);
      thumbs.appendChild(tItems[0]);
      carousel.classList.add('next');
    } else {
      list.prepend(items[items.length - 1]);
      thumbs.prepend(tItems[tItems.length - 1]);
      carousel.classList.add('prev');
    }

    clearTimeout(animTimeout);
    animTimeout = setTimeout(() => {
      carousel.classList.remove('next', 'prev');
    }, ANIM_TIME);

    resetAutoplay();
  }

  function resetAutoplay() {
    clearTimeout(autoTimeout);
    autoTimeout = setTimeout(() => showSlider('next'), AUTO_TIME);
  }

  nextBtn.addEventListener('click', () => showSlider('next'));
  prevBtn.addEventListener('click', () => showSlider('prev'));

  // Start autoplay
  resetAutoplay();
}

/* ---------- Stats Counter Animation ---------- */
function initStatsCounter() {
  const counters = document.querySelectorAll('.stat-card__number');
  if (!counters.length) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target'), 10);
        if (isNaN(target)) return;
        
        let current = 0;
        const duration = 2000;
        const step = target / (duration / 16);
        
        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            el.textContent = target;
            clearInterval(timer);
          } else {
            el.textContent = Math.floor(current);
          }
        }, 16);
        
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.3 });
  
  counters.forEach(c => observer.observe(c));
}

/* ---------- FAQ Accordion ---------- */
function initFaqAccordion() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const wasOpen = item.classList.contains('open');
      
      // Close all
      document.querySelectorAll('.faq-item').forEach(fi => fi.classList.remove('open'));
      document.querySelectorAll('.faq-question').forEach(fq => fq.setAttribute('aria-expanded', 'false'));
      
      if (!wasOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}


/* ---------- Swiper Slider ---------- */
function initSwiper() {
  if (typeof Swiper !== 'undefined' && document.querySelector('.hero-swiper')) {
    new Swiper('.hero-swiper', {
      loop: true,
      effect: 'fade',
      fadeEffect: {
        crossFade: true
      },
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });
  }
}

/* ---------- Navbar ---------- */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.navbar__hamburger');
  const menu = document.querySelector('.navbar__menu');

  // Scroll effect
  function handleScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Hamburger toggle
  if (hamburger && menu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      menu.classList.toggle('open');
      document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
    });

    // Close menu on link click
    menu.querySelectorAll('.navbar__link, .navbar__dropdown-item').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        menu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Mobile dropdown toggles
    menu.querySelectorAll('.navbar__dropdown-toggle').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          const dropdown = toggle.closest('.navbar__dropdown');
          dropdown.classList.toggle('mobile-open');
        }
      });
    });
  }
}

/* ---------- Active Nav Link ---------- */
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  // Check direct links
  document.querySelectorAll('.navbar__link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Check dropdown items
  document.querySelectorAll('.navbar__dropdown-item').forEach(item => {
    const href = item.getAttribute('href');
    if (href === currentPage) {
      item.classList.add('active');
      const dropdown = item.closest('.navbar__dropdown');
      if (dropdown) dropdown.classList.add('active');
    }
  });
}

/* ---------- Scroll Reveal ---------- */


/* ---------- FAQ Accordion ---------- */
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      faqItems.forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* ---------- Registration Form ---------- */
function initRegistrationForm() {
  const form = document.getElementById('registration-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    const requiredFields = ['reg-name', 'reg-whatsapp', 'reg-dob', 'reg-class'];
    let isValid = true;

    requiredFields.forEach(field => {
      const input = form.querySelector(`[name="${field}"]`);
      if (!data[field] || data[field].trim() === '') {
        isValid = false;
        input.style.borderColor = '#dc2626';
        input.addEventListener('input', () => { input.style.borderColor = ''; }, { once: true });
        input.addEventListener('change', () => { input.style.borderColor = ''; }, { once: true });
      }
    });

    if (!isValid) return;

    const formContainer = form.closest('.prayer-form');
    const successEl = formContainer.querySelector('.form-success');
    if (successEl) {
      form.style.display = 'none';
      successEl.classList.add('show');
    }

    const waNumber = '6281234567890';
    const waMessage = encodeURIComponent(
      `*Pendaftaran Kelas Baptisan/Sidi - Gereja AMIN Hermon*\n\n` +
      `Nama: ${data['reg-name']}\nWhatsApp: ${data['reg-whatsapp']}\n` +
      `Tanggal Lahir: ${data['reg-dob']}\nKelas: ${data['reg-class']}\n` +
      `Pesan: ${data['reg-message'] || '-'}`
    );

    setTimeout(() => {
      const openWA = confirm('Ingin mengirim pendaftaran ini juga via WhatsApp ke Sekretariat Gereja?');
      if (openWA) window.open(`https://wa.me/${waNumber}?text=${waMessage}`, '_blank');
    }, 1500);
  });
}

/* ---------- Gallery & Lightbox ---------- */
function initGallery() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  if (!lightbox || !galleryItems.length) return;

  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = lightbox.querySelector('.lightbox__close');
  const lightboxBackdrop = lightbox.querySelector('.lightbox__backdrop');

  function openLightbox(item) {
    const img = item.querySelector('img');
    const captionEl = item.querySelector('.gallery-item__overlay span');
    if (!img) return;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || '';
    if (lightboxCaption) lightboxCaption.textContent = captionEl ? captionEl.textContent : (img.alt || '');
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  galleryItems.forEach(item => {
    item.addEventListener('click', () => openLightbox(item));
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox();
  });
}

/* ---------- Smooth Scroll ---------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = document.querySelector('.navbar')?.offsetHeight || 80;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/* ---------- Utility: Lazy Load Images ---------- */
if ('IntersectionObserver' in window) {
  const imgObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        imgObserver.unobserve(img);
      }
    });
  });
  document.querySelectorAll('img[data-src]').forEach(img => imgObserver.observe(img));
}
/* ---------- Global Lightbox (For Non-Gallery Images) ---------- */
function initGlobalLightbox() {
  const images = document.querySelectorAll('.section img:not(.gallery-item img)');
  if (!images.length) return;
  
  const glb = document.createElement('div');
  glb.className = 'global-lightbox';
  glb.innerHTML = `
    <div class="global-lightbox__close">&times;</div>
    <img class="global-lightbox__img" src="" alt="Zoomed Image">
  `;
  document.body.appendChild(glb);
  
  const glbImg = glb.querySelector('.global-lightbox__img');
  const glbClose = glb.querySelector('.global-lightbox__close');
  
  images.forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      glbImg.src = img.src;
      glb.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });
  
  glbClose.addEventListener('click', () => {
    glb.classList.remove('open');
    document.body.style.overflow = '';
  });
  
  glb.addEventListener('click', (e) => {
    if (e.target !== glbImg) {
      glb.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && glb.classList.contains('open')) {
      glb.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

/* ---------- Visitor Counter ---------- */
function initVisitorCounter() {
  const footerBottom = document.querySelector('.footer__bottom');
  if (!footerBottom) return;
  
  // Use localStorage to simulate unique visits or returning visits counter
  let visits = localStorage.getItem('amin_hermon_visits');
  if (!visits) {
    // Starting offset for realistic look
    visits = 12450; 
  } else {
    visits = parseInt(visits, 10) + 1;
  }
  localStorage.setItem('amin_hermon_visits', visits);
  
  const counterSpan = document.createElement('span');
  counterSpan.className = 'visitor-counter';
  counterSpan.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; margin-right: 6px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> Kunjungan: ${visits.toLocaleString('id-ID')}`;
  
  footerBottom.appendChild(counterSpan);
}

/* ---------- Back to Top ---------- */
function initBackToTop() {
  const btn = document.getElementById('backToTopBtn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* ---------- Daily Verse & Interactive Renungan Suite ---------- */
const DAILY_VERSES = [
  { text: "Segala perkara dapat kutanggung di dalam Dia yang memberi kekuatan kepadaku.", ref: "Filipi 4:13" },
  { text: "Karena begitu besar kasih Allah akan dunia ini, sehingga Ia telah mengaruniakan Anak-Nya yang tunggal...", ref: "Yohanes 3:16" },
  { text: "Sebab Aku ini mengetahui rancangan-rancangan apa yang ada pada-Ku mengenai kamu, demikianlah firman TUHAN, yaitu rancangan damai sejahtera dan bukan rancangan kecelakaan, untuk memberikan kepadamu hari depan yang penuh harapan.", ref: "Yeremia 29:11" },
  { text: "Janganlah hendaknya kamu kuatir tentang apa pun juga, tetapi nyatakanlah dalam segala hal keinginanmu kepada Allah dalam doa dan permohonan dengan ucapan syukur.", ref: "Filipi 4:6" },
  { text: "Percayalah kepada TUHAN dengan segenap hatimu, dan janganlah bersandar kepada pengertianmu sendiri. Akuilah Dia dalam segala lakumu, maka Ia akan meluruskan jalanmu.", ref: "Amsal 3:5-6" },
  { text: "Marilah kepada-Ku, semua yang letih lesu dan berbeban berat, Aku akan memberi kelegaan kepadamu.", ref: "Matius 11:28" },
  { text: "Pencuri datang hanya untuk mencuri dan membunuh dan membinasakan; Aku datang, supaya mereka mempunyai hidup, dan mempunyainya dalam segala kelimpahan.", ref: "Yohanes 10:10" },
  { text: "Kita tahu sekarang, bahwa Allah turut bekerja dalam segala sesuatu untuk mendatangkan kebaikan bagi mereka yang mengasihi Dia.", ref: "Roma 8:28" },
  { text: "Tetapi orang-orang yang menanti-nantikan TUHAN mendapat kekuatan baru: mereka seumpama rajawali yang naik terbang dengan kekuatan sayapnya.", ref: "Yesaya 40:31" },
  { text: "Firman-Mu itu pelita bagi kakiku dan terang bagi jalanku.", ref: "Mazmur 119:105" },
  { text: "Kasih itu sabar; kasih itu murah hati; ia tidak cemburu. Ia tidak memegahkan diri dan tidak sombong.", ref: "1 Korintus 13:4" },
  { text: "Janganlah kamu menjadi hamba uang dan cukupkanlah dirimu dengan apa yang ada padamu. Karena Allah telah berfirman: 'Aku sekali-kali tidak akan membiarkan engkau dan Aku sekali-kali tidak akan meninggalkan engkau.'", ref: "Ibrani 13:5" },
  { text: "Serahkanlah kuatirmu kepada TUHAN, maka Ia akan memelihara engkau! Tidak untuk selama-lamanya dibiarkannya orang benar itu goyah.", ref: "Mazmur 55:22" },
  { text: "Bersukacitalah senantiasa. Tetaplah berdoa. Mengucap syukurlah dalam segala hal, sebab itulah yang dikehendaki Allah di dalam Kristus Yesus bagi kamu.", ref: "1 Tesalonika 5:16-18" },
  { text: "Sebab karena kasih karunia kamu diselamatkan oleh iman; itu bukan hasil usahamu, tetapi pemberian Allah.", ref: "Efesus 2:8" },
  { text: "Dan inilah keberanian percaya kita kepada-Nya, yaitu bahwa Ia mengabulkan doa kita, jikalau kita meminta sesuatu kepada-Nya menurut kehendak-Nya.", ref: "1 Yohanes 5:14" },
  { text: "Tetapi carilah dahulu Kerajaan Allah dan kebenarannya, maka semuanya itu akan ditambahkan kepadamu.", ref: "Matius 6:33" },
  { text: "Aku memberikan perintah baru kepada kamu, yaitu supaya kamu saling mengasihi; sama seperti Aku telah mengasihi kamu demikian pula kamu harus saling mengasihi.", ref: "Yohanes 13:34" },
  { text: "Hendaklah kamu murah hati, sama seperti Bapamu adalah murah hati.", ref: "Lukas 6:36" },
  { text: "TUHAN adalah gembalaku, takkan kekurangan aku. Ia membaringkan aku di padang yang berumput hijau, Ia membimbing aku ke air yang tenang.", ref: "Mazmur 23:1-2" },
  { text: "Hendaklah kata-katamu senantiasa penuh kasih, jangan hambar, sehingga kamu tahu, bagaimana kamu harus memberi jawab kepada setiap orang.", ref: "Kolose 4:6" },
  { text: "Berbahagialah orang yang membawa damai, karena mereka akan disebut anak-anak Allah.", ref: "Matius 5:9" },
  { text: "Apa pun juga yang kamu perbuat, perbuatlah dengan segenap hatimu seperti untuk Tuhan dan bukan untuk manusia.", ref: "Kolose 3:23" },
  { text: "Sebab Allah memberikan kepada kita bukan roh ketakutan, melainkan roh yang membangkitkan kekuatan, kasih dan ketertiban.", ref: "2 Timotius 1:7" },
  { text: "Lebih baik sepiring sayur dengan kasih dari pada lembu tambun dengan kebencian.", ref: "Amsal 15:17" },
  { text: "Karena itu rendahkanlah dirimu di bawah tangan Tuhan yang kuat, supaya kamu ditinggikan-Nya pada waktunya.", ref: "1 Petrus 5:6" },
  { text: "Mintalah, maka akan diberikan kepadamu; carilah, maka kamu akan mendapat; ketoklah, maka pintu akan dibukakan bagimu.", ref: "Matius 7:7" },
  { text: "Jika kita mengaku dosa kita, maka Ia adalah setia dan adil, sehingga Ia akan mengampuni segala dosa kita dan menyucikan kita dari segala kejahatan.", ref: "1 Yohanes 1:9" },
  { text: "Damai sejahtera Kutinggalkan bagimu. Damai sejahtera-Ku Kuberikan kepadamu, dan apa yang Kuberikan tidak seperti yang diberikan oleh dunia kepadamu.", ref: "Yohanes 14:27" },
  { text: "Segala tulisan yang diilhamkan Allah memang bermanfaat untuk mengajar, untuk menyatakan kesalahan, untuk memperbaiki kelakuan dan untuk mendidik orang dalam kebenaran.", ref: "2 Timotius 3:16" },
  { text: "Sebab upah dosa ialah maut; tetapi karunia Allah ialah hidup yang kekal dalam Kristus Yesus, Tuhan kita.", ref: "Roma 6:23" }
];

let currentVerseIdx = 0;
let currentActiveRenungan = null;
let isSpeakingRenungan = false;
let isSpeakingVerse = false;

function initDailyVerse() {
  const verseText = document.getElementById('daily-verse-text');
  const verseRef = document.getElementById('daily-verse-ref');
  if (!verseText || !verseRef) return;

  const today = new Date();
  currentVerseIdx = (today.getDate() - 1) % DAILY_VERSES.length;
  updateVerseDisplay(currentVerseIdx);
}

function updateVerseDisplay(idx) {
  const verseText = document.getElementById('daily-verse-text');
  const verseRef = document.getElementById('daily-verse-ref');
  if (!verseText || !verseRef) return;

  const item = DAILY_VERSES[idx];
  verseText.style.opacity = '0';
  verseText.style.transform = 'translateY(8px)';
  setTimeout(() => {
    verseText.innerText = `"${item.text}"`;
    verseRef.innerText = item.ref;
    verseText.style.opacity = '1';
    verseText.style.transform = 'translateY(0)';
  }, 200);
}

function shuffleDailyVerse() {
  let nextIdx;
  do {
    nextIdx = Math.floor(Math.random() * DAILY_VERSES.length);
  } while (nextIdx === currentVerseIdx && DAILY_VERSES.length > 1);
  currentVerseIdx = nextIdx;
  updateVerseDisplay(currentVerseIdx);
  showRenunganToast("📖 Firman berganti: " + DAILY_VERSES[currentVerseIdx].ref);
}

function speakCurrentVerse() {
  if (!('speechSynthesis' in window)) {
    showRenunganToast("Fitur audio tidak didukung di peramban ini.");
    return;
  }

  const btn = document.getElementById('btnSpeakVerse');
  if (isSpeakingVerse) {
    window.speechSynthesis.cancel();
    isSpeakingVerse = false;
    if (btn) btn.innerHTML = '🔊 Dengarkan';
    return;
  }

  window.speechSynthesis.cancel();
  const item = DAILY_VERSES[currentVerseIdx];
  const speechText = item.text + ". Bacaan dari " + item.ref;
  const utter = new SpeechSynthesisUtterance(speechText);
  utter.lang = 'id-ID';
  utter.rate = 0.95;

  const voices = window.speechSynthesis.getVoices();
  const idVoice = voices.find(v => v.lang && v.lang.startsWith('id'));
  if (idVoice) utter.voice = idVoice;

  utter.onstart = () => {
    isSpeakingVerse = true;
    if (btn) btn.innerHTML = '⏹️ Berhenti';
  };

  utter.onend = utter.onerror = () => {
    isSpeakingVerse = false;
    if (btn) btn.innerHTML = '🔊 Dengarkan';
  };

  window.speechSynthesis.speak(utter);
}

function shareVerseWhatsApp() {
  const item = DAILY_VERSES[currentVerseIdx];
  const churchUrl = window.location.origin;
  const text = `*Mutiara Firman Hari Ini — Gereja AMIN Hermon*\n\n"${item.text}"\n\n📖 *${item.ref}*\n\nMari bertumbuh bersama dalam firman Tuhan:\n${churchUrl}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function copyCurrentVerse() {
  const item = DAILY_VERSES[currentVerseIdx];
  const text = `"${item.text}" — ${item.ref} (Gereja AMIN Hermon)`;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showRenunganToast("📋 Ayat firman berhasil disalin ke clipboard!");
    }).catch(() => {
      showRenunganToast("Ayat: " + item.ref);
    });
  } else {
    showRenunganToast("Ayat: " + item.ref);
  }
}

/* ---------- Interactive Renungan Modal & Features ---------- */
function initRenunganFeatures() {
  // Load saved preferences
  const savedSize = localStorage.getItem('renungan_fontsize') || 'md';
  setRenunganFontSize(savedSize, false);

  const savedTheme = localStorage.getItem('renungan_theme') || 'dark';
  setRenunganTheme(savedTheme, false);

  // Keyboard escape listener
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeRenunganModal();
    }
  });
}

function openTodayRenunganModal(e) {
  if (e) e.preventDefault();
  const list = window.rawRenunganList || [];
  if (list && list.length > 0) {
    // Pick the most recent renungan
    const sorted = list.slice().sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    openRenunganModal(sorted[0].id);
  } else {
    // Fallback: create dynamic devotional from today's daily verse
    const verse = DAILY_VERSES[currentVerseIdx];
    const fallbackObj = {
      id: 'today_auto',
      judul: 'Renungan: ' + verse.ref,
      tanggal: new Date().toISOString().split('T')[0],
      ayat: verse.ref,
      isi: verse.text + '\n\nMarilah kita merenungkan kebenaran firman ini sepanjang hari. Firman Tuhan adalah pelita bagi kaki kita dan terang bagi jalan kita. Jadikanlah firman ini kekuatan dalam setiap keputusan, pekerjaan, dan pelayanan kita hari ini.'
    };
    openRenunganModal(fallbackObj);
  }
}

function openRenunganModal(idOrObj, autoPlayAudio) {
  let item = null;
  if (typeof idOrObj === 'object') {
    item = idOrObj;
  } else {
    const list = window.rawRenunganList || [];
    item = list.find(r => String(r.id) === String(idOrObj));
  }

  if (!item) return;
  currentActiveRenungan = item;

  const modal = document.getElementById('renunganModal');
  if (!modal) return;

  const titleEl = document.getElementById('renunganModalTitle');
  const dateEl = document.getElementById('renunganModalDate');
  const refEl = document.getElementById('renunganModalRef');
  const verseTextEl = document.getElementById('renunganModalVerseText');
  const verseRefEl = document.getElementById('renunganModalVerseRef');
  const contentEl = document.getElementById('renunganModalContent');

  if (titleEl) titleEl.textContent = item.judul;
  if (dateEl) {
    try {
      dateEl.textContent = '🗓️ ' + new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } catch(e) {
      dateEl.textContent = '🗓️ ' + item.tanggal;
    }
  }
  if (refEl) refEl.textContent = '📖 ' + (item.ayat || '-');
  if (verseTextEl) verseTextEl.textContent = `"${item.ayat}"`;
  if (verseRefEl) verseRefEl.textContent = item.ayat;
  if (contentEl) contentEl.textContent = item.isi;

  // Load reactions for this devotional
  loadRenunganReactions(item.id);

  // Load saved personal note
  const noteInput = document.getElementById('renunganNoteInput');
  const statusEl = document.getElementById('notepadStatus');
  if (noteInput) {
    const savedNote = localStorage.getItem('renungan_note_' + item.id) || '';
    noteInput.value = savedNote;
  }
  if (statusEl) statusEl.classList.remove('show');

  // Open modal
  modal.style.display = 'flex';
  void modal.offsetHeight;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Stop any previous speech
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    isSpeakingRenungan = false;
    updateAudioBtnState(false);
  }

  if (autoPlayAudio) {
    setTimeout(() => {
      toggleRenunganAudio();
    }, 400);
  }
}

function closeRenunganModal() {
  const modal = document.getElementById('renunganModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      if (!modal.classList.contains('active')) modal.style.display = 'none';
    }, 300);
  }
  document.body.style.overflow = '';
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    isSpeakingRenungan = false;
    updateAudioBtnState(false);
  }
}

function toggleRenunganAudio() {
  if (!('speechSynthesis' in window)) {
    showRenunganToast("Fitur audio tidak didukung di peramban ini.");
    return;
  }

  if (isSpeakingRenungan) {
    window.speechSynthesis.cancel();
    isSpeakingRenungan = false;
    updateAudioBtnState(false);
    return;
  }

  if (!currentActiveRenungan) return;

  window.speechSynthesis.cancel();
  const textToRead = `Renungan Harian Gereja AMIN Hermon. Judul: ${currentActiveRenungan.judul}. Bacaan Firman: ${currentActiveRenungan.ayat}. ${currentActiveRenungan.isi}. Mari kita berdoa: Tuhan Yesus, mampukan kami untuk menghidupi firman-Mu setiap hari. Amin.`;
  
  const utter = new SpeechSynthesisUtterance(textToRead);
  utter.lang = 'id-ID';
  utter.rate = 0.95;

  const voices = window.speechSynthesis.getVoices();
  const idVoice = voices.find(v => v.lang && v.lang.startsWith('id'));
  if (idVoice) utter.voice = idVoice;

  utter.onstart = () => {
    isSpeakingRenungan = true;
    updateAudioBtnState(true);
  };

  utter.onend = utter.onerror = () => {
    isSpeakingRenungan = false;
    updateAudioBtnState(false);
  };

  window.speechSynthesis.speak(utter);
}

function updateAudioBtnState(playing) {
  const btn = document.getElementById('btnTtsPlay');
  const icon = document.getElementById('ttsIcon');
  const label = document.getElementById('ttsLabel');
  const wave = document.getElementById('ttsWave');

  if (playing) {
    if (icon) icon.textContent = '⏹️';
    if (label) label.textContent = 'Jeda';
    if (wave) wave.style.display = 'inline-flex';
    if (btn) btn.classList.add('active');
  } else {
    if (icon) icon.textContent = '▶️';
    if (label) label.textContent = 'Dengarkan';
    if (wave) wave.style.display = 'none';
    if (btn) btn.classList.remove('active');
  }
}

function setRenunganFontSize(size, notify) {
  const modal = document.getElementById('renunganModal');
  if (modal) modal.setAttribute('data-fontsize', size);

  ['btnFontSm', 'btnFontMd', 'btnFontLg'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.classList.remove('active');
  });

  const activeBtn = document.getElementById('btnFont' + size.charAt(0).toUpperCase() + size.slice(1));
  if (activeBtn) activeBtn.classList.add('active');

  localStorage.setItem('renungan_fontsize', size);
  if (notify) showRenunganToast("Ukuran teks disetel ke " + (size === 'sm' ? 'Kecil' : size === 'lg' ? 'Besar' : 'Sedang'));
}

function setRenunganTheme(theme, notify) {
  const modal = document.getElementById('renunganModal');
  if (modal) modal.setAttribute('data-theme', theme);

  ['btnThemeDark', 'btnThemeSepia', 'btnThemeLight'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.classList.remove('active');
  });

  const activeBtn = document.getElementById('btnTheme' + theme.charAt(0).toUpperCase() + theme.slice(1));
  if (activeBtn) activeBtn.classList.add('active');

  localStorage.setItem('renungan_theme', theme);
  if (notify) showRenunganToast("Tema disetel ke " + (theme === 'sepia' ? 'Mode Kertas Sepia' : theme === 'light' ? 'Mode Terang' : 'Mode Gelap'));
}

function loadRenunganReactions(id) {
  const types = ['amin', 'diberkati', 'menguatkan', 'bersyukur'];
  types.forEach(t => {
    const key = `renungan_react_${id}_${t}`;
    const hasReacted = localStorage.getItem(key) === 'true';
    const countKey = `renungan_cnt_${id}_${t}`;
    const baseCount = parseInt(localStorage.getItem(countKey) || (t === 'amin' ? 12 : t === 'diberkati' ? 8 : 5), 10);

    const countEl = document.getElementById('count_' + t);
    if (countEl) countEl.textContent = baseCount;

    const btn = document.querySelector(`.renungan-react-btn[data-type="${t}"]`);
    if (btn) {
      if (hasReacted) btn.classList.add('reacted');
      else btn.classList.remove('reacted');
    }
  });
}

function handleRenunganReaction(type) {
  if (!currentActiveRenungan) return;
  const id = currentActiveRenungan.id;
  const key = `renungan_react_${id}_${type}`;
  const countKey = `renungan_cnt_${id}_${type}`;
  
  const hasReacted = localStorage.getItem(key) === 'true';
  const countEl = document.getElementById('count_' + type);
  let count = parseInt(countEl ? countEl.textContent : 10, 10);

  const btn = document.querySelector(`.renungan-react-btn[data-type="${type}"]`);

  if (hasReacted) {
    localStorage.setItem(key, 'false');
    count = Math.max(0, count - 1);
    if (btn) btn.classList.remove('reacted');
  } else {
    localStorage.setItem(key, 'true');
    count += 1;
    if (btn) btn.classList.add('reacted');
    showRenunganToast("🙏 Terima kasih! Anda merespon '" + type.charAt(0).toUpperCase() + type.slice(1) + "'");
  }

  localStorage.setItem(countKey, count);
  if (countEl) countEl.textContent = count;
}

let noteSaveTimeout = null;
function saveRenunganPersonalNote() {
  if (!currentActiveRenungan) return;
  const id = currentActiveRenungan.id;
  const input = document.getElementById('renunganNoteInput');
  const statusEl = document.getElementById('notepadStatus');
  if (!input) return;

  localStorage.setItem('renungan_note_' + id, input.value);
  if (statusEl) {
    statusEl.classList.add('show');
    clearTimeout(noteSaveTimeout);
    noteSaveTimeout = setTimeout(() => {
      statusEl.classList.remove('show');
    }, 2500);
  }
}

function shareRenunganWhatsApp() {
  if (!currentActiveRenungan) return;
  const item = currentActiveRenungan;
  const url = window.location.origin + '/media.html#renungan';
  const text = `*Renungan Harian Gereja AMIN Hermon*\n\n*${item.judul}*\n📖 ${item.ayat}\n\n"${item.isi.substring(0, 200)}..."\n\nBaca selengkapnya di website:\n${url}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function shareRenunganDirect(id) {
  const list = window.rawRenunganList || [];
  const item = list.find(r => String(r.id) === String(id));
  if (!item) return;
  const url = window.location.origin + '/media.html#renungan';
  const text = `*Renungan Harian Gereja AMIN Hermon*\n\n*${item.judul}*\n📖 ${item.ayat}\n\n"${item.isi.substring(0, 180)}..."\n\nBaca selengkapnya di website:\n${url}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function copyRenunganText() {
  if (!currentActiveRenungan) return;
  const item = currentActiveRenungan;
  const text = `${item.judul}\nAyat: ${item.ayat}\n\n${item.isi}\n\n— Renungan Harian Gereja AMIN Hermon`;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showRenunganToast("📋 Renungan lengkap berhasil disalin ke clipboard!");
    }).catch(() => {
      showRenunganToast("Renungan: " + item.judul);
    });
  } else {
    showRenunganToast("Renungan: " + item.judul);
  }
}

function filterRenunganCards() {
  const input = document.getElementById('renunganSearchInput');
  const grid = document.getElementById('renunganGrid');
  const noResult = document.getElementById('renunganNoResult');
  if (!input || !grid) return;

  const query = input.value.toLowerCase().trim();
  const cards = grid.querySelectorAll('.renungan-card-rich');
  let matchCount = 0;

  cards.forEach(card => {
    const title = card.getAttribute('data-title') || '';
    const ayat = card.getAttribute('data-ayat') || '';
    const isi = card.getAttribute('data-isi') || '';

    if (!query || title.includes(query) || ayat.includes(query) || isi.includes(query)) {
      card.style.display = 'flex';
      matchCount++;
    } else {
      card.style.display = 'none';
    }
  });

  if (noResult) {
    noResult.style.display = matchCount === 0 ? 'block' : 'none';
  }
}

let toastTimeout = null;
function showRenunganToast(msg) {
  let toast = document.getElementById('renunganToast');
  let msgEl = document.getElementById('renunganToastMsg');
  if (!toast) return;

  if (msgEl) msgEl.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

// Global window exposure
window.shuffleDailyVerse = shuffleDailyVerse;
window.speakCurrentVerse = speakCurrentVerse;
window.shareVerseWhatsApp = shareVerseWhatsApp;
window.copyCurrentVerse = copyCurrentVerse;
window.openTodayRenunganModal = openTodayRenunganModal;
window.openRenunganModal = openRenunganModal;
window.closeRenunganModal = closeRenunganModal;
window.toggleRenunganAudio = toggleRenunganAudio;
window.setRenunganFontSize = setRenunganFontSize;
window.setRenunganTheme = setRenunganTheme;
window.handleRenunganReaction = handleRenunganReaction;
window.saveRenunganPersonalNote = saveRenunganPersonalNote;
window.shareRenunganWhatsApp = shareRenunganWhatsApp;
window.shareRenunganDirect = shareRenunganDirect;
window.copyRenunganText = copyRenunganText;
window.filterRenunganCards = filterRenunganCards;
window.showRenunganToast = showRenunganToast;

/* ---------- Stats Counter Animation ---------- */
function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-card-premium__number, .stat-card__number');
  if (!statNumbers.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target'), 10) || 0;
        animateNumber(el, target);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.2 });

  statNumbers.forEach(num => observer.observe(num));

  function animateNumber(el, target) {
    if (target === 0) {
      el.textContent = '0';
      return;
    }
    const duration = 1500;
    const start = 0;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * ease);
      el.textContent = current.toLocaleString('id-ID');

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toLocaleString('id-ID');
      }
    }
    requestAnimationFrame(update);
  }
}
