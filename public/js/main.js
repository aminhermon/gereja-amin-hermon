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

/* ---------- YouVersion-Style Daily Devotional ---------- */
const DEVOTIONALS = [
  { verse: "Segala perkara dapat kutanggung di dalam Dia yang memberi kekuatan kepadaku.", ref: "Filipi 4:13", reflection: "Kekuatan kita bukan berasal dari diri sendiri, melainkan dari Kristus yang berdiam di dalam kita. Dalam setiap tantangan hari ini, ingatlah bahwa Tuhan telah memperlengkapi kita dengan segala yang kita butuhkan.", prayer: "Tuhan Yesus, terima kasih karena Engkau adalah sumber kekuatanku. Ajar aku untuk bersandar kepada-Mu dalam segala perkara. Amin." },
  { verse: "Karena begitu besar kasih Allah akan dunia ini, sehingga Ia telah mengaruniakan Anak-Nya yang tunggal, supaya setiap orang yang percaya kepada-Nya tidak binasa, melainkan beroleh hidup yang kekal.", ref: "Yohanes 3:16", reflection: "Kasih Allah bukan hanya kata-kata, melainkan tindakan nyata melalui pengorbanan Yesus Kristus. Kasih ini tidak bersyarat dan tersedia bagi setiap orang yang percaya.", prayer: "Bapa di surga, terima kasih untuk kasih-Mu yang tak terhingga. Tolong aku untuk membagikan kasih ini kepada sesama. Amin." },
  { verse: "Sebab Aku ini mengetahui rancangan-rancangan apa yang ada pada-Ku mengenai kamu, yaitu rancangan damai sejahtera dan bukan rancangan kecelakaan, untuk memberikan kepadamu hari depan yang penuh harapan.", ref: "Yeremia 29:11", reflection: "Tuhan memiliki rencana yang indah untuk setiap anak-Nya. Meskipun jalan yang kita lalui tidak selalu mudah, tujuan akhirnya adalah damai sejahtera dan harapan.", prayer: "Tuhan, aku percaya bahwa rancangan-Mu lebih baik dari rencanaku sendiri. Tuntun langkahku hari ini menurut kehendak-Mu. Amin." },
  { verse: "Janganlah hendaknya kamu kuatir tentang apa pun juga, tetapi nyatakanlah dalam segala hal keinginanmu kepada Allah dalam doa dan permohonan dengan ucapan syukur.", ref: "Filipi 4:6", reflection: "Kekuatiran adalah musuh iman. Tuhan mengajak kita untuk menukar kecemasan dengan doa dan ucapan syukur. Setiap kali kuatir datang, jadikan itu sebagai undangan untuk berdoa.", prayer: "Ya Tuhan, aku serahkan segala kekuatiranku kepada-Mu. Gantikan dengan damai sejahtera-Mu yang melampaui segala akal. Amin." },
  { verse: "Percayalah kepada TUHAN dengan segenap hatimu, dan janganlah bersandar kepada pengertianmu sendiri. Akuilah Dia dalam segala lakumu, maka Ia akan meluruskan jalanmu.", ref: "Amsal 3:5-6", reflection: "Percaya kepada Tuhan berarti melepaskan kendali dan membiarkan Dia yang memimpin. Bukan berarti kita pasif, tetapi kita aktif mencari kehendak-Nya dalam setiap langkah.", prayer: "Tuhan, ajarku untuk percaya sepenuhnya kepada-Mu, bukan kepada pengertianku sendiri. Luruskan jalanku hari ini. Amin." },
  { verse: "Marilah kepada-Ku, semua yang letih lesu dan berbeban berat, Aku akan memberi kelegaan kepadamu.", ref: "Matius 11:28", reflection: "Yesus tidak menjanjikan hidup tanpa beban, tetapi Ia menawarkan kelegaan di tengah beban itu. Datanglah kepada-Nya apa adanya, dengan segala kelelahan dan bebanmu.", prayer: "Yesus, aku datang kepada-Mu dengan segala bebanku. Berilah kelegaan dan istirahat bagi jiwaku. Amin." },
  { verse: "Kita tahu sekarang, bahwa Allah turut bekerja dalam segala sesuatu untuk mendatangkan kebaikan bagi mereka yang mengasihi Dia.", ref: "Roma 8:28", reflection: "Tidak semua yang terjadi itu baik, tetapi Tuhan mampu mendatangkan kebaikan dari segala sesuatu. Percayalah bahwa Ia sedang bekerja bahkan di saat-saat yang paling sulit.", prayer: "Tuhan, tolong aku untuk percaya bahwa Engkau sedang bekerja dalam setiap situasi hidupku, bahkan yang tidak aku mengerti. Amin." },
  { verse: "Tetapi orang-orang yang menanti-nantikan TUHAN mendapat kekuatan baru: mereka seumpama rajawali yang naik terbang dengan kekuatan sayapnya.", ref: "Yesaya 40:31", reflection: "Menantikan Tuhan bukan berarti diam tanpa melakukan apa-apa. Menantikan Tuhan berarti tetap setia dalam iman sambil menunggu waktu-Nya yang sempurna.", prayer: "Tuhan, berikan aku kesabaran untuk menantikan waktu-Mu. Perbaharui kekuatanku hari ini. Amin." },
  { verse: "Firman-Mu itu pelita bagi kakiku dan terang bagi jalanku.", ref: "Mazmur 119:105", reflection: "Firman Tuhan adalah panduan hidup kita. Seperti pelita yang menerangi jalan di kegelapan, demikianlah firman-Nya memberikan arah dan hikmat untuk setiap keputusan.", prayer: "Tuhan, buka mataku untuk melihat kebenaran dalam firman-Mu. Jadikanlah firman-Mu panduan hidupku setiap hari. Amin." },
  { verse: "Kasih itu sabar; kasih itu murah hati; ia tidak cemburu. Ia tidak memegahkan diri dan tidak sombong.", ref: "1 Korintus 13:4", reflection: "Kasih sejati bukan perasaan semata, melainkan pilihan dan tindakan. Setiap hari kita diberi kesempatan untuk memilih sabar, murah hati, dan rendah hati.", prayer: "Tuhan, bentuklah kasih-Mu di dalam hatiku. Ajarku untuk mengasihi seperti Engkau mengasihi. Amin." },
  { verse: "Serahkanlah kuatirmu kepada TUHAN, maka Ia akan memelihara engkau! Tidak untuk selama-lamanya dibiarkannya orang benar itu goyah.", ref: "Mazmur 55:22", reflection: "Tuhan tidak pernah meninggalkan umat-Nya. Ia mengundang kita untuk menyerahkan setiap beban kepada-Nya dan percaya bahwa Ia akan memelihara kita.", prayer: "Bapa, aku serahkan semua kekhawatiranku kepada-Mu hari ini. Aku percaya Engkau akan memelihara dan menjaga langkahku. Amin." },
  { verse: "Bersukacitalah senantiasa. Tetaplah berdoa. Mengucap syukurlah dalam segala hal, sebab itulah yang dikehendaki Allah di dalam Kristus Yesus bagi kamu.", ref: "1 Tesalonika 5:16-18", reflection: "Sukacita, doa, dan syukur adalah tiga pilar kehidupan Kristen yang sehat. Bukan bergantung pada keadaan, tetapi pada hubungan kita dengan Kristus.", prayer: "Tuhan Yesus, ajarlah aku untuk bersukacita, berdoa, dan bersyukur senantiasa dalam segala keadaan. Amin." },
  { verse: "Sebab karena kasih karunia kamu diselamatkan oleh iman; itu bukan hasil usahamu, tetapi pemberian Allah.", ref: "Efesus 2:8", reflection: "Keselamatan adalah anugerah, bukan upah. Kita tidak dapat memperolehnya dengan usaha sendiri. Inilah keindahan kasih karunia Allah yang tak terbatas.", prayer: "Terima kasih Tuhan untuk kasih karunia-Mu yang menyelamatkan. Ajar aku untuk hidup layak bagi anugerah yang telah Engkau berikan. Amin." },
  { verse: "Tetapi carilah dahulu Kerajaan Allah dan kebenarannya, maka semuanya itu akan ditambahkan kepadamu.", ref: "Matius 6:33", reflection: "Prioritas yang benar menghasilkan berkat yang benar. Ketika Tuhan menjadi yang pertama dalam hidup kita, segala kebutuhan akan dipenuhi menurut kekayaan-Nya.", prayer: "Tuhan, ajarku untuk selalu mendahulukan Kerajaan-Mu di atas segala sesuatu. Aku percaya Engkau akan mencukupkan kebutuhanku. Amin." },
  { verse: "TUHAN adalah gembalaku, takkan kekurangan aku. Ia membaringkan aku di padang yang berumput hijau, Ia membimbing aku ke air yang tenang.", ref: "Mazmur 23:1-2", reflection: "Tuhan sebagai Gembala menunjukkan betapa dekat dan personal-Nya hubungan kita dengan-Nya. Ia menyediakan tempat perhentian dan pemulihan bagi jiwa kita.", prayer: "Tuhan Gembalaku, pimpin aku ke tempat perhentian-Mu. Pulihkan jiwaku dan perbaharui kekuatanku. Amin." },
  { verse: "Apa pun juga yang kamu perbuat, perbuatlah dengan segenap hatimu seperti untuk Tuhan dan bukan untuk manusia.", ref: "Kolose 3:23", reflection: "Setiap pekerjaan, sekecil apa pun, menjadi ibadah ketika dilakukan untuk kemuliaan Tuhan. Motivasi kita bukan pujian manusia, melainkan kesetiaan kepada Kristus.", prayer: "Tuhan, berikanku hati yang rela untuk bekerja dengan sungguh-sungguh demi kemuliaan-Mu, bukan demi pujian manusia. Amin." },
  { verse: "Sebab Allah memberikan kepada kita bukan roh ketakutan, melainkan roh yang membangkitkan kekuatan, kasih dan ketertiban.", ref: "2 Timotius 1:7", reflection: "Ketakutan bukanlah berasal dari Tuhan. Roh yang Tuhan berikan adalah roh yang penuh kuasa, kasih, dan pengendalian diri untuk menghadapi setiap tantangan.", prayer: "Tuhan, usir segala roh ketakutan dari hidupku. Isi aku dengan kuasa, kasih, dan ketertiban dari Roh-Mu. Amin." },
  { verse: "Mintalah, maka akan diberikan kepadamu; carilah, maka kamu akan mendapat; ketoklah, maka pintu akan dibukakan bagimu.", ref: "Matius 7:7", reflection: "Tuhan mengundang kita untuk datang kepada-Nya dengan keberanian dan ketekunan. Ia bukan Tuhan yang pelit, melainkan Bapa yang murah hati.", prayer: "Bapa surgawi, berikanku keberanian untuk meminta, ketekunan untuk mencari, dan iman untuk mengetuk pintu-Mu. Amin." },
  { verse: "Damai sejahtera Kutinggalkan bagimu. Damai sejahtera-Ku Kuberikan kepadamu, dan apa yang Kuberikan tidak seperti yang diberikan oleh dunia kepadamu.", ref: "Yohanes 14:27", reflection: "Damai sejahtera dari Yesus berbeda dari kedamaian duniawi. Damai-Nya tidak bergantung pada situasi, melainkan hadir di tengah badai kehidupan.", prayer: "Yesus, aku terima damai sejahtera-Mu yang melampaui segala keadaan. Biarkan damai-Mu memenuhi hatiku hari ini. Amin." },
  { verse: "Jika kita mengaku dosa kita, maka Ia adalah setia dan adil, sehingga Ia akan mengampuni segala dosa kita dan menyucikan kita dari segala kejahatan.", ref: "1 Yohanes 1:9", reflection: "Pengampunan Tuhan selalu tersedia bagi mereka yang datang dengan hati yang jujur dan rendah. Tidak ada dosa yang terlalu besar bagi kasih karunia-Nya.", prayer: "Tuhan, aku mengaku dosaku di hadapan-Mu. Terima kasih untuk pengampunan dan pemurnian yang Engkau sediakan. Amin." },
  { verse: "Hendaklah kamu murah hati, sama seperti Bapamu adalah murah hati.", ref: "Lukas 6:36", reflection: "Kemurahan hati adalah cerminan karakter Allah dalam diri kita. Ketika kita murah hati kepada orang lain, kita menjadi saluran berkat Tuhan.", prayer: "Tuhan, bentuklah hatiku agar murah hati seperti Engkau. Ajarku untuk memberi tanpa mengharapkan balasan. Amin." },
  { verse: "Aku memberikan perintah baru kepada kamu, yaitu supaya kamu saling mengasihi; sama seperti Aku telah mengasihi kamu demikian pula kamu harus saling mengasihi.", ref: "Yohanes 13:34", reflection: "Kasih adalah tanda pengenal murid Kristus. Bukan kasih yang memilih-milih, tetapi kasih yang rela berkorban seperti Kristus telah berkorban.", prayer: "Yesus, tolong aku untuk mengasihi sesamaku seperti Engkau telah mengasihi aku. Jadikan kasih-Mu nyata melalui hidupku. Amin." },
  { verse: "Karena itu rendahkanlah dirimu di bawah tangan Tuhan yang kuat, supaya kamu ditinggikan-Nya pada waktunya.", ref: "1 Petrus 5:6", reflection: "Kerendahan hati adalah kunci kemuliaan sejati. Tuhan meninggikan mereka yang merendahkan diri, bukan di hadapan manusia saja, tetapi di hadapan-Nya.", prayer: "Tuhan, ajarku untuk rendah hati dan menyerahkan segala ambisiku kepada-Mu. Aku percaya waktu-Mu selalu sempurna. Amin." },
  { verse: "Berbahagialah orang yang membawa damai, karena mereka akan disebut anak-anak Allah.", ref: "Matius 5:9", reflection: "Menjadi pembawa damai bukan berarti menghindari konflik, melainkan menjadi jembatan rekonsiliasi dan pemulihan di tengah perpecahan.", prayer: "Tuhan, jadikan aku alat damai-Mu. Di mana ada kebencian, biarkan aku menaburkan kasih; di mana ada perpecahan, biarkan aku membawa persatuan. Amin." },
  { verse: "Sebab upah dosa ialah maut; tetapi karunia Allah ialah hidup yang kekal dalam Kristus Yesus, Tuhan kita.", ref: "Roma 6:23", reflection: "Injil dalam satu ayat: dosa membawa maut, tetapi kasih karunia Allah memberikan hidup kekal. Perbedaan antara upah dan karunia menunjukkan betapa besar kasih Allah.", prayer: "Terima kasih Tuhan untuk karunia hidup kekal melalui Yesus Kristus. Ajarku untuk hidup di dalam kasih karunia-Mu setiap hari. Amin." },
  { verse: "Segala tulisan yang diilhamkan Allah memang bermanfaat untuk mengajar, untuk menyatakan kesalahan, untuk memperbaiki kelakuan dan untuk mendidik orang dalam kebenaran.", ref: "2 Timotius 3:16", reflection: "Alkitab bukan buku biasa, melainkan firman Allah yang hidup. Setiap halaman mengajarkan, mengoreksi, dan membentuk kita menjadi serupa dengan Kristus.", prayer: "Tuhan, berikan aku kerinduan untuk membaca dan merenungkan firman-Mu setiap hari. Biarlah firman-Mu mengubah hidupku. Amin." },
  { verse: "Lebih baik sepiring sayur dengan kasih dari pada lembu tambun dengan kebencian.", ref: "Amsal 15:17", reflection: "Kekayaan materi tidak ada artinya tanpa kasih. Rumah yang sederhana dengan penuh kasih jauh lebih berharga dari pada kemewahan yang penuh perselisihan.", prayer: "Tuhan, ajarku untuk menghargai kasih di atas segalanya. Biarlah rumah tanggaku dipenuhi kasih dan damai sejahtera. Amin." },
  { verse: "Hendaklah kata-katamu senantiasa penuh kasih, jangan hambar, sehingga kamu tahu, bagaimana kamu harus memberi jawab kepada setiap orang.", ref: "Kolose 4:6", reflection: "Kata-kata kita memiliki kuasa untuk membangun atau menghancurkan. Tuhan mengajak kita untuk berbicara dengan hikmat dan penuh kasih karunia.", prayer: "Tuhan, jaga lidahku hari ini. Biarlah setiap kata yang keluar dari mulutku membangun dan memberkati orang lain. Amin." },
  { verse: "Dan inilah keberanian percaya kita kepada-Nya, yaitu bahwa Ia mengabulkan doa kita, jikalau kita meminta sesuatu kepada-Nya menurut kehendak-Nya.", ref: "1 Yohanes 5:14", reflection: "Berdoa menurut kehendak Tuhan bukan membatasi doa, tetapi mengarahkan doa kepada apa yang terbaik. Tuhan selalu mendengar dan menjawab setiap doa yang selaras dengan rencana-Nya.", prayer: "Tuhan, selaraskan keinginanku dengan kehendak-Mu. Aku percaya bahwa jawaban-Mu selalu yang terbaik untukku. Amin." },
  { verse: "Pencuri datang hanya untuk mencuri dan membunuh dan membinasakan; Aku datang, supaya mereka mempunyai hidup, dan mempunyainya dalam segala kelimpahan.", ref: "Yohanes 10:10", reflection: "Yesus datang untuk memberikan hidup yang berkelimpahan, bukan hanya hidup yang bertahan. Kelimpahan ini bukan soal materi, melainkan sukacita, damai, dan tujuan hidup.", prayer: "Yesus, aku terima hidup yang berkelimpahan dari-Mu. Buka mataku untuk melihat berkat-berkat yang telah Engkau sediakan. Amin." }
];

