// Global state — these are the single source of truth (map.js reads them via arguments)
var PROJECTS = [];
var METADATA = { usStates: [], caProvinces: [], steelTypes: [], buildingTypes: [] };
var currentCategory = 'All';
var currentCountry  = 'us';
var editingProjectId = null;
var uploadedImages   = [];
var uploadedVideo    = '';
var uploadedModel    = '';
var fileMap          = new Map();

// ============================================================
// CUSTOM CURSOR
// ============================================================
function initCustomCursor() {
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;
  window.addEventListener('mousemove', (e) => {
    dot.style.left = e.clientX + 'px';
    dot.style.top  = e.clientY + 'px';
    ring.style.left = e.clientX + 'px';
    ring.style.top  = e.clientY + 'px';
  });
  window.addEventListener('mousedown', () => dot.classList.add('clicking'));
  window.addEventListener('mouseup',   () => dot.classList.remove('clicking'));
  document.querySelectorAll('a, button, .state, .proj-card, .toggle-btn, .cat-chip, input, select, textarea').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
  });
}

// ============================================================
// THEME TOGGLE
// ============================================================
function initThemeToggle() {
  const btn = document.getElementById('dntToggle');
  if (!btn) return;
  if (localStorage.getItem('steeltrack_theme') === 'dark') {
    document.body.classList.add('dark-mode');
  }
  btn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('steeltrack_theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
  });
}

// ============================================================
// API HELPER
// ============================================================
async function apiFetch(url, options = {}) {
  const headers = {
    'Authorization': 'Bearer ' + (sessionStorage.getItem('steeltrack_admin_token') || '')
  };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (options.headers) {
    Object.assign(headers, options.headers);
    delete options.headers;
  }
  const res = await fetch('/api' + url, {
    headers,
    ...options
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'API error ' + res.status);
  }
  return res.json();
}

// ============================================================
// LOAD DATA & RENDER MAP
// ============================================================
async function fetchAppInitialData() {
  try {
    const [meta, proj] = await Promise.all([
      apiFetch('/metadata'),
      apiFetch('/projects')
    ]);
    METADATA = meta;
    PROJECTS = proj.projects || [];

    // Populate dropdowns and checkboxes
    const catSel = document.getElementById('f-category');
    if (catSel) catSel.innerHTML = (window.CONFIG?.CATEGORIES || []).filter(c => c !== 'All').map(c => `<option value="${c}">${c}</option>`).join('');
    
    const typeContainer = document.getElementById('f-type-checkboxes');
    if (typeContainer && METADATA.steelTypes) {
      typeContainer.innerHTML = METADATA.steelTypes.map(t => `
        <label class="custom-checkbox">
          <input type="checkbox" value="${t}">
          <span class="checkmark"></span>
          <span class="cb-label">${t}</span>
        </label>
      `).join('');
    }

    renderCategoryChips();
    renderMap();
  } catch (e) {
    console.error('Init error:', e);
    // Still render chips and try map with empty projects
    renderCategoryChips();
    renderMap();
  }
}

function renderMap() {
  if (window.MapModule) {
    window.MapModule.loadMapData(() => {
      window.MapModule.drawMap(PROJECTS, currentCategory, currentCountry);
    });
  }
}

// ============================================================
// CATEGORY CHIPS
// ============================================================
function renderCategoryChips() {
  const row = document.getElementById('categoryChipRow');
  if (!row) return;
  const cats = window.CONFIG?.CATEGORIES || ['All'];
  row.innerHTML = cats.map(c =>
    `<button class="cat-chip ${c === currentCategory ? 'active' : ''}" data-cat="${c}">${c}</button>`
  ).join('');
  row.querySelectorAll('.cat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      currentCategory = chip.dataset.cat;
      renderCategoryChips();
      if (window.MapModule) window.MapModule.drawMap(PROJECTS, currentCategory, currentCountry);
      closePanel();
    });
  });
}

