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
  initFloatingEventBanner();
  initAdvenNatal();
});

/* ---------- Navbar Dropdowns (Mobile & Desktop toggle) ---------- */
function initKomsekDropdown() {
  const dropdowns = document.querySelectorAll('.navbar__dropdown');
  if (!dropdowns.length) return;

  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.navbar__dropdown-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isMobile = window.innerWidth <= 992;
      if (isMobile) {
        const isOpen = dropdown.classList.contains('mobile-open');
        // Close other dropdowns
        dropdowns.forEach(d => {
          if (d !== dropdown) {
            d.classList.remove('mobile-open');
            const otherToggle = d.querySelector('.navbar__dropdown-toggle');
            if (otherToggle) otherToggle.setAttribute('aria-expanded', 'false');
          }
        });

        dropdown.classList.toggle('mobile-open', !isOpen);
        toggle.setAttribute('aria-expanded', String(!isOpen));
      }
    });
  });

  // Close all dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar__dropdown')) {
      dropdowns.forEach(d => {
        d.classList.remove('mobile-open');
        const toggle = d.querySelector('.navbar__dropdown-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      });
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
  const progress = carousel.querySelector('.carousel__progress');

  if (!list || !thumbs || !nextBtn || !prevBtn) return;

  const ANIM_TIME = 500;   // matches CSS animation duration
  const AUTO_TIME = 5000;  // autoplay 5 seconds

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
    if (progress) {
      progress.style.animation = 'none';
      void progress.offsetWidth; // trigger reflow to restart CSS animation
      progress.style.animation = `carouselProgress ${AUTO_TIME}ms linear forwards`;
    }
    autoTimeout = setTimeout(() => showSlider('next'), AUTO_TIME);
  }

  nextBtn.addEventListener('click', () => showSlider('next'));
  prevBtn.addEventListener('click', () => showSlider('prev'));

  // Start autoplay
  resetAutoplay();
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

    // Close menu when clicking actual navigation anchor links
    menu.querySelectorAll('a.navbar__link, a.navbar__dropdown-item').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        menu.classList.remove('open');
        document.body.style.overflow = '';
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

/* ---------- Real-Time Visitor Counter ---------- */
function initVisitorCounter() {
  const onlineEl = document.getElementById('visitorOnline');
  const totalEl = document.getElementById('visitorTotal');
  if (!onlineEl && !totalEl) return;

  function fetchVisitors() {
    fetch('/api/visitors')
      .then(r => r.json())
      .then(data => {
        if (onlineEl && typeof data.online === 'number') {
          onlineEl.textContent = data.online.toLocaleString('id-ID');
        }
        if (totalEl && typeof data.total === 'number') {
          totalEl.textContent = data.total.toLocaleString('id-ID');
        }
      })
      .catch(() => {});
  }

  fetchVisitors();
  setInterval(fetchVisitors, 30000);
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

/* ---------- Daily Verse (Ayat Hari Ini Otomatis) ---------- */
function initDailyVerse() {
  const card = document.querySelector('.renungan-otomatis-card');
  if (card && card.getAttribute('data-custom-verse') === 'true') return;
  const verseText = document.getElementById('daily-verse-text');
  const verseRef = document.getElementById('daily-verse-ref');
  if (!verseText || !verseRef) return;

  const verses = [
    { text: "Segala perkara dapat kutanggung di dalam Dia yang memberi kekuatan kepadaku.", ref: "Filipi 4:13" },
    { text: "Karena begitu besar kasih Allah akan dunia ini, sehingga Ia telah mengaruniakan Anak-Nya yang tunggal, supaya setiap orang yang percaya kepada-Nya tidak binasa, melainkan beroleh hidup yang kekal.", ref: "Yohanes 3:16" },
    { text: "Sebab Aku ini mengetahui rancangan-rancangan apa yang ada pada-Ku mengenai kamu, demikianlah firman TUHAN, yaitu rancangan damai sejahtera dan bukan rancangan kecelakaan, untuk memberikan kepadamu hari depan yang penuh harapan.", ref: "Yeremia 29:11" },
    { text: "Janganlah hendaknya kamu kuatir tentang apa pun juga, tetapi nyatakanlah dalam segala hal keinginanmu kepada Allah dalam doa dan permohonan dengan ucapan syukur.", ref: "Filipi 4:6" },
    { text: "Percayalah kepada TUHAN dengan segenap hatimu, dan janganlah bersandar kepada pengertianmu sendiri. Akuilah Dia dalam segala lakumu, maka Ia akan meluruskan jalanmu.", ref: "Amsal 3:5-6" },
    { text: "Marilah kepada-Ku, semua yang letih lesu dan berbeban berat, Aku akan memberi kelegaan kepadamu.", ref: "Matius 11:28" },
    { text: "Pencuri datang hanya untuk mencuri dan membunuh dan membinasakan; Aku datang, supaya mereka mempunyai hidup, dan mempunyainya dalam segala kelimpahan.", ref: "Yohanes 10:10" },
    { text: "Kita tahu sekarang, bahwa Allah turut bekerja dalam segala sesuatu untuk mendatangkan kebaikan bagi mereka yang mengasihi Dia, yaitu bagi mereka yang terpanggil sesuai dengan rencana Allah.", ref: "Roma 8:28" },
    { text: "Tetapi orang-orang yang menanti-nantikan TUHAN mendapat kekuatan baru: mereka seumpama rajawali yang naik terbang dengan kekuatan sayapnya; mereka berlari dan tidak menjadi lesu, mereka berjalan dan tidak menjadi lelah.", ref: "Yesaya 40:31" },
    { text: "Firman-Mu itu pelita bagi kakiku dan terang bagi jalanku.", ref: "Mazmur 119:105" },
    { text: "Kasih itu sabar; kasih itu murah hati; ia tidak cemburu. Ia tidak memegahkan diri dan tidak sombong.", ref: "1 Korintus 13:4" },
    { text: "Serahkanlah kuatirmu kepada TUHAN, maka Ia akan memelihara engkau! Tidak untuk selama-lamanya dibiarkannya orang benar itu goyah.", ref: "Mazmur 55:22" },
    { text: "Bersukacitalah senantiasa. Tetaplah berdoa. Mengucap syukurlah dalam segala hal, sebab itulah yang dikehendaki Allah di dalam Kristus Yesus bagi kamu.", ref: "1 Tesalonika 5:16-18" },
    { text: "Sebab karena kasih karunia kamu diselamatkan oleh iman; itu bukan hasil usahamu, tetapi pemberian Allah, itu bukan hasil pekerjaanmu: jangan ada orang yang memegahkan diri.", ref: "Efesus 2:8-9" },
    { text: "Tetapi carilah dahulu Kerajaan Allah dan kebenarannya, maka semuanya itu akan ditambahkan kepadamu.", ref: "Matius 6:33" },
    { text: "TUHAN adalah gembalaku, takkan kekurangan aku. Ia membaringkan aku di padang yang berumput hijau, Ia membimbing aku ke air yang tenang.", ref: "Mazmur 23:1-2" },
    { text: "Apa pun juga yang kamu perbuat, perbuatlah dengan segenap hatimu seperti untuk Tuhan dan bukan untuk manusia.", ref: "Kolose 3:23" },
    { text: "Sebab Allah memberikan kepada kita bukan roh ketakutan, melainkan roh yang membangkitkan kekuatan, kasih dan ketertiban.", ref: "2 Timotius 1:7" },
    { text: "Mintalah, maka akan diberikan kepadamu; carilah, maka kamu akan mendapat; ketoklah, maka pintu akan dibukakan bagimu.", ref: "Matius 7:7" },
    { text: "Damai sejahtera Kutinggalkan bagimu. Damai sejahtera-Ku Kuberikan kepadamu, dan apa yang Kuberikan tidak seperti yang diberikan oleh dunia kepadamu. Janganlah gelisah dan gentar hatimu.", ref: "Yohanes 14:27" },
    { text: "Jika kita mengaku dosa kita, maka Ia adalah setia dan adil, sehingga Ia akan mengampuni segala dosa kita dan menyucikan kita dari segala kejahatan.", ref: "1 Yohanes 1:9" },
    { text: "Hendaklah kamu murah hati, sama seperti Bapamu adalah murah hati.", ref: "Lukas 6:36" },
    { text: "Aku memberikan perintah baru kepada kamu, yaitu supaya kamu saling mengasihi; sama seperti Aku telah mengasihi kamu demikian pula kamu harus saling mengasihi.", ref: "Yohanes 13:34" },
    { text: "Karena itu rendahkanlah dirimu di bawah tangan Tuhan yang kuat, supaya kamu ditinggikan-Nya pada waktunya.", ref: "1 Petrus 5:6" },
    { text: "Berbahagialah orang yang membawa damai, karena mereka akan disebut anak-anak Allah.", ref: "Matius 5:9" },
    { text: "Sebab upah dosa ialah maut; tetapi karunia Allah ialah hidup yang kekal dalam Kristus Yesus, Tuhan kita.", ref: "Roma 6:23" },
    { text: "Segala tulisan yang diilhamkan Allah memang bermanfaat untuk mengajar, untuk menyatakan kesalahan, untuk memperbaiki kelakuan dan untuk mendidik orang dalam kebenaran.", ref: "2 Timotius 3:16" },
    { text: "Lebih baik sepiring sayur dengan kasih dari pada lembu tambun dengan kebencian.", ref: "Amsal 15:17" },
    { text: "Hendaklah kata-katamu senantiasa penuh kasih, jangan hambar, sehingga kamu tahu, bagaimana kamu harus memberi jawab kepada setiap orang.", ref: "Kolose 4:6" },
    { text: "Dan inilah keberanian percaya kita kepada-Nya, yaitu bahwa Ia mengabulkan doa kita, jikalau kita meminta sesuatu kepada-Nya menurut kehendak-Nya.", ref: "1 Yohanes 5:14" },
    { text: "TUHAN itu baik; tempat perlindungan pada waktu kesusahan; Ia mengenal orang-orang yang berlindung kepada-Nya.", ref: "Nahum 1:7" }
  ];

  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const selectedVerse = verses[dayOfYear % verses.length];

  verseText.textContent = `"${selectedVerse.text}"`;
  verseRef.textContent = `— ${selectedVerse.ref}`;
}


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

/* ---------- Gallery Lightbox ---------- */
function initGallery() {
  // Collect all gallery items from media page
  var galleryItems = document.querySelectorAll('.gallery-item');
  galleryItems.forEach(function(item) {
    item.style.cursor = 'pointer';
    item.addEventListener('click', function() {
      var img = this.querySelector('img');
      var caption = this.querySelector('.gallery-item__overlay span');
      if (img) {
        openLightbox(img.src, caption ? caption.textContent.trim() : (img.alt || ''), galleryItems, this);
      }
    });
  });

  // Profile image on KomSek page
  var profileImg = document.querySelector('.komsek-profile__img');
  if (profileImg) {
    profileImg.style.cursor = 'pointer';
    profileImg.addEventListener('click', function(e) {
      e.preventDefault();
      var img = this.querySelector('img');
      var title = document.querySelector('.komsek-profile__text h2');
      if (img) {
        openLightbox(img.src, title ? title.textContent.trim() : (img.alt || ''), null, null, false);
      }
    });
  }

  // Collect komsek article card images
  var komsekCards = document.querySelectorAll('.komsek-article-card');
  komsekCards.forEach(function(card) {
    var imgWrap = card.querySelector('.komsek-article-card__img');
    if (imgWrap) {
      imgWrap.style.cursor = 'pointer';
      imgWrap.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var img = this.querySelector('img');
        var title = card.querySelector('.komsek-article-card__title');
        if (img) {
          openLightbox(img.src, title ? title.textContent.trim() : '', komsekCards, card, true);
        }
      });
    }
  });
}

/* ---------- Global Lightbox Engine ---------- */
var _lightboxState = { items: [], currentIdx: 0, isKomsek: false };

function openLightbox(src, caption, items, activeItem, isKomsek) {
  var lb = document.getElementById('lightbox');
  if (!lb) return;

  // Build items array for navigation
  _lightboxState.items = [];
  _lightboxState.isKomsek = !!isKomsek;
  if (items && items.length > 0) {
    items.forEach(function(item) {
      var img = item.querySelector('img');
      var cap = '';
      if (isKomsek) {
        var titleEl = item.querySelector('.komsek-article-card__title');
        cap = titleEl ? titleEl.textContent.trim() : '';
      } else {
        var capEl = item.querySelector('.gallery-item__overlay span');
        cap = capEl ? capEl.textContent.trim() : '';
      }
      if (img) {
        _lightboxState.items.push({ src: img.src, caption: cap });
      }
      if (item === activeItem) {
        _lightboxState.currentIdx = _lightboxState.items.length - 1;
      }
    });
  } else {
    _lightboxState.items = [{ src: src, caption: caption }];
    _lightboxState.currentIdx = 0;
  }

  showLightboxImage();
  lb.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function showLightboxImage() {
  var lb = document.getElementById('lightbox');
  if (!lb) return;
  var img = document.getElementById('lightbox-img');
  var cap = document.getElementById('lightbox-caption');
  var counter = document.getElementById('lightbox-counter');
  var item = _lightboxState.items[_lightboxState.currentIdx];
  if (!item) return;

  if (img) {
    img.style.opacity = '0';
    img.onload = function() { img.style.opacity = '1'; };
    img.src = item.src;
    if (img.complete) { img.style.opacity = '1'; }
  }
  if (cap) {
    cap.textContent = item.caption || '';
    cap.style.display = item.caption ? 'block' : 'none';
  }
  if (counter) {
    counter.textContent = (_lightboxState.currentIdx + 1) + ' / ' + _lightboxState.items.length;
    counter.style.display = _lightboxState.items.length > 1 ? 'block' : 'none';
  }

  // Show/hide nav arrows
  var prevBtn = document.getElementById('lightbox-prev');
  var nextBtn = document.getElementById('lightbox-next');
  if (prevBtn) prevBtn.style.display = _lightboxState.items.length > 1 ? 'flex' : 'none';
  if (nextBtn) nextBtn.style.display = _lightboxState.items.length > 1 ? 'flex' : 'none';
}

function closeLightbox() {
  var lb = document.getElementById('lightbox');
  if (lb) {
    lb.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function lightboxPrev() {
  if (_lightboxState.items.length <= 1) return;
  _lightboxState.currentIdx = (_lightboxState.currentIdx - 1 + _lightboxState.items.length) % _lightboxState.items.length;
  showLightboxImage();
}

function lightboxNext() {
  if (_lightboxState.items.length <= 1) return;
  _lightboxState.currentIdx = (_lightboxState.currentIdx + 1) % _lightboxState.items.length;
  showLightboxImage();
}

function initGlobalLightbox() {
  var lb = document.getElementById('lightbox');
  if (!lb) return;

  // Close on backdrop or outside click
  lb.addEventListener('click', function(e) {
    if (e.target === lb || e.target.classList.contains('lightbox__backdrop')) {
      closeLightbox();
    }
  });

  // Close button
  var closeBtn = lb.querySelector('.lightbox__close');
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

  // Prev/Next buttons
  var prevBtn = document.getElementById('lightbox-prev');
  var nextBtn = document.getElementById('lightbox-next');
  if (prevBtn) prevBtn.addEventListener('click', function(e) { e.stopPropagation(); lightboxPrev(); });
  if (nextBtn) nextBtn.addEventListener('click', function(e) { e.stopPropagation(); lightboxNext(); });

  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (!lb.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightboxPrev();
    if (e.key === 'ArrowRight') lightboxNext();
  });

  // Swipe gestures for mobile
  var touchStartX = 0;
  var touchStartY = 0;
  lb.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  lb.addEventListener('touchend', function(e) {
    var dx = e.changedTouches[0].screenX - touchStartX;
    var dy = e.changedTouches[0].screenY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx > 0) lightboxPrev();
      else lightboxNext();
    }
  }, { passive: true });
}




/* ---------- Floating Event Banner Premium — Smart Init ---------- */
function initFloatingEventBanner() {
  var banner = document.getElementById('floatingEventBanner');
  if (!banner) return;
  if (banner.dataset.febInit === '1') return;
  banner.dataset.febInit = '1';

  var closeBtn = document.getElementById('febClose');
  var tab = document.getElementById('febTab');
  var tabBtn = document.getElementById('febTabBtn');
  var card = document.getElementById('febCard');
  var overlay = document.getElementById('febOverlay');
  var expanded = document.getElementById('febExpanded');
  var expandedClose = document.getElementById('febExpandedClose');

  var startAt = banner.dataset.febStart ? new Date(banner.dataset.febStart) : null;
  var endAt = banner.dataset.febEnd ? new Date(banner.dataset.febEnd) : null;
  var eventId = banner.dataset.febId || 'default';
  var dismissKey = 'feb_dismissed_' + eventId;

  if (endAt && endAt.getTime() < Date.now()) {
    banner.style.display = 'none';
    return;
  }

  if (sessionStorage.getItem(dismissKey)) {
    if (tab) tab.classList.add('feb-tab--visible');
    return;
  }

  setTimeout(function() {
    banner.classList.add('feb--visible');
  }, 2000);

  // ---- Countdown ----
  var cdContainer = document.getElementById('febCountdown');
  var cdLiveContainer = document.getElementById('febCdLive');
  var exCdContainer = document.getElementById('febExpandedCd');
  var exCdLive = document.getElementById('febExCdLive');
  var cdInterval = null;

  function padZero(n) { return n < 10 ? '0' + n : '' + n; }

  function updateCountdown() {
    if (!startAt) return;
    var now = Date.now();
    var diff = startAt.getTime() - now;

    if (diff <= 0) {
      if (cdContainer) cdContainer.style.display = 'none';
      if (cdLiveContainer) cdLiveContainer.style.display = 'flex';
      if (exCdContainer) exCdContainer.style.display = 'none';
      if (exCdLive) exCdLive.style.display = 'flex';
      if (cdInterval) clearInterval(cdInterval);
      if (endAt && endAt.getTime() < now) closeBannerPermanent();
      return;
    }

    if (cdLiveContainer) cdLiveContainer.style.display = 'none';
    if (cdContainer) cdContainer.style.display = 'flex';
    if (exCdLive) exCdLive.style.display = 'none';
    if (exCdContainer) exCdContainer.style.display = 'flex';

    var days = Math.floor(diff / 86400000);
    var hours = Math.floor((diff % 86400000) / 3600000);
    var mins = Math.floor((diff % 3600000) / 60000);
    var secs = Math.floor((diff % 60000) / 1000);

    setUnit('febCdDays', padZero(days));
    setUnit('febCdHours', padZero(hours));
    setUnit('febCdMins', padZero(mins));
    setUnit('febCdSecs', padZero(secs));
    setUnit('febExCdDays', padZero(days));
    setUnit('febExCdHours', padZero(hours));
    setUnit('febExCdMins', padZero(mins));
    setUnit('febExCdSecs', padZero(secs));
  }

  function setUnit(id, val) {
    var el = document.getElementById(id);
    if (!el) return;
    if (el.textContent !== val) {
      el.textContent = val;
      el.classList.remove('feb__cd-num--tick');
      void el.offsetWidth;
      el.classList.add('feb__cd-num--tick');
    }
  }

  if (startAt) {
    updateCountdown();
    cdInterval = setInterval(updateCountdown, 1000);
  }

  // ---- Expand / Collapse ----
  function expandBanner() {
    if (overlay) overlay.classList.add('feb-overlay--active');
    if (expanded) expanded.classList.add('feb-expanded--active');
    document.body.style.overflow = 'hidden';
  }

  function collapseBanner() {
    if (overlay) overlay.classList.remove('feb-overlay--active');
    if (expanded) expanded.classList.remove('feb-expanded--active');
    document.body.style.overflow = '';
  }

  if (card) {
    card.addEventListener('click', function(e) {
      if (e.target === closeBtn || closeBtn.contains(e.target)) return;
      expandBanner();
    });
    card.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (document.activeElement === card) expandBanner();
      }
    });
  }
  if (expandedClose) expandedClose.addEventListener('click', collapseBanner);
  if (overlay) overlay.addEventListener('click', collapseBanner);

  // ---- Close / Reopen ----
  function closeBanner() {
    collapseBanner();
    banner.classList.add('feb--closing');
    setTimeout(function() {
      banner.classList.remove('feb--visible', 'feb--closing');
      banner.style.display = 'none';
      if (tab) tab.classList.add('feb-tab--visible');
      sessionStorage.setItem(dismissKey, '1');
    }, 400);
  }

  function closeBannerPermanent() {
    collapseBanner();
    banner.classList.remove('feb--visible');
    banner.style.display = 'none';
    if (tab) tab.classList.remove('feb-tab--visible');
    if (cdInterval) clearInterval(cdInterval);
  }

  function reopenBanner() {
    if (tab) tab.classList.remove('feb-tab--visible');
    banner.style.display = '';
    banner.classList.remove('feb--closing');
    setTimeout(function() {
      banner.classList.add('feb--visible');
    }, 50);
    sessionStorage.removeItem(dismissKey);
  }

  if (closeBtn) closeBtn.addEventListener('click', function(e) { e.stopPropagation(); closeBanner(); });
  if (tabBtn) tabBtn.addEventListener('click', reopenBanner);

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (expanded && expanded.classList.contains('feb-expanded--active')) {
        collapseBanner();
      } else if (banner.classList.contains('feb--visible')) {
        closeBanner();
      }
    }
  });
}