let currentDevIdx = 0;
let isSpeakingDev = false;
let devSpeechRate = 1.0;
let devAudioTimerSec = 0;
let devAudioTimerInterval = null;
let devFontSizeDelta = 0;

function initDailyVerse() {
  const today = new Date();
  currentDevIdx = (today.getDate() - 1) % DEVOTIONALS.length;
  renderDevotional(currentDevIdx);

  // Restore favorite status from storage
  try {
    const favs = JSON.parse(localStorage.getItem('amin_dev_favs') || '[]');
    const isFav = favs.includes(currentDevIdx);
    const favBtn = document.getElementById('devFavBtn');
    const favText = document.getElementById('favText');
    if (favBtn && isFav) {
      favBtn.classList.add('active');
      if (favText) favText.textContent = 'Tersimpan';
    }
  } catch (e) {}
}

function renderDevotional(idx) {
  const d = DEVOTIONALS[idx];
  const el = (id) => document.getElementById(id);

  const verseEl = el('devVerseText');
  const refEl = el('devVerseRef');
  const reflEl = el('devReflection');
  const prayerEl = el('devPrayer');
  const dayEl = el('devDayNum');
  const progEl = el('devProgressFill');

  if (verseEl) {
    verseEl.style.opacity = '0';
    setTimeout(() => {
      verseEl.textContent = d.verse;
      verseEl.style.opacity = '1';
    }, 150);
  }
  if (refEl) refEl.textContent = d.ref;
  if (reflEl) reflEl.textContent = d.reflection;
  if (prayerEl) prayerEl.textContent = '"' + d.prayer + '"';
  if (dayEl) dayEl.textContent = 'Hari ke-' + (idx + 1) + ' dari ' + DEVOTIONALS.length;
  if (progEl) progEl.style.width = Math.round(((idx + 1) / DEVOTIONALS.length) * 100) + '%';

  // Stop any active speech if user changed verse
  if (isSpeakingDev && window.speechSynthesis) {
    stopDevotionalAudio();
  }
}