// ============================================================
// NAVIGATION & AUTH
// ============================================================
function setupNavigation() {
  document.getElementById('navHome')?.addEventListener('click', (e) => { e.preventDefault(); goToMap(); });
  document.getElementById('navMapBtn')?.addEventListener('click', (e) => { e.preventDefault(); goToMap(); });
  document.getElementById('backHome')?.addEventListener('click', () => goToMap());

  // ── Back to Top Button ─────────────────────────────
  const bttBtn = document.getElementById('backToTopBtn');
  if (bttBtn) {
    const checkScroll = (val) => {
      if (val > 300) {
        bttBtn.style.opacity = '1';
        bttBtn.style.pointerEvents = 'auto';
      } else {
        bttBtn.style.opacity = '0';
        bttBtn.style.pointerEvents = 'none';
      }
    };
    document.querySelectorAll('.view').forEach(container => {
      container.addEventListener('scroll', (e) => checkScroll(e.target.scrollTop));
    });
    const panel = document.getElementById('panel');
    if (panel) panel.addEventListener('scroll', (e) => checkScroll(e.target.scrollTop));
    window.addEventListener('scroll', () => checkScroll(window.scrollY));

    bttBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.querySelectorAll('.view').forEach(c => c.scrollTo({ top: 0, behavior: 'smooth' }));
      if (panel) panel.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── New nav buttons ──────────────────────────────────
  document.getElementById('navBrochureDlInput')?.addEventListener('change', (e) => {
    if (e.target.checked) {
      const a = document.createElement('a');
      a.href = 'assets/docs/brochure.pdf';
      a.download = 'Brainstorm_Infotech_Brochure.pdf';
      a.click();
      setTimeout(() => { e.target.checked = false; }, 4000); // Reset animation after it finishes
    }
  });
  let drawingsLoaded = false;
  document.getElementById('navDrawingsBtn')?.addEventListener('click', () => {
    showView('drawings');
    if (!drawingsLoaded) {
      loadDrawingsData();
    } else {
      setupDrawingsFilter();
    }
  });

  function loadDrawingsData() {
    fetch('/drawings_data.json')
      .then(res => res.json())
      .then(data => {
        renderDrawingsGallery(data);
        drawingsLoaded = true;
        setupDrawingsFilter();
      })
      .catch(err => console.error('Failed to load drawings data:', err));
  }

  function getIconForCategory(cat) {
    const icons = {
      'misc': '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>',
      'usa': '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>',
      'canada': '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
      'quebec': '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>',
      'uae': '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>'
    };
    return icons[cat] || '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>';
  }

  function getGradientForCategory(cat) {
    const grads = {
      'misc': 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)',
      'usa': 'linear-gradient(135deg, #141E30 0%, #243B55 100%)',
      'canada': 'linear-gradient(135deg, #c31432 0%, #240b36 100%)',
      'quebec': 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
      'uae': 'linear-gradient(135deg, #ff4b1f 0%, #ff9068 100%)'
    };
    return grads[cat] || 'linear-gradient(135deg, #37474f, #102027)';
  }

  window.cachedDrawingsData = null;

  function renderDrawingsGallery(data) {
    cachedDrawingsData = data;
    renderFolders();
    
    // Set up back button
    document.getElementById('btnBackToFolders')?.addEventListener('click', () => {
      renderFolders();
    });
  }

  function renderFolders() {
    window.renderFolders = renderFolders;
    const gallery = document.getElementById('drawingsGallery');
    const breadcrumb = document.getElementById('drawingsBreadcrumbRow');
    if (!gallery) return;
    
    breadcrumb.style.display = 'none';
    let html = '';
    
    const regionIcons = {
      misc: `<polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 12 12 17 22 12"></polyline><polyline points="2 17 12 22 22 17"></polyline>`,
      canada: `<path d="M 4 8 L 4 3 L 8 2 L 10 4 C 11 5, 12 5, 13 3 L 15 2 L 18 3 C 20 4, 22 5, 21 7 L 18 7 L 14 9 L 11 8 Z"></path>`,
      quebec: `<path d="M 7 16 L 6 9 L 10 6 L 15 4 L 17 8 L 20 9 L 17 14 L 13 12 L 9 17 Z"></path>`,
      usa: `<path d="M 4 8 L 11 8 L 14 9 L 18 7 L 20 6 C 21 9, 19 11, 18 12 L 18 16 C 17 17, 16 17, 15 13 C 14 15, 12 15, 11 18 L 8 15 C 6 16, 4 15, 4 14 C 2 12, 3 9, 4 8 Z"></path>`,
      uae: `<path d="M 18 6 L 16 10 C 12 10 8 12 4 14 L 6 18 L 14 16 L 18 12 L 20 8 Z"></path>`
    };
    
    for (const catKey in cachedDrawingsData) {
      const categoryData = cachedDrawingsData[catKey];
      const iconPaths = regionIcons[catKey] || `<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>`;
      
      html += `
      <div class="drawing-folder-card card" data-cat="${catKey}" style="cursor:pointer;">
        <div class="content">
          <div class="flip-front">
            <div class="flip-front-content">
              <div class="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  ${iconPaths}
                </svg>
              </div>
              <p class="heading">${categoryData.title}</p>
            </div>
          </div>
          
          <div class="flip-back">
            <div class="img">
              <div class="circle"></div>
              <div class="circle" id="right"></div>
              <div class="circle" id="bottom"></div>
            </div>
            <div class="flip-back-content">
              <div class="description">
                <div class="title">
                  <p class="title">
                    <strong>${categoryData.title}</strong>
                  </p>
                </div>
                <p class="para" style="margin-top: 10px;">
                  Explore <strong>${categoryData.files.length}</strong> sample drawing files in this category. Click to view or download the detailed PDFs.
                </p>
                <button class="btn" style="margin-top: 15px;">
                  View Drawings
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      `;
    }
    
    gallery.innerHTML = html;
    
    // Add click listeners to folders
    document.querySelectorAll('.drawing-folder-card').forEach(card => {
      card.addEventListener('click', function() {
        const cat = this.dataset.cat;
        renderFolderContents(cat);
      });
    });
  }

  function renderFolderContents(catKey) {
    window.renderFolderContents = renderFolderContents;
    const gallery = document.getElementById('drawingsGallery');
    const breadcrumb = document.getElementById('drawingsBreadcrumbRow');
    const categoryData = cachedDrawingsData[catKey];
    
    if (!gallery || !categoryData) return;
    
    breadcrumb.style.display = 'flex';
    document.getElementById('currentFolderName').textContent = categoryData.title;
    
    let html = '';
    
    categoryData.files.forEach(file => {
      html += `
      <div class="proj-card drawing-card" style="cursor:pointer;padding:0;overflow:hidden;border:1px solid var(--line);background:var(--bg);transition:all 0.3s ease;" onclick="window.open('/${file.path}', '_blank')">
        <div class="dc-cover" style="position:relative;height:160px;background:${getGradientForCategory(catKey)};overflow:hidden;display:flex;align-items:center;justify-content:center;">
          <!-- Subtle dot pattern overlay -->
          <div style="position:absolute;inset:0;opacity:0.25;background-image:radial-gradient(#ffffff 1px, transparent 1px);background-size:16px 16px;"></div>
          <!-- Glassmorphic Icon Box -->
          <div style="position:relative;z-index:2;width:64px;height:64px;background:rgba(255,255,255,0.15);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.3);border-radius:18px;display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 8px 32px rgba(0,0,0,0.15);transition:transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
            ${getIconForCategory(catKey)}
          </div>
          <!-- Hover overlay gradient -->
          <div class="dc-hover-overlay" style="position:absolute;inset:0;background:linear-gradient(to top, rgba(0,0,0,0.6), transparent);opacity:0;transition:opacity 0.3s ease;display:flex;align-items:flex-end;justify-content:center;padding-bottom:16px;color:#fff;font-size:13px;font-weight:600;letter-spacing:1px;">
            VIEW PDF
          </div>
        </div>
        <div style="padding:24px;">
          <div class="p-eyebrow" style="color:var(--accent);font-weight:700;letter-spacing:1px;margin-bottom:8px;font-size:11px;">${categoryData.title.toUpperCase()}</div>
          <div class="pc-title" style="font-size:17px;font-weight:700;color:var(--ink);margin-bottom:12px;line-height:1.4;">${file.name}</div>
          
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--sub)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <span class="pc-meta" style="color:var(--sub);font-size:13px;font-weight:500;margin:0;">PDF Document</span>
          </div>
          
          <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--line);padding-top:16px;">
            <span class="badge" style="background:var(--gray-50);color:var(--sub);border:1px solid var(--line);padding:4px 10px;font-weight:600;">${file.tag}</span>
            <span class="dc-arrow" style="color:var(--accent);transform:translateX(-4px);transition:transform 0.3s ease;opacity:0;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </span>
          </div>
        </div>
      </div>
      `;
    });
    
    gallery.innerHTML = html;
  }

  function setupDrawingsFilter() {
    // No longer needed as we use folder navigation instead of toggle tabs
  }

  const loginBtn  = document.getElementById('navLoginBtn');
  const logoutBtn = document.getElementById('navLogoutBtn');
  const adminBtn  = document.getElementById('navAdminBtn');

  function updateAuthUI(loggedIn) {
    if (loginBtn)  loginBtn.style.display  = loggedIn ? 'none' : '';
    if (logoutBtn) logoutBtn.style.display = loggedIn ? '' : 'none';
    if (adminBtn)  adminBtn.style.display  = loggedIn ? '' : 'none';
  }

  // Restore login state
  if (sessionStorage.getItem('steeltrack_admin_token')) updateAuthUI(true);

  loginBtn?.addEventListener('click', () => {
    if (sessionStorage.getItem('steeltrack_admin_token')) {
      renderAdmin(); showView('admin');
    } else {
      showView('login');
    }
  });

  adminBtn?.addEventListener('click', () => { renderAdmin(); showView('admin'); });

  logoutBtn?.addEventListener('click', () => {
    sessionStorage.removeItem('steeltrack_admin_token');
    sessionStorage.removeItem('steeltrack_is_superadmin');
    updateAuthUI(false);
    showView('map');
  });

  // Login form submit
  document.getElementById('loginSubmit')?.addEventListener('click', async () => {
    const u = document.getElementById('loginUser').value.trim();
    const p = document.getElementById('loginPass').value.trim();
    const errEl = document.getElementById('loginError');
    try {
      const data = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ username: u, password: p }) });
      if (data.success && data.token) {
        sessionStorage.setItem('steeltrack_admin_token', data.token);
        if (data.user && data.user.isSuperAdmin) {
          sessionStorage.setItem('steeltrack_is_superadmin', 'true');
        } else {
          sessionStorage.removeItem('steeltrack_is_superadmin');
        }
        if (errEl) errEl.style.display = 'none';
        updateAuthUI(true);
        renderAdmin();
        showView('admin');
      }
    } catch (err) {
      if (errEl) { errEl.textContent = err.message || 'Invalid credentials.'; errEl.style.display = 'block'; }
    }
  });

  // Allow Enter key on login
  document.getElementById('loginPass')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('loginSubmit')?.click();
  });

  // Country toggle
  document.querySelectorAll('.min-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.min-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCountry = btn.dataset.country;
      
      var minSlider = document.getElementById('minSlider');
      var heroPill = document.getElementById('heroPill');
      var heroHighlight = document.getElementById('heroCountryHighlight');
      
      if (currentCountry === 'ca' || currentCountry === 'Canada') {
        if (minSlider) minSlider.classList.add('ca');
        if (heroPill) { heroPill.classList.remove('usa'); heroPill.classList.add('ca'); }
        if (heroHighlight) { heroHighlight.className = 'highlight-ca'; heroHighlight.textContent = 'Canada'; }
      } else {
        if (minSlider) minSlider.classList.remove('ca');
        if (heroPill) { heroPill.classList.remove('ca'); heroPill.classList.add('usa'); }
        if (heroHighlight) { heroHighlight.className = 'highlight-usa'; heroHighlight.textContent = 'the USA'; }
      }

      if (window.MapModule) window.MapModule.drawMap(PROJECTS, currentCategory, currentCountry);
    });
  });

  // Panel & detail overlay close
  document.getElementById('panelClose')?.addEventListener('click', closePanel);
  document.getElementById('overlay')?.addEventListener('click', closePanel);
}

