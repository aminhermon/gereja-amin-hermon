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
  if (!onlineEl || !totalEl) return;

  function fetchVisitors() {
    fetch('/api/visitors')
      .then(r => r.json())
      .then(data => {
        if (onlineEl) onlineEl.textContent = (data.online || 0).toLocaleString('id-ID');
        if (totalEl) totalEl.textContent = (data.total || 0).toLocaleString('id-ID');
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