function shuffleDevotional() {
  let next;
  do {
    next = Math.floor(Math.random() * DEVOTIONALS.length);
  } while (next === currentDevIdx && DEVOTIONALS.length > 1);
  currentDevIdx = next;
  renderDevotional(currentDevIdx);
}

function switchDevotionalTab(tabName, btn) {
  const tabs = document.querySelectorAll('.dev-tab-btn');
  tabs.forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const panels = {
    verse: document.getElementById('panelVerse'),
    audio: document.getElementById('panelAudio'),
    reflection: document.getElementById('panelReflection'),
    prayer: document.getElementById('panelPrayer')
  };

  if (tabName === 'all') {
    Object.values(panels).forEach(p => { if (p) p.style.display = 'block'; });
  } else {
    Object.keys(panels).forEach(key => {
      if (panels[key]) {
        panels[key].style.display = (key === tabName) ? 'block' : 'none';
      }
    });
  }
}

function adjustDevotionalFontSize(delta) {
  const verseText = document.getElementById('devVerseText');
  const reflText = document.getElementById('devReflection');
  const prayerText = document.getElementById('devPrayer');

  devFontSizeDelta = Math.max(-2, Math.min(4, devFontSizeDelta + delta));

  const baseVerse = 1.45;
  const baseRefl = 1.02;
  const basePrayer = 1.08;

  if (verseText) verseText.style.fontSize = (baseVerse + devFontSizeDelta * 0.12) + 'rem';
  if (reflText) reflText.style.fontSize = (baseRefl + devFontSizeDelta * 0.08) + 'rem';
  if (prayerText) prayerText.style.fontSize = (basePrayer + devFontSizeDelta * 0.08) + 'rem';
}