// ============================================================
// VIEW ROUTING & UI STATE
// ============================================================
function updateAdminBtnVisibility() {
  const adminBtn = document.querySelector('.secret-admin-trigger');
  if (!adminBtn) return;
  const isMapActive = document.getElementById('view-map')?.classList.contains('active');
  const isPanelOpen = document.getElementById('panel')?.classList.contains('open');
  const isDetailOpen = document.getElementById('detailOverlay')?.classList.contains('open');

  if (isMapActive && !isPanelOpen && !isDetailOpen) {
    adminBtn.style.display = 'flex';
  } else {
    adminBtn.style.display = 'none';
  }
}

function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById('view-' + name);
  if (target) target.classList.add('active');
  updateAdminBtnVisibility();
}

function goToMap() {
  showView('map');
  const panel = document.getElementById('panel');
  if (panel) panel.classList.remove('open');
  const overlay = document.getElementById('overlay');
  if (overlay) overlay.classList.remove('open');
  const detailOverlay = document.getElementById('detailOverlay');
  if (detailOverlay) detailOverlay.classList.remove('open');
  updateAdminBtnVisibility();
  
  const card = document.querySelector('.map-card');
  if (card) {
    card.classList.remove('map-slide-in');
    void card.offsetWidth;
    card.classList.add('map-slide-in');
    setTimeout(() => {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  }
}

function closePanel() {
  document.getElementById('overlay')?.classList.remove('open');
  document.getElementById('panel')?.classList.remove('open');
  updateAdminBtnVisibility();
}

// ============================================================
// PROJECT DETAIL VIEW
// ============================================================
window.openDetail = function(id) {
  const p = PROJECTS.find(x => x.id === id);
  if (!p) return;

  const hero = document.getElementById('detailHero');
  const heroWrap = document.querySelector('.detail-hero-img-wrap');
  if (hero && heroWrap) {
    if (p.images && p.images[0]) {
      hero.decoding = 'async';
      hero.src = p.images[0];
      heroWrap.style.display = 'block';
    } else {
      heroWrap.style.display = 'none';
    }
  }

  let prevBtnHtml = '';
  let nextBtnHtml = '';
  if (window.currentRegionProjects && window.currentRegionProjects.length > 1) {
    const idx = window.currentRegionProjects.indexOf(id);
    let prevId = idx > 0 ? window.currentRegionProjects[idx - 1] : null;
    let nextId = (idx !== -1 && idx < window.currentRegionProjects.length - 1) ? window.currentRegionProjects[idx + 1] : null;
    
    if (prevId) {
      prevBtnHtml = `<button class="detail-nav-arrow prev" onclick="window.openDetail('${prevId}')">
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>`;
    }
    if (nextId) {
      nextBtnHtml = `<button class="detail-nav-arrow next" onclick="window.openDetail('${nextId}')">
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>`;
    }
  }
  
  const navRow = document.getElementById('detailNavRow');
  if (navRow) navRow.innerHTML = prevBtnHtml + nextBtnHtml;

  const eyebrow = document.getElementById('detailEyebrow');
  if (eyebrow) {
    eyebrow.innerHTML = '';
    eyebrow.style.display = 'none';
  }
  
  const rawTypes = p.type || p.category || 'PROJECT';
  const typeArray = rawTypes.split(',').map(s => s.trim()).filter(Boolean);
  let badgesHtml = '';
  if (typeArray.length > 3) {
    const shown = typeArray.slice(0, 3);
    const hiddenCount = typeArray.length - 3;
    badgesHtml = shown.map(s => `<span class="hero-badge" style="color:#4b5563; border-color:#e5e7eb; background:#f9fafb; font-size:12px;">${s}</span>`).join('') + 
                 `<span class="hero-badge" style="background:var(--accent); border-color:var(--accent); font-size:12px; color:white;">+${hiddenCount} MORE</span>`;
  } else {
    badgesHtml = typeArray.map(s => `<span class="hero-badge" style="color:#4b5563; border-color:#e5e7eb; background:#f9fafb; font-size:12px;">${s}</span>`).join('');
  }
  const inlineBadges = `<div class="hero-badges" style="max-width: 100%; margin: 32px 0 0 0; justify-content: flex-start; flex-wrap: wrap; gap: 8px;">${badgesHtml}</div>`;

  const titleHero = document.getElementById('detailTitleHero');
  if (titleHero) titleHero.textContent = p.title;

  const locHero = document.getElementById('detailLocHero');
  if (locHero) locHero.innerHTML = ''; 

  const wrap = document.getElementById('detailWrap');
  if (wrap) {
    wrap.innerHTML = `
      <div class="premium-kpi-grid">
        <div class="pkpi-card">
          <div class="pkpi-icon">
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="var(--accent)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </div>
          <div class="pkpi-info">
            <div class="pkpi-lbl">COMPLETION YEAR</div>
            <div class="pkpi-val">${p.year || 'N/A'}</div>
          </div>
        </div>
        <div class="pkpi-card">
          <div class="pkpi-icon">
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="var(--accent)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <div class="pkpi-info">
            <div class="pkpi-lbl">STEEL TONNAGE</div>
            <div class="pkpi-val">${(p.tons || 0).toLocaleString()} <span style="font-size:14px;color:var(--sub);font-weight:600;">Tons</span></div>
          </div>
        </div>
        <div class="pkpi-card">
          <div class="pkpi-icon">
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="var(--accent)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          </div>
          <div class="pkpi-info">
            <div class="pkpi-lbl">LOCATION</div>
            <div class="pkpi-val">${p.state}, ${p.country === 'US' ? 'USA' : 'CAN'}</div>
          </div>
        </div>
      </div>
      
      ${p.modelUrl ? `
          <div class="detail-model-section">
            <div class="model-header">
              <h3>Interactive 3D Structural View</h3>
            </div>
            <div class="model-container" id="mv-container-${p.id}" style="min-height: 500px; display: flex; align-items: center; justify-content: center; position: relative; background: #0f0f11;">
              
              <!-- Manual Trigger Overlay -->
              <div id="mv-trigger-${p.id}" style="position: absolute; inset: 0; z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center; background: radial-gradient(circle at center, #1a1a20 0%, #000 100%); cursor: pointer; transition: opacity 0.3s;">
                <div style="width: 80px; height: 80px; border-radius: 50%; background: rgba(10, 107, 204, 0.15); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; border: 1px solid rgba(10, 107, 204, 0.3); box-shadow: 0 0 30px rgba(10, 107, 204, 0.2);">
                  <svg viewBox="0 0 24 24" width="32" height="32" stroke="var(--accent)" stroke-width="2" fill="none" style="margin-left: 4px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                </div>
                <div style="font-size: 16px; font-weight: 700; color: white; letter-spacing: 1px; text-transform: uppercase;">Launch 3D Engine</div>
                <div style="font-size: 13px; color: #a1a1aa; margin-top: 8px;">(High-Performance BIM Viewer)</div>
              </div>

              <!-- Loading State -->
              <div class="model-loading-bar" id="mv-bar-${p.id}" style="position: absolute; inset: 0; height: 100%; display: none; flex-direction: column; background: #0f0f11; z-index: 9;">
                <div class="model-loading-text" id="mv-text-${p.id}" style="margin-bottom: 24px; font-size: 15px; color: white;">Initializing 3D Engine...</div>
                <div style="width: 250px; height: 6px; background: rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden; position: relative;">
                  <div class="model-loading-fill" id="mv-fill-${p.id}" style="position: absolute; left: 0; top: 0; height: 100%; width: 0%; background: var(--accent); transition: width 0.3s ease;"></div>
                </div>
              </div>

              <div class="model-hint" style="position: absolute; bottom: 12px; z-index: 5;">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.23-9.58l-5.11 5.11"></path></svg>
                Drag to orbit • Scroll to zoom
              </div>
            </div>
          </div>
        ` : ''}
          ${p.images && p.images.length > 1 ? `<div class="detail-gallery">${p.images.slice(1).map(img => `<img loading="lazy" decoding="async" src="${img}" onclick="this.requestFullscreen&&this.requestFullscreen()">`).join('')}</div>` : ''}
          ${inlineBadges}
          <div class="detail-section"><h3>Project Overview</h3><p style="white-space: pre-wrap;">${(p.description || 'No description provided.').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p></div>
          ${p.video ? `<div class="detail-video">${renderVideo(p.video)}</div>` : ''}
      `;
    }
    
    // Attach 3D Model Manual Trigger Logic
    setTimeout(() => {
      const container = document.getElementById(`mv-container-${p.id}`);
      const trigger = document.getElementById(`mv-trigger-${p.id}`);
      
      if (container && trigger && p.modelUrl) {
        trigger.addEventListener('click', () => {
          trigger.style.opacity = '0';
          setTimeout(() => trigger.style.display = 'none', 300);
          
          const fill = document.getElementById(`mv-fill-${p.id}`);
          const text = document.getElementById(`mv-text-${p.id}`);
          const bar = document.getElementById(`mv-bar-${p.id}`);
          
          if (bar) bar.style.display = 'flex';
          if (text) text.textContent = 'Downloading massive 3D Data...';
          
          const mv = document.createElement('model-viewer');
          mv.id = `viewer-${p.id}`;
          mv.src = p.modelUrl;
          mv.setAttribute('loading', 'eager');
          mv.setAttribute('auto-rotate', '');
          mv.setAttribute('camera-controls', '');
          mv.setAttribute('exposure', '1.2');
          mv.setAttribute('shadow-intensity', '1');
          mv.setAttribute('alt', 'Interactive 3D Structural Model');
          mv.style.position = 'absolute';
          mv.style.inset = '0';
          mv.style.width = '100%';
          mv.style.height = '100%';
          mv.style.zIndex = '1';

          mv.addEventListener('progress', (e) => {
            const percent = Math.round(e.detail.totalProgress * 100);
            if (fill) fill.style.width = percent + '%';
            if (text) {
              if (percent < 100) {
                text.textContent = `Downloading 3D Data... ${percent}%`;
              } else {
                text.textContent = `Parsing 3D geometry... (Browser will pause for a moment)`;
              }
            }
          });

          mv.addEventListener('load', () => {
            if (bar) {
              bar.style.opacity = '0';
              setTimeout(() => bar.style.display = 'none', 300);
            }
          });

          mv.addEventListener('error', (e) => {
            console.error('Model-viewer error:', e);
            if (text) text.textContent = 'Error loading 3D model (File may be corrupt)';
            if (fill) fill.style.background = '#d32f2f';
          });

          // Inject the model viewer, causing the heavy load
          container.appendChild(mv);
        });
      }
    }, 50);


  document.getElementById('detailOverlay')?.scrollTo({ top: 0, behavior: 'instant' });
  document.getElementById('detailOverlay')?.classList.add('open');
  updateAdminBtnVisibility();
};

document.getElementById('detailClose')?.addEventListener('click', () => {
  document.getElementById('detailOverlay')?.classList.remove('open');
  updateAdminBtnVisibility();
});

function renderVideo(v) {
  if (!v) return '';
  if (v.includes('youtube.com') || v.includes('youtu.be')) {
    let vid = v.split('v=')[1] || v.split('/').pop();
    vid = vid ? vid.split('&')[0] : '';
    return `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${vid}" frameborder="0" allowfullscreen style="border-radius:16px;"></iframe>`;
  }
  return `<video src="${v}" controls style="width:100%;border-radius:16px;"></video>`;
}

// ============================================================
// ADMIN DASHBOARD
// ============================================================
function renderAdmin() {
  const isSuperAdmin = sessionStorage.getItem('steeltrack_is_superadmin') === 'true';
  const title = document.getElementById('adminPageTitle');
  if (title) {
    title.textContent = isSuperAdmin ? 'Super Atlas Admin Dashboard' : 'Atlas Admin Dashboard';
  }
  const manageAdminsBtn = document.getElementById('navManageAdminsBtn');
  if (manageAdminsBtn) {
    manageAdminsBtn.style.display = isSuperAdmin ? '' : 'none';
  }

  const statsRow = document.getElementById('adminStatsRow');
  if (statsRow) {
    const stateCount = new Set(PROJECTS.map(p => p.state)).size;
    const activeCount = PROJECTS.filter(p => p.status === 'Active').length;
    const totalTons = PROJECTS.reduce((a, p) => a + (p.tons || 0), 0);
    statsRow.innerHTML = `
      <div class="stat"><div class="n">${PROJECTS.length}</div><div class="l">TOTAL PROJECTS</div></div>
      <div class="stat"><div class="n">${stateCount}</div><div class="l">REGIONS COVERED</div></div>
      <div class="stat"><div class="n">${totalTons.toLocaleString()}</div><div class="l">TOTAL TONS</div></div>
    `;
  }
  renderAdminTable(typeof getFilteredSortedAdminProjects === 'function' ? getFilteredSortedAdminProjects() : PROJECTS);
}

function renderAdminTable(list) {
  const tbody = document.getElementById('adminTableBody');
  if (!tbody) return;
  tbody.innerHTML = list.map(p => `
    <tr>
      <td>${p.title}</td>
      <td>${p.state}</td>
      <td>${p.country}</td>
      <td>${p.type}</td>
      <td>${(p.tons || 0).toLocaleString()}</td>
      <td>${p.year}</td>
      <td style="white-space: nowrap;">
        <button class="btn nav-pill" style="padding:4px 10px;font-size:12px;margin-right:4px;" onclick="openEditModal('${p.id}')">Edit</button>
        <button class="btn nav-pill danger" style="padding:4px 10px;font-size:12px;" onclick="deleteProject('${p.id}')">Del</button>
      </td>
    </tr>
  `).join('');
}

async function deleteProject(id) {
  if (confirm('Remove this project?')) {
    try {
      await apiFetch('/projects/' + id, { method: 'DELETE' });
      PROJECTS = PROJECTS.filter(p => p.id !== id);
      renderAdmin();
      if (window.MapModule) window.MapModule.drawMap(PROJECTS, currentCategory, currentCountry);
    } catch (e) { alert('Failed: ' + e.message); }
  }
}

// ============================================================
// MANAGE ADMINS PAGE
// ============================================================
document.getElementById('navManageAdminsBtn')?.addEventListener('click', () => {
  showView('manage-admins');
  fetchAndRenderManageAdmins();
});

document.getElementById('backToAdminBtn')?.addEventListener('click', () => {
  showView('admin');
});

async function fetchAndRenderManageAdmins() {
  const tbody = document.getElementById('manageAdminsTableBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="3">Loading...</td></tr>';
  
  try {
    const data = await apiFetch('/auth/admins');
    if (data.success && data.admins) {
      if (data.admins.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">No secondary admins found.</td></tr>';
        return;
      }
      tbody.innerHTML = data.admins.map(a => `
        <tr>
          <td>${a.username}</td>
          <td>${new Date(a.createdAt).toLocaleString()}</td>
          <td style="white-space: nowrap;">
            <button class="btn nav-pill danger" style="padding:4px 10px;font-size:12px;" onclick="deleteSecondaryAdminFrontend('${a.username}')">Delete</button>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="3" style="color:red;">Error loading admins: ${err.message}</td></tr>`;
  }
}

window.deleteSecondaryAdminFrontend = async function(username) {
  if (confirm(`Remove admin '${username}'?`)) {
    try {
      await apiFetch('/auth/admins/' + username, { method: 'DELETE' });
      fetchAndRenderManageAdmins();
    } catch (e) { alert('Failed: ' + e.message); }
  }
};

// ============================================================
// ADD / EDIT MODAL
// ============================================================
function setupModal() {
  document.getElementById('openAddAdminModal')?.addEventListener('click', () => {
    document.getElementById('f-new-admin-user').value = '';
    document.getElementById('f-new-admin-pass').value = '';
    document.getElementById('addAdminError').style.display = 'none';
    document.getElementById('addAdminSuccess').style.display = 'none';
    document.getElementById('addAdminModal').classList.add('open');
  });
  document.getElementById('adminModalClose')?.addEventListener('click', () => {
    document.getElementById('addAdminModal').classList.remove('open');
  });
  document.getElementById('adminModalCancel')?.addEventListener('click', () => {
    document.getElementById('addAdminModal').classList.remove('open');
  });
  document.getElementById('adminModalSave')?.addEventListener('click', async () => {
    const u = document.getElementById('f-new-admin-user').value.trim();
    const p = document.getElementById('f-new-admin-pass').value.trim();
    const errEl = document.getElementById('addAdminError');
    const sucEl = document.getElementById('addAdminSuccess');
    errEl.style.display = 'none';
    sucEl.style.display = 'none';
    if (!u || !p) {
      errEl.textContent = 'Username and password required.';
      errEl.style.display = 'block';
      return;
    }
    try {
      const data = await apiFetch('/auth/admins', { method: 'POST', body: JSON.stringify({ username: u, password: p }) });
      if (data.success) {
        sucEl.textContent = 'Admin created successfully!';
        sucEl.style.display = 'block';
        setTimeout(() => {
          document.getElementById('addAdminModal').classList.remove('open');
          if (document.getElementById('view-manage-admins').classList.contains('active')) {
            fetchAndRenderManageAdmins();
          }
        }, 1500);
      }
    } catch (err) {
      errEl.textContent = err.message || 'Failed to create admin.';
      errEl.style.display = 'block';
    }
  });

  document.getElementById('openAddModal')?.addEventListener('click', openAddModal);
  document.getElementById('modalClose')?.addEventListener('click', closeModal);
  document.getElementById('modalCancel')?.addEventListener('click', closeModal);
  document.getElementById('f-country')?.addEventListener('change', (e) => populateStateSelect(e.target.value));

  document.getElementById('f-images')?.addEventListener('change', (e) => {
    Array.from(e.target.files).forEach(file => {
      const url = URL.createObjectURL(file);
      fileMap.set(url, file);
      uploadedImages.push(url);
      renderMediaPreviews();
    });
    e.target.value = '';
  });

  document.getElementById('f-video')?.addEventListener('change', (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      fileMap.set(url, file);
      uploadedVideo = url;
      renderMediaPreviews();
    }
    e.target.value = '';
  });
  
  document.getElementById('f-model')?.addEventListener('change', (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      fileMap.set(url, file);
      uploadedModel = url;
      renderMediaPreviews();
    }
    e.target.value = '';
  });

  document.getElementById('modalSave')?.addEventListener('click', async () => {
    const title       = document.getElementById('f-title').value.trim();
    const country     = document.getElementById('f-country').value;
    const state       = document.getElementById('f-state').value;
    const typeBoxes = document.querySelectorAll('#f-type-checkboxes input:checked');
    const type      = Array.from(typeBoxes).map(b => b.value).join(', ');
    const category  = document.getElementById('f-category').value;
    const status      = 'Active';
    const year        = Number(document.getElementById('f-year').value);
    const tons        = Number(document.getElementById('f-tons').value);
    const description = document.getElementById('f-description').value.trim();

    if (!title) { alert('Please fill in Title.'); return; }
    
    const saveBtn = document.getElementById('modalSave');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Uploading... (This may take several minutes for massive 3D models)';
    saveBtn.disabled = true;

    try {
      let imageUrls = uploadedImages.filter(src => !src.startsWith('blob:'));
      let videoUrl = (uploadedVideo && !uploadedVideo.startsWith('blob:')) ? uploadedVideo : '';
      let modelUrl = (uploadedModel && !uploadedModel.startsWith('blob:')) ? uploadedModel : '';
      
      const newImages = uploadedImages.filter(src => src.startsWith('blob:')).map(src => fileMap.get(src));
      const newVideo = (uploadedVideo && uploadedVideo.startsWith('blob:')) ? fileMap.get(uploadedVideo) : null;
      const newModel = (uploadedModel && uploadedModel.startsWith('blob:')) ? fileMap.get(uploadedModel) : null;

      if (newImages.length > 0 || newVideo || newModel) {
        const formData = new FormData();
        newImages.forEach(f => { if (f) formData.append('images', f); });
        if (newVideo) formData.append('video', newVideo);
        if (newModel) formData.append('model', newModel);

        const media = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', '/api/media', true);
          xhr.setRequestHeader('Authorization', 'Bearer ' + (sessionStorage.getItem('steeltrack_admin_token') || ''));
          
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const percent = Math.round((e.loaded / e.total) * 100);
              if (percent < 100) {
                saveBtn.textContent = `Uploading... ${percent}%`;
              } else {
                saveBtn.textContent = `Processing & Optimizing 3D... (Please wait)`;
              }
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try { resolve(JSON.parse(xhr.responseText)); } catch(e) { resolve({}); }
            } else {
              try { reject(new Error(JSON.parse(xhr.responseText).message || 'Upload failed')); } 
              catch(e) { reject(new Error('Upload failed with status ' + xhr.status)); }
            }
          };
          
          xhr.onerror = () => reject(new Error('Network error during upload'));
          xhr.send(formData);
        });
        
        if (media.images && media.images.length) {
            let uploadedIdx = 0;
            imageUrls = uploadedImages.map(src => {
              if (src.startsWith('blob:')) {
                return media.images[uploadedIdx++] || src;
              }
              return src;
            });
          } else if (newImages.length === 0) {
            imageUrls = uploadedImages.filter(src => !src.startsWith('blob:'));
          }
        if (media.video) videoUrl = media.video;
        if (media.model) modelUrl = media.model;
      }
      
      const payload = { title, country, state, type, category, status, year, tons, description, images: imageUrls, video: videoUrl, modelUrl };
      if (editingProjectId) {
        const res = await apiFetch('/projects/' + editingProjectId, { method: 'PUT', body: JSON.stringify(payload) });
        const idx = PROJECTS.findIndex(p => p.id === editingProjectId);
        if (idx !== -1) PROJECTS[idx] = res.project;
      } else {
        const res = await apiFetch('/projects', { method: 'POST', body: JSON.stringify(payload) });
        PROJECTS.push(res.project);
      }
      closeModal();
      renderAdmin();
      if (window.MapModule) window.MapModule.drawMap(PROJECTS, currentCategory, currentCountry);
    } catch (e) {
      alert('Save failed: ' + e.message);
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Project';
    }
  });
}

