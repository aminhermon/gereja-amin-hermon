/**
 * Renungan Harian — Client-Side Module
 * Gereja AMIN Hermon
 */
(function () {
  'use strict';

  const DATA = window.__RENUNGAN_DATA__ || [];
  const SITE = window.__SITE_URL__ || '';
  const CHURCH = window.__CHURCH_NAME__ || 'Gereja AMIN Hermon';
  if (!document.getElementById('rvFeatured')) return;

  let currentIndex = 0;
  let displayCount = 6;
  let filteredData = [];
  let currentId = null;

  const $ = (s, p) => (p || document).querySelector(s);
  const $$ = (s, p) => [...(p || document).querySelectorAll(s)];

  // ==================== HELPERS ====================
  function formatDate(d) {
    return new Date(d).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
  function shortDate(d) {
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function getSaved() {
    try { return JSON.parse(localStorage.getItem('rv_saved') || '[]'); } catch { return []; }
  }
  function isSaved(id) { return getSaved().includes(id); }
  function toggleSave(id) {
    let saved = getSaved();
    if (saved.includes(id)) { saved = saved.filter(x => x !== id); }
    else { saved.push(id); }
    localStorage.setItem('rv_saved', JSON.stringify(saved));
    return saved.includes(id);
  }

  function getReacted() {
    try { return JSON.parse(localStorage.getItem('rv_reacted') || '{}'); } catch { return {}; }
  }

  // ==================== FEATURED CARD ====================
  function renderFeatured(item) {
    if (!item) {
      $('#rvFeatured').innerHTML = '<div class="rv-empty"><p>Belum ada renungan untuk tanggal ini.</p></div>';
      return;
    }
    currentId = item.id;
    $('#rvFeaturedDate').textContent = formatDate(item.tanggal);
    $('#rvFeaturedTitle').textContent = item.judul;
    $('#rvFeaturedRef').textContent = item.ayat;
    $('#rvFeaturedQuote').textContent = item.ayatLengkap || item.kutipan || '';
    $('#rvFeaturedExcerpt').textContent = item.kutipan || (item.isi || '').substring(0, 160) + '...';

    const authorEl = $('#rvFeaturedAuthor');
    if (item.penulis) { authorEl.textContent = '✍️ ' + item.penulis; authorEl.style.display = ''; }
    else { authorEl.style.display = 'none'; }

    // Audio state
    const noAudio = $('#rvNoAudio');
    const listenBtn = $('#rvListenBtn');
    if (item.audioUrl) { noAudio.style.display = 'none'; listenBtn.style.display = ''; }
    else { noAudio.style.display = 'flex'; listenBtn.style.display = 'none'; }

    // Save state
    updateSaveBtn($('#rvSaveBtn'), item.id);

    // Date label
    $('#rvDateLabel').textContent = formatDate(item.tanggal);
  }

  function updateSaveBtn(btn, id) {
    if (isSaved(id)) {
      btn.classList.add('rv-btn--saved');
      btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="var(--gold)" stroke="var(--gold)" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg> Tersimpan';
    } else {
      btn.classList.remove('rv-btn--saved');
      btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg> Simpan';
    }
  }

  // ==================== GRID CARDS ====================
  function renderGrid(items) {
    const grid = $('#rvGrid');
    const empty = $('#rvEmptyState');
    const loadMore = $('#rvLoadMore');

    if (!items || items.length === 0) {
      grid.innerHTML = '';
      empty.style.display = 'flex';
      loadMore.style.display = 'none';
      return;
    }

    empty.style.display = 'none';
    const toShow = items.slice(0, displayCount);
    grid.innerHTML = toShow.map(r => `
      <div class="rv-card" data-id="${r.id}" tabindex="0" role="button" aria-label="Baca renungan: ${r.judul}">
        <div class="rv-card__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        </div>
        <span class="rv-card__date">${shortDate(r.tanggal)}</span>
        <h3 class="rv-card__title">${r.judul}</h3>
        <span class="rv-card__verse">${r.ayat}</span>
        <p class="rv-card__excerpt">${(r.kutipan || r.isi || '').substring(0, 100)}...</p>
        ${r.audioUrl ? '<span class="rv-card__audio-badge">🎧 Audio</span>' : ''}
        <span class="rv-card__read">Baca →</span>
      </div>
    `).join('');

    loadMore.style.display = items.length > displayCount ? 'flex' : 'none';

    // Card click handlers
    $$('.rv-card', grid).forEach(card => {
      card.addEventListener('click', () => openModal(card.dataset.id));
      card.addEventListener('keydown', e => { if (e.key === 'Enter') openModal(card.dataset.id); });
    });
  }

  // ==================== DATE NAVIGATION ====================
  function navigateDate(direction) {
    currentIndex = Math.max(0, Math.min(DATA.length - 1, currentIndex + direction));
    renderFeatured(DATA[currentIndex]);
    renderGrid(DATA.filter((_, i) => i !== currentIndex));
  }

  // ==================== CALENDAR ====================
  let calYear, calMonth;
  function initCalendar() {
    const now = DATA[0] ? new Date(DATA[0].tanggal) : new Date();
    calYear = now.getFullYear();
    calMonth = now.getMonth();
    renderCalendar();
  }

  function renderCalendar() {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    $('#rvCalTitle').textContent = months[calMonth] + ' ' + calYear;

    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const grid = $('#rvCalGrid');

    // Get dates that have renungan
    const availDates = new Set(DATA.map(r => r.tanggal));
    const todayStr = new Date().toISOString().split('T')[0];

    let html = '';
    for (let i = 0; i < firstDay; i++) html += '<span class="rv-calendar__day rv-calendar__day--empty"></span>';
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hasData = availDates.has(dateStr);
      const isToday = dateStr === todayStr;
      const cls = ['rv-calendar__day'];
      if (hasData) cls.push('rv-calendar__day--available');
      if (isToday) cls.push('rv-calendar__day--today');
      html += `<span class="${cls.join(' ')}" data-date="${dateStr}">${d}</span>`;
    }
    grid.innerHTML = html;

    // Click handler
    $$('.rv-calendar__day--available', grid).forEach(el => {
      el.addEventListener('click', () => {
        const idx = DATA.findIndex(r => r.tanggal === el.dataset.date);
        if (idx >= 0) {
          currentIndex = idx;
          renderFeatured(DATA[idx]);
          renderGrid(DATA.filter((_, i) => i !== idx));
          $('#rvCalendar').style.display = 'none';
        }
      });
    });
  }

  // ==================== SEARCH ====================
  function initSearch() {
    const input = $('#rvSearchInput');
    const clearBtn = $('#rvSearchClear');
    let debounceTimer;

    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const q = input.value.trim().toLowerCase();
        clearBtn.style.display = q ? 'flex' : 'none';

        if (!q) {
          filteredData = [];
          $('#rvSearchEmpty').style.display = 'none';
          renderGrid(DATA.filter((_, i) => i !== currentIndex));
          return;
        }

        filteredData = DATA.filter(r =>
          (r.judul || '').toLowerCase().includes(q) ||
          (r.ayat || '').toLowerCase().includes(q) ||
          (r.isi || '').toLowerCase().includes(q) ||
          (r.penulis || '').toLowerCase().includes(q) ||
          (r.kategori || '').toLowerCase().includes(q)
        );

        $('#rvSearchEmpty').style.display = filteredData.length === 0 ? 'flex' : 'none';
        renderGrid(filteredData);
      }, 250);
    });

    clearBtn.addEventListener('click', () => {
      input.value = '';
      clearBtn.style.display = 'none';
      filteredData = [];
      $('#rvSearchEmpty').style.display = 'none';
      renderGrid(DATA.filter((_, i) => i !== currentIndex));
    });
  }

  // ==================== MODAL ====================
  function openModal(id) {
    const item = DATA.find(r => r.id === id);
    if (!item) return;
    currentId = item.id;

    const modal = $('#rvModal');
    $('#rvModalTitle').textContent = item.judul;
    $('#rvModalDate').textContent = formatDate(item.tanggal);
    $('#rvModalAuthor').textContent = item.penulis || 'Anonim';
    $('#rvModalCategory').textContent = item.kategori || '';
    $('#rvModalCategory').style.display = item.kategori ? '' : 'none';
    $('#rvModalVerseRef').textContent = '📖 ' + item.ayat;
    $('#rvModalVerseText').textContent = item.ayatLengkap || '';
    $('#rvModalVerseText').style.display = item.ayatLengkap ? '' : 'none';
    $('#rvModalBody').innerHTML = '<p>' + (item.isi || '').replace(/\n/g, '</p><p>') + '</p>';

    // Optional sections
    showSection('#rvModalReflectionWrap', '#rvModalReflection', item.refleksi);
    showSection('#rvModalAppWrap', '#rvModalApp', item.aplikasi);
    showSection('#rvModalPrayerWrap', '#rvModalPrayer', item.doa);

    // Audio
    setupAudio(item.audioUrl);

    // Save button
    updateSaveBtn($('#rvModalSave'), item.id);

    // Reactions
    const r = item.reactions || { blessed: 0, amin: 0, strengthened: 0 };
    $('#rvReactBlessed').textContent = r.blessed || 0;
    $('#rvReactAmin').textContent = r.amin || 0;
    $('#rvReactStrength').textContent = r.strengthened || 0;

    // Update reaction button states
    const reacted = getReacted();
    $$('.rv-reaction').forEach(btn => {
      btn.classList.toggle('rv-reaction--active', reacted[item.id] === btn.dataset.type);
    });

    // Related
    renderRelated(item);

    // Show modal
    modal.classList.add('rv-modal--open');
    document.body.style.overflow = 'hidden';
    modal.querySelector('.rv-modal__content').scrollTop = 0;
  }

  function closeModal() {
    const modal = $('#rvModal');
    modal.classList.remove('rv-modal--open');
    document.body.style.overflow = '';
    // Stop audio
    const audio = $('#rvAudioEl');
    if (audio) { audio.pause(); audio.currentTime = 0; }
    resetAudioUI();
  }

  function showSection(wrapSel, contentSel, text) {
    const wrap = $(wrapSel);
    const content = $(contentSel);
    if (text) { content.textContent = text; wrap.style.display = ''; }
    else { wrap.style.display = 'none'; }
  }

  // ==================== AUDIO PLAYER ====================
  function setupAudio(url) {
    const wrap = $('#rvAudioWrap');
    const noAudio = $('#rvModalNoAudio');
    const audio = $('#rvAudioEl');

    if (!url) {
      wrap.style.display = 'none';
      noAudio.style.display = 'flex';
      return;
    }

    wrap.style.display = '';
    noAudio.style.display = 'none';
    audio.src = url;
    resetAudioUI();
  }

  function resetAudioUI() {
    const playIcon = $('.rv-audio__icon-play');
    const pauseIcon = $('.rv-audio__icon-pause');
    if (playIcon) playIcon.style.display = '';
    if (pauseIcon) pauseIcon.style.display = 'none';
    const bar = $('#rvAudioBar');
    if (bar) bar.style.width = '0%';
    const cur = $('#rvAudioCurrent');
    const dur = $('#rvAudioDuration');
    if (cur) cur.textContent = '0:00';
    if (dur) dur.textContent = '0:00';
  }

  function initAudioPlayer() {
    const audio = $('#rvAudioEl');
    const playBtn = $('#rvAudioPlay');
    const progressWrap = $('#rvAudioProgress');
    const bar = $('#rvAudioBar');
    const curEl = $('#rvAudioCurrent');
    const durEl = $('#rvAudioDuration');
    const volEl = $('#rvAudioVolume');
    if (!audio || !playBtn) return;

    function fmtTime(s) {
      if (isNaN(s)) return '0:00';
      const m = Math.floor(s / 60);
      const sec = Math.floor(s % 60);
      return m + ':' + String(sec).padStart(2, '0');
    }

    playBtn.addEventListener('click', () => {
      if (audio.paused) { audio.play().catch(() => {}); }
      else { audio.pause(); }
    });

    audio.addEventListener('play', () => {
      $('.rv-audio__icon-play').style.display = 'none';
      $('.rv-audio__icon-pause').style.display = '';
    });
    audio.addEventListener('pause', () => {
      $('.rv-audio__icon-play').style.display = '';
      $('.rv-audio__icon-pause').style.display = 'none';
    });
    audio.addEventListener('timeupdate', () => {
      if (audio.duration) {
        bar.style.width = (audio.currentTime / audio.duration * 100) + '%';
        curEl.textContent = fmtTime(audio.currentTime);
      }
    });
    audio.addEventListener('loadedmetadata', () => {
      durEl.textContent = fmtTime(audio.duration);
    });

    progressWrap.addEventListener('click', e => {
      if (audio.duration) {
        const rect = progressWrap.getBoundingClientRect();
        audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
      }
    });

    volEl.addEventListener('input', () => { audio.volume = volEl.value; });
  }

  // ==================== REACTIONS ====================
  function initReactions() {
    $$('.rv-reaction').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!currentId) return;
        const type = btn.dataset.type;

        // Check if already reacted
        const reacted = getReacted();
        if (reacted[currentId]) return; // Already reacted to this one

        try {
          const res = await fetch(`/api/renungan/${currentId}/react`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type })
          });
          const data = await res.json();
          if (data.success) {
            $('#rvReactBlessed').textContent = data.reactions.blessed || 0;
            $('#rvReactAmin').textContent = data.reactions.amin || 0;
            $('#rvReactStrength').textContent = data.reactions.strengthened || 0;

            // Save reaction state
            reacted[currentId] = type;
            localStorage.setItem('rv_reacted', JSON.stringify(reacted));

            // Update UI
            $$('.rv-reaction').forEach(b => b.classList.remove('rv-reaction--active'));
            btn.classList.add('rv-reaction--active');

            // Also update in local DATA
            const item = DATA.find(r => r.id === currentId);
            if (item) item.reactions = data.reactions;
          }
        } catch (e) { /* silent */ }
      });
    });
  }

  // ==================== SHARE ====================
  function initShare() {
    // Featured share button
    const shareBtn = $('#rvShareBtn');
    const dropdown = $('#rvShareDropdown');

    shareBtn.addEventListener('click', e => {
      e.stopPropagation();
      const rect = shareBtn.getBoundingClientRect();
      dropdown.style.top = (rect.bottom + 8) + 'px';
      dropdown.style.left = rect.left + 'px';
      dropdown.style.display = dropdown.style.display === 'none' ? 'flex' : 'none';
    });

    document.addEventListener('click', () => { dropdown.style.display = 'none'; });

    // WhatsApp share
    const shareWA = (item) => {
      const msg = encodeURIComponent(`🙏 Renungan Harian ${CHURCH}\n\n*${item.judul}*\n\n📖 ${item.ayat}\n"${item.ayatLengkap || item.kutipan || ''}"\n\nBaca selengkapnya:\n${SITE}/renungan.html`);
      window.open('https://wa.me/?text=' + msg, '_blank');
    };

    const shareFB = () => {
      window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(SITE + '/renungan.html'), '_blank');
    };

    const copyLink = () => {
      navigator.clipboard.writeText(SITE + '/renungan.html').then(() => {
        alert('Link berhasil disalin!');
      }).catch(() => {});
    };

    // Dropdown items
    $('#rvShareWA').addEventListener('click', () => { const item = DATA[currentIndex]; if (item) shareWA(item); });
    $('#rvShareFB2').addEventListener('click', shareFB);
    $('#rvShareCopy').addEventListener('click', copyLink);

    // Modal share buttons
    $('#rvModalShareWA').addEventListener('click', () => { const item = DATA.find(r => r.id === currentId); if (item) shareWA(item); });
    $('#rvModalShareFB').addEventListener('click', shareFB);
    $('#rvModalCopyLink').addEventListener('click', copyLink);
  }

  // ==================== RELATED ====================
  function renderRelated(item) {
    const wrap = $('#rvRelatedWrap');
    const grid = $('#rvRelatedGrid');

    // Find related: same category or random
    let related = DATA.filter(r => r.id !== item.id && r.kategori && r.kategori === item.kategori).slice(0, 3);
    if (related.length < 3) {
      const others = DATA.filter(r => r.id !== item.id && !related.includes(r));
      related = related.concat(others.slice(0, 3 - related.length));
    }

    if (related.length === 0) { wrap.style.display = 'none'; return; }
    wrap.style.display = '';

    grid.innerHTML = related.map(r => `
      <div class="rv-related__card" data-id="${r.id}" tabindex="0" role="button">
        <span class="rv-related__card-date">${shortDate(r.tanggal)}</span>
        <h4 class="rv-related__card-title">${r.judul}</h4>
        <span class="rv-related__card-verse">${r.ayat}</span>
      </div>
    `).join('');

    $$('.rv-related__card', grid).forEach(card => {
      card.addEventListener('click', () => openModal(card.dataset.id));
    });
  }

  // ==================== INIT ====================
  function init() {
    if (DATA.length === 0) {
      $('#rvFeatured').innerHTML = '<div class="rv-empty" style="display:flex;"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg><p>Belum ada renungan harian yang tersedia.</p></div>';
      return;
    }

    // Render featured (first = latest)
    renderFeatured(DATA[0]);
    renderGrid(DATA.slice(1));
    initCalendar();
    initSearch();
    initAudioPlayer();
    initReactions();
    initShare();

    // Date navigation
    $('#rvPrevBtn').addEventListener('click', () => navigateDate(1));
    $('#rvNextBtn').addEventListener('click', () => navigateDate(-1));

    // Calendar toggle
    $('#rvCalendarBtn').addEventListener('click', () => {
      const cal = $('#rvCalendar');
      cal.style.display = cal.style.display === 'none' ? '' : 'none';
    });
    $('#rvCalPrev').addEventListener('click', () => { calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; } renderCalendar(); });
    $('#rvCalNext').addEventListener('click', () => { calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; } renderCalendar(); });

    // Read button -> open modal
    $('#rvReadBtn').addEventListener('click', () => { if (DATA[currentIndex]) openModal(DATA[currentIndex].id); });

    // Listen button -> open modal and focus audio
    $('#rvListenBtn').addEventListener('click', () => {
      if (DATA[currentIndex]) {
        openModal(DATA[currentIndex].id);
        setTimeout(() => {
          const audioWrap = $('#rvAudioWrap');
          if (audioWrap) audioWrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 400);
      }
    });

    // Save buttons
    $('#rvSaveBtn').addEventListener('click', () => {
      if (DATA[currentIndex]) {
        toggleSave(DATA[currentIndex].id);
        updateSaveBtn($('#rvSaveBtn'), DATA[currentIndex].id);
      }
    });
    $('#rvModalSave').addEventListener('click', () => {
      if (currentId) {
        toggleSave(currentId);
        updateSaveBtn($('#rvModalSave'), currentId);
        updateSaveBtn($('#rvSaveBtn'), currentId);
      }
    });

    // Modal close
    $('#rvModalClose').addEventListener('click', closeModal);
    $('#rvModalBackdrop').addEventListener('click', closeModal);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

    // Load more
    $('#rvLoadMoreBtn').addEventListener('click', () => {
      displayCount += 6;
      const items = filteredData.length > 0 ? filteredData : DATA.filter((_, i) => i !== currentIndex);
      renderGrid(items);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