function toggleAudioSpeed() {
  const speeds = [1.0, 1.25, 0.9];
  const currentSpeedIdx = speeds.indexOf(devSpeechRate);
  const nextIdx = (currentSpeedIdx + 1) % speeds.length;
  devSpeechRate = speeds[nextIdx];

  const speedBtn = document.getElementById('devSpeedBtn');
  if (speedBtn) speedBtn.textContent = devSpeechRate.toFixed(1) + 'x';

  // If speaking, restart with new speed
  if (isSpeakingDev) {
    stopDevotionalAudio();
    speakDevotional();
  }
}

function speakDevotional() {
  if (!('speechSynthesis' in window)) {
    alert('Browser Anda belum mendukung fitur narasi suara.');
    return;
  }

  const playCircle = document.getElementById('devAudioBtn');
  const mainAudioBtn = document.getElementById('devMainAudioBtn');
  const eq = document.getElementById('devAudioEqualizer');
  const livePill = document.getElementById('devAudioLivePill');
  const timerEl = document.getElementById('devAudioTimer');

  if (isSpeakingDev) {
    stopDevotionalAudio();
    return;
  }

  window.speechSynthesis.cancel();
  const d = DEVOTIONALS[currentDevIdx];
  const text = 'Renungan Harian Gereja AMIN Hermon. Bacaan hari ini terambil dari ' + d.ref + '. ' + d.verse + '. Renungan Firman: ' + d.reflection + '. Doa Penutup: ' + d.prayer;
  
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'id-ID';
  utter.rate = devSpeechRate;

  // Pick best Indonesian voice available
  const voices = window.speechSynthesis.getVoices();
  const idVoice = voices.find(v => v.lang && (v.lang.startsWith('id') || v.lang === 'id-ID'));
  if (idVoice) utter.voice = idVoice;

  utter.onstart = () => {
    isSpeakingDev = true;
    if (playCircle) {
      playCircle.classList.add('playing');
      const iconPlay = playCircle.querySelector('.icon-play');
      const iconPause = playCircle.querySelector('.icon-pause');
      if (iconPlay) iconPlay.style.display = 'none';
      if (iconPause) iconPause.style.display = 'block';
    }
    if (mainAudioBtn) mainAudioBtn.classList.add('playing');
    if (eq) eq.classList.add('playing');
    if (livePill) livePill.style.display = 'inline-block';

    // Start live timer
    devAudioTimerSec = 0;
    if (devAudioTimerInterval) clearInterval(devAudioTimerInterval);
    devAudioTimerInterval = setInterval(() => {
      devAudioTimerSec++;
      const mins = Math.floor(devAudioTimerSec / 60).toString().padStart(2, '0');
      const secs = (devAudioTimerSec % 60).toString().padStart(2, '0');
      if (timerEl) timerEl.textContent = `${mins}:${secs}`;
    }, 1000);
  };

  utter.onend = utter.onerror = () => {
    stopDevotionalAudio();
  };

  window.speechSynthesis.speak(utter);
}