function openAddModal() {
  editingProjectId = null;
  uploadedImages = [];
  uploadedVideo = '';
  uploadedModel = '';
  fileMap.clear();
  document.getElementById('modalTitle').textContent = 'Add New Project';
  document.getElementById('f-title').value = '';
  document.getElementById('f-country').value = 'US';
  populateStateSelect('US');
  document.querySelectorAll('#f-type-checkboxes input').forEach(cb => cb.checked = false);
  document.getElementById('f-year').value = new Date().getFullYear();
  document.getElementById('f-tons').value = 100;
  document.getElementById('f-description').value = '';
  const fVideo = document.getElementById('f-video');
  if (fVideo) fVideo.value = '';
  const fModel = document.getElementById('f-model');
  if (fModel) fModel.value = '';
  renderMediaPreviews();
  document.getElementById('projectModal').classList.add('open');
}

function openEditModal(id) {
  const p = PROJECTS.find(x => x.id === id);
  if (!p) return;
  editingProjectId = id;
  uploadedImages   = [...(p.images || [])];
  uploadedVideo    = p.video || '';
  uploadedModel    = p.modelUrl || '';
  fileMap.clear();
  document.getElementById('modalTitle').textContent = 'Edit Project';
  document.getElementById('f-title').value       = p.title || '';
  document.getElementById('f-country').value     = p.country || 'US';
  populateStateSelect(p.country || 'US');
  document.getElementById('f-state').value       = p.state || '';
  
  const types = (p.type || '').split(',').map(s => s.trim());
  document.querySelectorAll('#f-type-checkboxes input').forEach(cb => {
    cb.checked = types.includes(cb.value);
  });

  document.getElementById('f-category').value    = p.category || 'Misc Steel';
  const fVideo = document.getElementById('f-video');
  if (fVideo) fVideo.value = '';
  const fModel = document.getElementById('f-model');
  if (fModel) fModel.value = '';
  document.getElementById('f-year').value        = p.year || 2024;
  document.getElementById('f-tons').value        = p.tons || 0;
  document.getElementById('f-description').value = p.description || '';
  renderMediaPreviews();
  document.getElementById('projectModal').classList.add('open');
}