/* =========================================
   MODUL ADVEN & NATAL PREMIUM — SCRIPT ENGINE
   ========================================= */

function initAdvenNatal() {
  // ---- 1. SNOWFALL ENGINE (Canvas 60fps) ----
  var snowCanvas = document.getElementById('anSnowCanvas');
  var snowToggle = document.getElementById('anSnowToggle');

  if (snowCanvas) {
    var ctx = snowCanvas.getContext('2d');
    var particles = [];
    var animFrameId = null;
    var isRunning = true;

    // Check user preference from localStorage or OS reduced motion
    var userPrefDisabled = localStorage.getItem('hermon_snow_disabled') === '1';
    var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Intensity & speed from canvas data attributes
    var intensity = snowCanvas.dataset.intensity || 'medium';
    var speedSetting = snowCanvas.dataset.speed || 'gentle';
    var isMobile = window.innerWidth < 768;

    var maxParticles = 32;
    if (intensity === 'light') maxParticles = 16;
    else if (intensity === 'heavy') maxParticles = 55;

    // Mobile performance mode
    if (isMobile && snowCanvas.dataset.mobilePerf === 'true') {
      maxParticles = Math.max(10, Math.floor(maxParticles * 0.55));
    }

    var speedMultiplier = 1;
    if (speedSetting === 'gentle') speedMultiplier = 0.65;
    else if (speedSetting === 'fast') speedMultiplier = 1.4;

    function resizeCanvas() {
      snowCanvas.width = window.innerWidth;
      snowCanvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function createParticle() {
      return {
        x: Math.random() * snowCanvas.width,
        y: Math.random() * -snowCanvas.height,
        r: Math.random() * 2.8 + 1,
        d: Math.random() * maxParticles,
        speedY: (Math.random() * 1.2 + 0.6) * speedMultiplier,
        speedX: (Math.random() * 0.8 - 0.4) * speedMultiplier,
        opacity: Math.random() * 0.55 + 0.4,
        swayAngle: Math.random() * Math.PI * 2,
        swaySpeed: Math.random() * 0.02 + 0.01
      };
    }

    // Init particles
    for (var i = 0; i < maxParticles; i++) {
      var p = createParticle();
      p.y = Math.random() * snowCanvas.height; // scatter initially
      particles.push(p);
    }

    function renderSnow() {
      if (!isRunning) return;
      ctx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);

      ctx.fillStyle = '#FFFFFF';
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.swayAngle += p.swaySpeed;
        p.y += p.speedY;
        p.x += Math.sin(p.swayAngle) * 0.6 + p.speedX;

        // Wrap around
        if (p.y > snowCanvas.height) {
          particles[i] = createParticle();
          particles[i].y = -10;
        }
        if (p.x > snowCanvas.width + 10) p.x = -10;
        else if (p.x < -10) p.x = snowCanvas.width + 10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, false);
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      animFrameId = requestAnimationFrame(renderSnow);
    }

    function startSnow() {
      if (isRunning) return;
      isRunning = true;
      renderSnow();
      if (snowToggle) {
        snowToggle.classList.remove('is-paused');
        var textSpan = snowToggle.querySelector('.an-snow-toggle__text');
        if (textSpan) textSpan.textContent = 'Salju: Nyala';
      }
    }

    function pauseSnow() {
      isRunning = false;
      if (animFrameId) cancelAnimationFrame(animFrameId);
      ctx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);
      if (snowToggle) {
        snowToggle.classList.add('is-paused');
        var textSpan = snowToggle.querySelector('.an-snow-toggle__text');
        if (textSpan) textSpan.textContent = 'Salju: Mati';
      }
    }

    // Tab visibility change (battery saver)
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        if (animFrameId) cancelAnimationFrame(animFrameId);
      } else {
        if (isRunning) renderSnow();
      }
    });

    // Toggle button handler
    if (snowToggle) {
      snowToggle.addEventListener('click', function() {
        if (isRunning) {
          pauseSnow();
          localStorage.setItem('hermon_snow_disabled', '1');
        } else {
          startSnow();
          localStorage.removeItem('hermon_snow_disabled');
        }
      });
    }

    // Auto start or respect preference
    if (userPrefDisabled || prefersReduced) {
      pauseSnow();
    } else {
      startSnow();
    }
  }

  // ---- 2. LIVE CHRISTMAS COUNTDOWN (Hero Widget) ----
  var cdHero = document.getElementById('anCountdownHero');
  if (cdHero) {
    var targetDateStr = cdHero.dataset.targetDate;
    if (targetDateStr) {
      var targetTime = new Date(targetDateStr).getTime();
      var daysEl = document.getElementById('anHeroCdDays');
      var hoursEl = document.getElementById('anHeroCdHours');
      var minsEl = document.getElementById('anHeroCdMins');
      var secsEl = document.getElementById('anHeroCdSecs');
      var gridEl = document.getElementById('anHeroCdGrid');
      var msgEl = document.getElementById('anHeroCdCompleted');

      function pad2(n) { return n < 10 ? '0' + n : '' + n; }

      function updateHeroCountdown() {
        var diff = targetTime - Date.now();
        if (diff <= 0) {
          if (gridEl) gridEl.style.display = 'none';
          if (msgEl) msgEl.style.display = 'block';
          return;
        }

        var d = Math.floor(diff / 86400000);
        var h = Math.floor((diff % 86400000) / 3600000);
        var m = Math.floor((diff % 3600000) / 60000);
        var s = Math.floor((diff % 60000) / 1000);

        if (daysEl) daysEl.textContent = pad2(d);
        if (hoursEl) hoursEl.textContent = pad2(h);
        if (minsEl) minsEl.textContent = pad2(m);
        if (secsEl) secsEl.textContent = pad2(s);
      }

      updateHeroCountdown();
      setInterval(updateHeroCountdown, 1000);
    }
  }
}