function stopDevotionalAudio() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  isSpeakingDev = false;

  const playCircle = document.getElementById('devAudioBtn');
  const mainAudioBtn = document.getElementById('devMainAudioBtn');
  const eq = document.getElementById('devAudioEqualizer');
  const livePill = document.getElementById('devAudioLivePill');
  const timerEl = document.getElementById('devAudioTimer');

  if (playCircle) {
    playCircle.classList.remove('playing');
    const iconPlay = playCircle.querySelector('.icon-play');
    const iconPause = playCircle.querySelector('.icon-pause');
    if (iconPlay) iconPlay.style.display = 'block';
    if (iconPause) iconPause.style.display = 'none';
  }
  if (mainAudioBtn) mainAudioBtn.classList.remove('playing');
  if (eq) eq.classList.remove('playing');
  if (livePill) livePill.style.display = 'none';
  if (timerEl) timerEl.textContent = '00:00';

  if (devAudioTimerInterval) {
    clearInterval(devAudioTimerInterval);
    devAudioTimerInterval = null;
  }
}

function shareDevotional() {
  const d = DEVOTIONALS[currentDevIdx];
  const siteUrl = window.location.origin;
  const text = `*📖 RENUNGAN HARIAN GEREJA AMIN HERMON*\n` +
               `_${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}_\n\n` +
               `✨ *${d.ref}*\n` +
               `"${d.verse}"\n\n` +
               `✍️ *Renungan:*\n` +
               `${d.reflection}\n\n` +
               `🙏 *Doa Penutup:*\n` +
               `"${d.prayer}"\n\n` +
               `🌐 Baca selengkapnya & dengarkan audio di:\n${siteUrl}`;

  window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
}