function closeModal() {
  document.getElementById('projectModal')?.classList.remove('open');
}

function populateStateSelect(country) {
  const sel = document.getElementById('f-state');
  if (!sel) return;
  const opts = country === 'US' ? (METADATA.usStates || []) : (METADATA.caProvinces || []);
  sel.innerHTML = opts.map(s => `<option value="${s}">${s}</option>`).join('');
}

function renderMediaPreviews() {
  const cImg = document.getElementById('imgPreviews');
  if (cImg) {
    cImg.innerHTML = uploadedImages.map((src, i) => `
      <div class="media-item" draggable="true" 
           ondragstart="window.imgDragStart(event, ${i})" 
           ondragover="window.imgDragOver(event)" 
           ondrop="window.imgDrop(event, ${i})">
        <img src="${src}">
        <button type="button" class="media-delete-btn" onclick="window.removeImage(${i})">X</button>
      </div>
    `).join('');
  }
  
  const cVid = document.getElementById('vidPreview');
  if (cVid) {
    cVid.innerHTML = uploadedVideo ? `
      <div class="media-item">
        <video src="${uploadedVideo}" muted></video>
        <button type="button" class="media-delete-btn" onclick="window.removeVideo()">X</button>
      </div>
    ` : '';
  }
  
  const cMod = document.getElementById('modelPreview');
  if (cMod) {
    cMod.innerHTML = uploadedModel ? `
      <div class="media-item">
        <div class="media-item-model">3D</div>
        <button type="button" class="media-delete-btn" onclick="window.removeModel()">X</button>
      </div>
    ` : '';
  }
}

let dragStartIndex = -1;
window.imgDragStart = (e, i) => { 
  dragStartIndex = i; 
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', i.toString());
  }
};
window.imgDragOver = (e) => { e.preventDefault(); };
window.imgDrop = (e, targetIndex) => {
  e.preventDefault();
  if (dragStartIndex > -1 && dragStartIndex !== targetIndex) {
    const item = uploadedImages.splice(dragStartIndex, 1)[0];
    uploadedImages.splice(targetIndex, 0, item);
    renderMediaPreviews();
  }
};

window.removeImage = function(i) { uploadedImages.splice(i, 1); renderMediaPreviews(); };
window.removeVideo = function() { uploadedVideo = ''; renderMediaPreviews(); };
window.removeModel = function() { uploadedModel = ''; renderMediaPreviews(); };

// ============================================================
// ADMIN SEARCH & SORT
// ============================================================
let currentAdminSort = { key: null, asc: true };

function getFilteredSortedAdminProjects() {
  const q = (document.getElementById('adminSearch')?.value || '').toLowerCase();
  let list = PROJECTS.filter(p =>
    String(p.title || '').toLowerCase().includes(q) ||
    String(p.state || '').toLowerCase().includes(q) ||
    String(p.country || '').toLowerCase().includes(q) ||
    String(p.type || '').toLowerCase().includes(q)
  );
  
  if (currentAdminSort.key) {
    const k = currentAdminSort.key;
    list.sort((a, b) => {
      let va = a[k], vb = b[k];
      if (k === 'tons' || k === 'year') {
        if (typeof va === 'string') va = va.replace(/,/g, '');
        if (typeof vb === 'string') vb = vb.replace(/,/g, '');
        va = parseFloat(va) || 0;
        vb = parseFloat(vb) || 0;
      } else {
        va = String(va || '').toLowerCase();
        vb = String(vb || '').toLowerCase();
      }
      if (va < vb) return currentAdminSort.asc ? -1 : 1;
      if (va > vb) return currentAdminSort.asc ? 1 : -1;
      return 0;
    });
  }
  return list;
}