function copyDevotional() {
  const d = DEVOTIONALS[currentDevIdx];
  const text = `${d.ref}\n"${d.verse}"\n\nRenungan:\n${d.reflection}\n\nDoa Penutup:\n"${d.prayer}"\n\n— Gereja AMIN Hermon (${window.location.origin})`;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('devCopyBtn');
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = '<span>✅ Tersalin!</span>';
        setTimeout(() => { btn.innerHTML = orig; }, 2000);
      }
    }).catch(() => {});
  }
}

function triggerAmenBurst(btn) {
  if (!btn) return;
  btn.classList.add('amen-active');

  const counter = document.getElementById('amenCounter');
  if (counter) {
    counter.textContent = '❤️ Amin!';
  }

  // Create floating hearts / sparkles
  for (let i = 0; i < 6; i++) {
    const particle = document.createElement('span');
    particle.textContent = ['✨', '🙏', '❤️', '🌟', '🕊️'][i % 5];
    particle.style.position = 'fixed';
    const rect = btn.getBoundingClientRect();
    particle.style.left = (rect.left + rect.width / 2 + (Math.random() * 40 - 20)) + 'px';
    particle.style.top = (rect.top - 10) + 'px';
    particle.style.fontSize = '1.2rem';
    particle.style.pointerEvents = 'none';
    particle.style.transition = 'all 1s cubic-bezier(0.1, 0.8, 0.2, 1)';
    particle.style.opacity = '1';
    particle.style.zIndex = '9999';

    document.body.appendChild(particle);

    setTimeout(() => {
      particle.style.transform = `translate(${Math.random() * 60 - 30}px, -${60 + Math.random() * 40}px) scale(1.4)`;
      particle.style.opacity = '0';
    }, 20);

    setTimeout(() => {
      particle.remove();
    }, 1100);
  }

  setTimeout(() => {
    btn.classList.remove('amen-active');
  }, 2500);
}

function toggleDevotionalFav(btn) {
  try {
    let favs = JSON.parse(localStorage.getItem('amin_dev_favs') || '[]');
    const isFav = favs.includes(currentDevIdx);
    const favText = document.getElementById('favText');

    if (isFav) {
      favs = favs.filter(id => id !== currentDevIdx);
      if (btn) btn.classList.remove('active');
      if (favText) favText.textContent = 'Favorit';
    } else {
      favs.push(currentDevIdx);
      if (btn) btn.classList.add('active');
      if (favText) favText.textContent = 'Tersimpan';
    }
    localStorage.setItem('amin_dev_favs', JSON.stringify(favs));
  } catch (e) {}
}

window.shuffleDevotional = shuffleDevotional;
window.speakDevotional = speakDevotional;
window.shareDevotional = shareDevotional;
window.copyDevotional = copyDevotional;
window.switchDevotionalTab = switchDevotionalTab;
window.adjustDevotionalFontSize = adjustDevotionalFontSize;
window.toggleAudioSpeed = toggleAudioSpeed;
window.triggerAmenBurst = triggerAmenBurst;
window.toggleDevotionalFav = toggleDevotionalFav;

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