function setupAdminControls() {
  document.getElementById('adminSearch')?.addEventListener('input', () => {
    renderAdminTable(getFilteredSortedAdminProjects());
  });

  document.querySelectorAll('th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      if (currentAdminSort.key === key) {
        currentAdminSort.asc = !currentAdminSort.asc;
      } else {
        currentAdminSort.key = key;
        currentAdminSort.asc = true;
      }
      
      document.querySelectorAll('th.sortable .sort-icon').forEach(icon => icon.innerHTML = '');
      th.querySelector('.sort-icon').innerHTML = currentAdminSort.asc ? ' ▲' : ' ▼';
      
      renderAdminTable(getFilteredSortedAdminProjects());
    });
  });
}

// ============================================================
// INIT
// ============================================================
function initApp() {
  initCustomCursor();
  initThemeToggle();
  setupNavigation();
  setupModal();
  setupAdminControls();
  setupDragAndDrop();
  // Load data — map renders after data arrives
  fetchAppInitialData();
}

function setupDragAndDrop() {
  ['images', 'video', 'model'].forEach(type => {
    const dz = document.getElementById(`dz-${type}`);
    const input = document.getElementById(`f-${type}`);
    if (!dz || !input) return;

    dz.addEventListener('dragenter', (e) => {
      e.preventDefault();
      dz.classList.add('dragover');
    });

    dz.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      dz.classList.add('dragover');
    });

    dz.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dz.classList.remove('dragover');
    });

    dz.addEventListener('drop', (e) => {
      e.preventDefault();
      dz.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        input.files = e.dataTransfer.files;
        input.dispatchEvent(new Event('change'));
      }
    });
  });
}

// Run when DOM + all deferred scripts are ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
// ==========================================
// Drawings Management
// ==========================================
(function initDrawingsManager() {
  const openManageBtn = document.getElementById('openManageDrawingsBtn');
  const manageModal = document.getElementById('manageDrawingsModal');
  const manageClose = document.getElementById('manageDrawingsClose');
  const openAddBtn = document.getElementById('openAddDrawingBtn');
  const addModal = document.getElementById('addDrawingModal');
  const addClose = document.getElementById('addDrawingClose');
  const saveBtn = document.getElementById('saveDrawingBtn');

  if (openManageBtn) {
    openManageBtn.addEventListener('click', async () => {
      if (!window.cachedDrawingsData) {
        try {
          const res = await fetch('/drawings_data.json');
          window.cachedDrawingsData = await res.json();
        } catch (err) {
          console.error("Failed to load drawings data:", err);
        }
      }
      renderDrawingsManagerList();
      manageModal.classList.add('open');
    });
  }

  manageClose?.addEventListener('click', () => manageModal.classList.remove('open'));
  addClose?.addEventListener('click', () => addModal.classList.remove('open'));

  openAddBtn?.addEventListener('click', () => {
    document.getElementById('d-name').value = '';
    document.getElementById('d-tag').value = '';
    document.getElementById('d-file').value = '';
    document.getElementById('d-upload-status').innerText = '';
    addModal.classList.add('open');
  });

  function renderDrawingsManagerList() {
    const container = document.getElementById('drawingsListContainer');
    if (!container) return;
    let html = '';
    if (!cachedDrawingsData) {
      html = '<div style=\"padding: 10px; color: var(--sub);\">No drawings loaded.</div>';
    } else {
      for (const catKey in cachedDrawingsData) {
        const cat = cachedDrawingsData[catKey];
        html += '<div style=\"display:flex; justify-content:space-between; align-items:center; margin-top: 15px; padding-bottom: 6px; border-bottom: 1px solid var(--border);\"><div style=\"font-weight: 700; font-size: 14.5px; color:var(--ink);\">' + (cat.title || catKey) + '</div><button class=\"btn primary\" style=\"font-size:11px; padding:4px 10px; background:var(--accent);\" onclick=\"window.openAddDrawingForCat(\'' + catKey + '\')\">+ Add PDF</button></div>';
        cat.files.forEach((file, index) => {
          html += '<div style=\"display:flex; justify-content:space-between; align-items:center; background:#fff; padding:10px; border-radius:6px; box-shadow:0 1px 3px rgba(0,0,0,0.05); margin-bottom:4px;\"><div><div style=\"font-weight:600; font-size:13px; color:var(--ink);\">' + file.name + '</div><div style=\"font-size:11px; color:var(--sub);\">' + file.tag + ' &middot; <a href=\"/' + file.path + '\" target=\"_blank\" style=\"color:var(--accent);\">View PDF</a></div></div><button class=\"btn delete-btn\" style=\"padding: 4px 10px; font-size: 12px; color: #d32f2f; background: #ffebee;\" onclick=\"deleteDrawing(\'' + catKey + '\', ' + index + ')\">Remove</button></div>';
        });
      }
    }
    container.innerHTML = html;
  }

  window.openAddDrawingForCat = function(catKey) {
    document.getElementById('d-category').value = catKey;
    document.getElementById('d-name').value = '';
    document.getElementById('d-tag').value = '';
    document.getElementById('d-file').value = '';
    document.getElementById('d-upload-status').innerText = '';
    document.getElementById('addDrawingModal').classList.add('open');
  };

  window.deleteDrawing = async function(catKey, index) {
    if (!confirm('Are you sure you want to remove this drawing?')) return;
    cachedDrawingsData[catKey].files.splice(index, 1);
    await saveDrawingsData();
    renderDrawingsManagerList();
    
    // Update the live UI in the background
    if (window.renderFolders) {
      const breadcrumb = document.getElementById('drawingsBreadcrumbRow');
      if (breadcrumb && breadcrumb.style.display !== 'none') {
          const activeCard = document.querySelector('.drawing-folder-card.active');
          if (activeCard) {
               const key = activeCard.dataset.cat;
               if (key && window.renderFolderContents) { window.renderFolderContents(key); }
          }
      } else {
          window.renderFolders();
      }
    }
  };

  saveBtn?.addEventListener('click', async () => {
    const catKey = document.getElementById('d-category').value;
    const name = document.getElementById('d-name').value.trim();
    const tag = document.getElementById('d-tag').value.trim();
    const fileInput = document.getElementById('d-file');
    const status = document.getElementById('d-upload-status');

    if (!name || !tag || !fileInput.files[0]) {
      alert('Please fill out all fields and select a PDF file.');
      return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = 'Uploading...';
    status.innerText = 'Uploading PDF...';

    try {
      const file = fileInput.files[0];
      const reader = new FileReader();
      
      const base64Data = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject('Error reading file');
        reader.readAsDataURL(file);
      });

      const res = await fetch('/api/media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({ files: [{ data: base64Data }] })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Upload failed');

      const path = json.files[0].substring(1);
      
      if (!cachedDrawingsData[catKey]) {
        cachedDrawingsData[catKey] = { title: catKey, files: [] };
      }
      cachedDrawingsData[catKey].files.push({
        path: path,
        name: name,
        tag: tag
      });

      status.innerText = 'Saving data...';
      await saveDrawingsData();

      addModal.classList.remove('open');
      renderDrawingsManagerList();
      
      // Update the live UI in the background
      if (window.renderFolders) {
        const breadcrumb = document.getElementById('drawingsBreadcrumbRow');
        if (breadcrumb && breadcrumb.style.display !== 'none') {
            const activeCard = document.querySelector('.drawing-folder-card.active');
            if (activeCard) {
                 const key = activeCard.dataset.cat;
                 if (key && window.renderFolderContents) { window.renderFolderContents(key); }
            }
        } else {
            window.renderFolders();
        }
      }

    } catch (err) {
      status.innerText = 'Error: ' + err.message;
      alert(err.message);
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Drawing';
    }
  });

  async function saveDrawingsData() {
    const res = await fetch('/api/drawings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify(cachedDrawingsData)
    });
    if (!res.ok) throw new Error('Failed to save drawings JSON');
  }
})();
