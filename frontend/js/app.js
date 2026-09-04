// Global state â these are the single source of truth (map.js reads them via arguments)
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
    'Authorization': 'Bearer ' + (localStorage.getItem('steeltrack_admin_token') || '')
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
    
    try {
      const meta = await apiFetch('/metadata');
      METADATA = meta;
    } catch(e) { console.error('Metadata failed', e); }
    
    try {
      const proj = await apiFetch('/projects');
      PROJECTS = proj.data || proj.projects || proj || [];
    } catch(e) {
      console.error('Projects failed', e);
      PROJECTS = [];
    }


    // Populate dropdowns and checkboxes
    const catSel = document.getElementById('f-category');
    if (catSel) catSel.innerHTML = ((window.CONFIG?.CATEGORIES || ['Industrial','Commercial','Healthcare','Airport','Warehouse','Stadium','Institutional','Manufacturing','Data Center','Oil & Gas','Power Plant','Bridge','Misc Steel']) || []).filter(c => c !== 'All').map(c => `<option value="${c}">${c}</option>`).join('');
    
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
    window.PROJECTS = PROJECTS;
  } catch (e) {
    console.error('Init error:', e);
    // Still render chips and try map with empty projects
    renderCategoryChips();
    renderMap();
  } finally {
    if (typeof window.hideLoader === 'function') window.hideLoader();
  }
}

function renderMap() {
  if (window.MapModule) {
    window.MapModule.loadMapData(() => {
      window.MapModule.drawMap(window.PROJECT_STATS || PROJECTS, currentCategory, currentCountry);
    });
  }
}

// ============================================================
// CATEGORY CHIPS
// ============================================================
function renderCategoryChips() {
  const row = document.getElementById('categoryChipRow');
  if (!row) return;
  const cats = (window.CONFIG?.CATEGORIES || ['Industrial','Commercial','Healthcare','Airport','Warehouse','Stadium','Institutional','Manufacturing','Data Center','Oil & Gas','Power Plant','Bridge','Misc Steel']) || ['All'];
  const oldSearch = document.getElementById('globalProjectSearch');
  const oldVal = oldSearch ? oldSearch.value : '';
  const searchPlaceholder = window.innerWidth > 768 ? 'Search projects... (Ctrl+K)' : 'Search projects...';
  const chipsHTML = cats.map(c =>
    `<button class="filter-chip ${c === currentCategory ? 'active' : ''}" data-cat="${c}">${c}</button>`
  ).join('');

  row.innerHTML = 
  `<div class="filter-chip-container" style="display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; flex: 1;">
    ${chipsHTML}
  </div>
  <div class="inline-search-wrap" style="position: relative; flex: 0 0 auto; width: 180px; height: 34px; margin-left: 12px;">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--sub); pointer-events:none; opacity:0.45;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
    <input type="text" id="globalProjectSearch" placeholder="${searchPlaceholder}" value="${oldVal.replace(/"/g, '&quot;')}" style="padding: 0 36px 0 32px; width: 100%; height: 100%; background: var(--gray-50, #f8fafc); border: 1.5px solid var(--line); border-radius: 100px; font-size: 12px; font-weight: 500; color: var(--ink); outline: none; transition: border-color 0.2s, box-shadow 0.2s;">
    <button id="globalSearchBtn" title="Search" style="position:absolute; right:4px; top:50%; transform:translateY(-50%); background: var(--accent); color:#fff; border:none; border-radius:50%; width:26px; height:26px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition: background 0.2s;">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
    </button>
  </div>`;

  row.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      currentCategory = chip.dataset.cat;
      renderCategoryChips();
      if (window.MapModule) window.MapModule.drawMap(window.PROJECT_STATS || PROJECTS, currentCategory, currentCountry);
      closePanel();
      });
    });

    // Desktop dropdown
    const desktopSelect = document.getElementById('categorySelectDesktop');
    if (desktopSelect) {
      desktopSelect.innerHTML = '<option value="All">All Categories</option>' + cats.map(c =>
        `<option value="${c}" ${c === currentCategory ? 'selected' : ''}>${c}</option>`
      ).join('');
      desktopSelect.value = currentCategory;
      desktopSelect.onchange = function() {
        currentCategory = this.value;
        renderCategoryChips();
        if (window.MapModule) window.MapModule.drawMap(window.PROJECT_STATS || PROJECTS, currentCategory, currentCountry);
        closePanel();
      };
    }

    const searchInput = document.getElementById('globalProjectSearch');
    const searchBtn = document.getElementById('globalSearchBtn');
    
    function executeSearch() {
        const q = searchInput.value.trim();
        if (!q) {
          if (window.MapModule) window.MapModule.drawMap(window.PROJECT_STATS || PROJECTS, currentCategory, currentCountry);
          const existingPopup = document.getElementById('searchResultsPopup');
          if (existingPopup) existingPopup.remove();
          return;
        }
        
        const lowerQ = q.toLowerCase();
        const filtered = (window.PROJECT_STATS || PROJECTS).filter(p => {
          return (p.title || '').toLowerCase().includes(lowerQ) ||
                 (p.state || '').toLowerCase().includes(lowerQ) ||
                 (p.category || '').toLowerCase().includes(lowerQ) ||
                 (p.type || '').toLowerCase().includes(lowerQ);
        });
        
        if (window.MapModule) {
          window.MapModule.drawMap(filtered, currentCategory, currentCountry);
        }

        // --- NEW: Search Results Popup ---
        let popup = document.getElementById('searchResultsPopup');
        if (!popup) {
          popup = document.createElement('div');
          popup.id = 'searchResultsPopup';
          popup.style.position = 'fixed';
          popup.style.top = '50%';
          popup.style.left = '50%';
          popup.style.transform = 'translate(-50%, -50%)';
          popup.style.width = '85%';
          popup.style.maxWidth = '800px';
          popup.style.maxHeight = '70vh';
          // Glassmorphism styling
          popup.style.background = 'rgba(255, 255, 255, 0.7)';
          popup.style.backdropFilter = 'blur(24px)';
          popup.style.WebkitBackdropFilter = 'blur(24px)';
          popup.style.border = '1px solid rgba(255, 255, 255, 0.4)';
          popup.style.borderRadius = '24px';
          popup.style.boxShadow = '0 30px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)';
          if (document.body.classList.contains('dark-mode')) {
            popup.style.background = 'rgba(15, 15, 17, 0.75)';
            popup.style.border = '1px solid rgba(255,255,255,0.1)';
            popup.style.boxShadow = '0 30px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)';
          }
          popup.style.zIndex = '9999';
          popup.style.display = 'flex';
          popup.style.flexDirection = 'column';
          popup.style.overflow = 'hidden';
          popup.style.animation = 'popupFadeScale 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards';
          document.body.appendChild(popup);
        }

        let isDark = document.body.classList.contains('dark-mode');
        let headerBg = isDark ? 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(0,0,0,0))' : 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(255,255,255,0))';
        let rowBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.6)';
        let rowHoverBg = isDark ? 'rgba(37,99,235,0.15)' : 'rgba(255,255,255,1)';
        let borderColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

        let resultsHtml = `<div style="padding: 20px 24px; border-bottom: 1px solid ${borderColor}; display: flex; justify-content: space-between; align-items: center; background: ${headerBg};">
            <div style="display:flex; align-items:center; gap:12px;">
              <div style="background:var(--accent); color:#fff; width:32px; height:32px; border-radius:10px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(37,99,235,0.4);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <div>
                <h3 style="margin:0; font-size:18px; font-weight:800; color:var(--ink); letter-spacing:-0.3px;">Search Results</h3>
                <div style="font-size:12px; color:var(--sub); font-weight:500; margin-top:2px;">Found ${filtered.length} matches for "${q}"</div>
              </div>
            </div>
            <button onclick="document.getElementById('searchResultsPopup').remove()" style="background:var(--bg-alt); border:1px solid var(--line); border-radius:50%; cursor:pointer; color:var(--sub); width:32px; height:32px; display:flex; align-items:center; justify-content:center; transition:all 0.2s; box-shadow:0 2px 8px rgba(0,0,0,0.05);" onmouseover="this.style.background='var(--accent)'; this.style.color='#fff'; this.style.transform='rotate(90deg)'" onmouseout="this.style.background='var(--bg-alt)'; this.style.color='var(--sub)'; this.style.transform='none'">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>
        <div style="overflow-y:auto; padding: 16px; display:flex; flex-direction:column; gap:12px;">`;

        if (filtered.length === 0) {
            resultsHtml += `<div style="padding: 40px; text-align: center; color: var(--sub);">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="opacity:0.3; margin-bottom:16px;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <div style="font-size:16px; font-weight:600;">No projects found</div>
              <div style="font-size:13px; margin-top:4px;">Try adjusting your search terms</div>
            </div>`;
        } else {
            filtered.forEach((p, idx) => {
                let imgUrl = (p.images && p.images.length > 0) ? (p.images[0].startsWith('http') ? p.images[0] : `/uploads/${p.images[0]}`) : 'assets/logo.png';
                let animDelay = idx * 0.05;
                resultsHtml += `<div onclick="document.getElementById('searchResultsPopup').remove(); openDetail('${p.id}')" style="display:flex; align-items:center; justify-content:space-between; padding:16px 20px; background:${rowBg}; border:1px solid ${borderColor}; border-radius:16px; cursor:pointer; transition:all 0.3s cubic-bezier(0.16, 1, 0.3, 1); animation: viewFadeIn 0.4s ease backwards ${animDelay}s;" onmouseover="this.style.background='${rowHoverBg}'; this.style.transform='translateY(-2px) scale(1.01)'; this.style.boxShadow='0 12px 24px rgba(0,0,0,0.08)'" onmouseout="this.style.background='${rowBg}'; this.style.transform='none'; this.style.boxShadow='none'">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <div style="width:72px; height:72px; border-radius:14px; overflow:hidden; background:var(--bg-alt); flex-shrink:0; border:1px solid ${borderColor};">
                          <img src="${imgUrl}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='assets/logo.png'; this.style.objectFit='contain'; this.style.padding='8px';">
                        </div>
                        <div>
                            <div style="font-weight:800; color:var(--ink); font-size:18px; margin-bottom:8px; letter-spacing:-0.2px;">${p.title}</div>
                            <div style="font-size:14px; color:var(--sub); display:flex; align-items:center; gap:16px; font-weight:500;">
                                <span style="display:flex; align-items:center; gap:4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>${p.state}</span>
                                <span style="background:var(--bg-alt); padding:4px 10px; border-radius:100px; border:1px solid var(--line); font-size:11px; text-transform:uppercase; font-weight:700; letter-spacing:0.5px;">${p.category}</span>
                            </div>
                        </div>
                    </div>
                    <div style="text-align:right; padding-right:8px;">
                      <div style="font-weight:800; color:var(--accent); font-size:22px; letter-spacing:-0.5px;">${(p.tons || 0).toLocaleString()} <span style="font-size:11px; opacity:0.7;">TONS</span></div>
                    </div>
                </div>`;
            });
        }
        resultsHtml += `</div>`;
        popup.innerHTML = resultsHtml;
    
    }

    if (searchBtn) searchBtn.addEventListener('click', executeSearch);
    if (searchInput) {
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') executeSearch();
      });
      // also allow instant filtering
      searchInput.addEventListener('input', () => {
         if (searchInput.value.trim() === '') executeSearch();
      });
    }
  }

// ============================================================
// NAVIGATION & AUTH
// ============================================================
function setupNavigation() {
  document.getElementById('navHome')?.addEventListener('click', (e) => { e.preventDefault(); goToMap(); });
  document.getElementById('navMapBtn')?.addEventListener('click', (e) => { e.preventDefault(); goToMap(); });
  document.getElementById('backHome')?.addEventListener('click', () => goToMap());

  // ââ Back to Top Button âââââââââââââââââââââââââââââ
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

  // ââ New nav buttons ââââââââââââââââââââââââââââââââââ
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
      <div class="proj-card drawing-card" style="cursor:pointer;padding:0;overflow:hidden;border:1px solid var(--line);background:var(--bg);transition:all 0.3s cubic-bezier(0.16, 1, 0.3, 1);display:flex;flex-direction:column;" onclick="window.open('/${file.path}', '_blank')">
        <div class="dc-cover" style="position:relative;height:150px;background:var(--gray-50);overflow:hidden;display:flex;align-items:center;justify-content:center;border-bottom:1px solid var(--line);">
          
          ${file.cover ? `
            <img src="/${file.cover}" alt="Cover" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1;">
          ` : `
            <!-- Blueprint architectural grid pattern -->
            <div style="position:absolute;inset:0;opacity:0.06;background-image:linear-gradient(var(--ink) 1px, transparent 1px), linear-gradient(90deg, var(--ink) 1px, transparent 1px);background-size:24px 24px;"></div>
            
            <!-- Elegant Document Icon -->
            <div style="position:relative;z-index:2;width:76px;height:94px;background:#fff;border-radius:4px 16px 4px 4px;box-shadow:0 8px 24px rgba(0,0,0,0.08);display:flex;align-items:center;justify-content:center;border:1px solid var(--line);">
               <!-- Dog-ear fold effect -->
               <div style="position:absolute;top:0;right:0;width:0;height:0;border-style:solid;border-width:0 22px 22px 0;border-color:transparent var(--gray-100) transparent transparent;border-bottom-left-radius:4px;"></div>
               <div style="color:var(--accent);transform:translateY(4px);">${getIconForCategory(catKey)}</div>
            </div>
          `}

          <!-- Hover action overlay -->
          <div class="dc-hover-overlay" style="position:absolute;inset:0;background:rgba(0,0,0,0.25);opacity:0;transition:opacity 0.25s ease;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(3px);z-index:3;">
            <div style="display:flex;align-items:center;gap:8px;background:var(--accent);color:#fff;padding:10px 20px;border-radius:100px;font-weight:800;font-size:13px;letter-spacing:0.5px;box-shadow:0 10px 20px rgba(0,0,0,0.2);">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
               VIEW PDF
            </div>
          </div>
        </div>
        
        <div style="padding:24px;flex-grow:1;display:flex;flex-direction:column;">
          <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:24px;">
            <div class="p-eyebrow" style="color:var(--sub);font-weight:700;letter-spacing:1px;font-size:10px;">${categoryData.title.toUpperCase()}</div>
            <div class="pc-title" style="font-size:17px;font-weight:800;color:var(--ink);line-height:1.3;margin:0;">${file.name}</div>
          </div>
          
          <div style="margin-top:auto;display:flex;align-items:center;justify-content:space-between;border-top:1px dashed var(--line);padding-top:16px;">
            <div style="display:flex;align-items:center;gap:6px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e53935" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              <span style="color:var(--sub);font-size:12px;font-weight:700;">PDF Document</span>
            </div>
            <div style="display:flex;gap:6px;">
              <span style="background:var(--accent-soft);color:var(--accent);padding:4px 10px;border-radius:100px;font-size:10.5px;font-weight:800;">${file.tag}</span>
            </div>
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
  if (localStorage.getItem('steeltrack_admin_token')) updateAuthUI(true);

  loginBtn?.addEventListener('click', () => {
    if (localStorage.getItem('steeltrack_admin_token')) {
      renderAdmin(); showView('admin');
    } else {
      showView('login');
    }
  });

  adminBtn?.addEventListener('click', () => { renderAdmin(); showView('admin'); });

  logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem('steeltrack_admin_token');
    localStorage.removeItem('steeltrack_is_superadmin');
    updateAuthUI(false);
    showView('map');
  });

  // ─── Google Sign-In Flow ──────────────────────────────────────────────────
    window.handleGoogleLogin = async function(response) {
      const errEl = document.getElementById('loginError');
      if (errEl) errEl.style.display = 'none';
      
      try {
        const data = await apiFetch('/auth/google', { 
          method: 'POST', 
          body: JSON.stringify({ credential: response.credential }) 
        });
        
        if (data.success && data.token) {
          localStorage.setItem('steeltrack_admin_token', data.token);
          if (data.user && data.user.isSuperAdmin) {
            localStorage.setItem('steeltrack_is_superadmin', 'true');
          } else {
            localStorage.removeItem('steeltrack_is_superadmin');
          }
          if (errEl) errEl.style.display = 'none';
          updateAuthUI(true);
          renderAdmin();
          showView('admin');
          if (window.showToast) window.showToast('Welcome back, ' + data.user.username, 'success');
        }
      } catch (err) {
        if (errEl) { errEl.textContent = err.message || 'Login failed.'; errEl.style.display = 'block'; }
      }
    };

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
        if (heroHighlight) heroHighlight.className = 'highlight-ca';
      } else {
        if (minSlider) minSlider.classList.remove('ca');
        if (heroPill) { heroPill.classList.remove('ca'); heroPill.classList.add('usa'); }
        if (heroHighlight) heroHighlight.className = 'highlight-usa';
        }
  
        const mapEl = document.getElementById('map');
        if (mapEl) {
          mapEl.classList.add('fade-out');
          setTimeout(() => {
            if (window.MapModule) window.MapModule.drawMap(window.PROJECT_STATS || PROJECTS, currentCategory, currentCountry);
            setTimeout(() => mapEl.classList.remove('fade-out'), 50);
          }, 250);
        } else {
          if (window.MapModule) window.MapModule.drawMap(window.PROJECT_STATS || PROJECTS, currentCategory, currentCountry);
        }
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
  const badgesHtml = typeArray.map(s => `<span class="hero-badge" style="color:#4b5563; border-color:#e5e7eb; background:#f9fafb; font-size:12px;">${s}</span>`).join('');
  
  // We will position this in a grid layout next to the 3D viewer if present, or as a standalone block.
  const inlineBadges = `
    <div class="project-scope-block">
      <h3 style="font-size: 13px; font-weight: 700; color: var(--sub); text-transform: uppercase; margin-bottom: 16px; letter-spacing: 0.5px;">Project Scope</h3>
      <div class="hero-badges" style="max-width: 100%; margin: 0; justify-content: flex-start; flex-wrap: wrap; gap: 8px;">
        ${badgesHtml}
      </div>
    </div>
  `;

  const titleHero = document.getElementById('detailTitleHero');
  if (titleHero) titleHero.textContent = p.title;

  const locHero = document.getElementById('detailLocHero');
  if (locHero) locHero.innerHTML = ''; 

  const wrap = document.getElementById('detailWrap');
  if (wrap) {
      const similar = PROJECTS.filter(x => x.id !== p.id && (x.category === p.category || (x.type && p.type && x.type.includes(p.type.split(',')[0])))).slice(0, 3);
  let similarHtml = '';
  if (similar.length > 0) {
    similarHtml = `
      <div style="margin-top: 64px; border-top: 1px solid rgba(0,0,0,0.1); padding-top: 32px;">
        <h3 style="font-size: 24px; font-weight: 800; margin-bottom: 24px; color: var(--ink); letter-spacing:-0.5px;">Similar Projects</h3>
        <div style="display:flex; gap:20px; flex-wrap:wrap;">
          ${similar.map(s => `
            <div onclick="window.openDetail('${s.id}')" style="cursor:pointer; flex: 1; min-width: 260px; max-width: 320px; background:#fff; border:1px solid rgba(0,0,0,0.08); border-radius:16px; overflow:hidden; transition:all 0.3s; box-shadow: 0 4px 12px rgba(0,0,0,0.03);" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 24px rgba(0,0,0,0.1)';" onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.03)';">
              <img src="${(s.images && s.images[0]) ? (s.images[0].startsWith('http') ? s.images[0] : 'uploads/'+s.images[0]) : 'assets/logo.png'}" style="width:100%; height:160px; object-fit:cover;" onerror="this.src='assets/logo.png';">
              <div style="padding:20px;">
                <div style="font-weight:800; font-size:16px; margin-bottom:6px; color:var(--ink);">${s.title}</div>
                <div style="font-size:13px; color:var(--sub); font-weight:600;">${s.state}, ${s.country}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
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
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="var(--accent)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
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

      <div style="margin-top: 32px; margin-bottom: 32px;">
        ${inlineBadges}
      </div>

      ${p.modelUrl ? `
          <div class="detail-model-section" style="margin-top: 0;">
            <div class="model-header">
              <h3>Interactive 3D Structural View</h3>
            </div>
            <div class="model-container" id="mv-container-${p.id}" style="min-height: 500px; display: flex; align-items: center; justify-content: center; position: relative; background-color: #0d1117; background-image: radial-gradient(circle at 50% 50%, rgba(37,99,235,0.15) 0%, transparent 70%), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 100% 100%, 30px 30px, 30px 30px; background-position: center; border-radius: 12px; overflow: hidden;">
              
              <!-- Manual Trigger Overlay -->
              <div id="mv-trigger-${p.id}" style="position: absolute; inset: 0; z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center; background: radial-gradient(circle at center, #161b22 0%, #0d1117 100%); cursor: pointer; transition: opacity 0.3s;">
                <div style="width: 80px; height: 80px; border-radius: 50%; background: rgba(10, 107, 204, 0.15); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; border: 1px solid rgba(10, 107, 204, 0.3); box-shadow: 0 0 30px rgba(10, 107, 204, 0.2);">
                  <svg viewBox="0 0 24 24" width="32" height="32" stroke="var(--accent)" stroke-width="2" fill="none" style="margin-left: 4px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                </div>
                <div style="font-size: 16px; font-weight: 700; color: white; letter-spacing: 1px; text-transform: uppercase;">Launch 3D Engine</div>
                <div style="font-size: 13px; color: #a1a1aa; margin-top: 8px;">(High-Performance BIM Viewer)</div>
              </div>

              <!-- Loading State -->
              <div class="model-loading-bar" id="mv-bar-${p.id}" style="position: absolute; inset: 0; height: 100%; display: none; flex-direction: column; background-color: #0d1117; background-image: radial-gradient(circle at 50% 50%, rgba(37,99,235,0.15) 0%, transparent 70%), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 100% 100%, 30px 30px, 30px 30px; background-position: center; z-index: 9;">
                <div class="model-loading-text" id="mv-text-${p.id}" style="margin-bottom: 24px; font-size: 15px; color: white;">Initializing 3D Engine...</div>
                <div style="width: 250px; height: 6px; background: rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden; position: relative;">
                  <div class="model-loading-fill" id="mv-fill-${p.id}" style="position: absolute; left: 0; top: 0; height: 100%; width: 0%; background: var(--accent); transition: width 0.3s ease;"></div>
                </div>
              </div>

              
            </div>
          </div>
        ` : ''}
          ${p.images && p.images.length > 1 ? `<div class="detail-gallery">${p.images.slice(1).map(img => `<img loading="lazy" decoding="async" src="${img}" onclick="window.openLightbox(this.src)">`).join('')}</div>` : ''}
          <div class="detail-section"><h3>Project Overview</h3><p style="white-space: pre-wrap;">${(p.description || 'No description provided.').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p></div>
          


      ${p.video ? `<div class="detail-video">${renderVideo(p.video)}</div>` : ''}
        ${similarHtml}
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
            mv.setAttribute('min-camera-orbit', 'auto auto 0m');
            mv.setAttribute('min-field-of-view', '1deg');
            mv.setAttribute('max-field-of-view', '100deg');
            mv.setAttribute('interaction-prompt', 'none');
            mv.innerHTML = '<div slot="interaction-prompt" style="display:none;"></div>';
          
            
              mv.style.position = 'absolute';
              mv.style.inset = '0';
              mv.style.width = '100%';
              mv.style.height = '100%';
              mv.style.zIndex = '1';

              const controls = document.createElement('div');
              controls.style.position = 'absolute';
              controls.style.right = '16px';
              controls.style.bottom = '16px';
              controls.style.zIndex = '15';
              controls.style.display = 'flex';
              controls.style.gap = '8px';
              controls.style.alignItems = 'flex-end';
              controls.innerHTML = `
                <!-- Desktop Instructions -->
                <div class="viewer-instructions-desktop" style="background:rgba(0,0,0,0.6); color:#fff; border:1px solid rgba(255,255,255,0.2); border-radius:6px; padding:6px 12px; font-size:11px; line-height:1.4; backdrop-filter:blur(4px); pointer-events:none; text-align:left; white-space:nowrap;">
                    <b>Controls:</b><br/>
                    - Left Click + Drag: Orbit<br/>
                    - Right Click + Drag: Pan<br/>
                    - Scroll Wheel: Zoom
                  </div>
                <!-- Mobile Instructions -->
                <div class="viewer-instructions-mobile" style="font-size:9px; color:#fff; background:rgba(0,0,0,0.6); padding:4px 6px; border-radius:6px; line-height:1.2; backdrop-filter:blur(4px); display:none; letter-spacing: -0.2px;">
  <strong style="font-size:10px;">Touch Controls</strong><br/>
  [1 Finger] Orbit<br/>
  [2 Fingers] Pan/Zoom
</div>
                <div class="viewer-buttons" style="display:flex; flex-direction:column; gap:8px;">
                  <button id="mv-rotate-${p.id}" title="Pause Auto Rotate" style="background:rgba(0,0,0,0.6); color:#fff; border:1px solid rgba(255,255,255,0.2); border-radius:6px; padding:0 12px; height:36px; cursor:pointer; font-size:13px; font-weight:600; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); transition: background 0.2s;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg> <span class="btn-text">Pause</span>
                  </button>
                  <div style="display:flex; gap:8px;">
                    <button id="mv-zoom-in-${p.id}" title="Zoom In" style="background:rgba(0,0,0,0.6); color:#fff; border:1px solid rgba(255,255,255,0.2); border-radius:6px; width:36px; height:36px; cursor:pointer; font-size:18px; font-weight:bold; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); transition: background 0.2s;">+</button>
                    <button id="mv-zoom-out-${p.id}" title="Zoom Out" style="background:rgba(0,0,0,0.6); color:#fff; border:1px solid rgba(255,255,255,0.2); border-radius:6px; width:36px; height:36px; cursor:pointer; font-size:18px; font-weight:bold; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); transition: background 0.2s;">-</button>
                    <button id="mv-fullscreen-${p.id}" title="Full Screen" style="background:rgba(0,0,0,0.6); color:#fff; border:1px solid rgba(255,255,255,0.2); border-radius:6px; padding:0 12px; height:36px; cursor:pointer; font-size:13px; font-weight:600; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); transition: background 0.2s;">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg> <span class="btn-text">Fullscreen</span>
                    </button>
                  </div>
                </div>
              `;
              container.appendChild(controls);

              setTimeout(() => {
                
                const rotateBtn = document.getElementById(`mv-rotate-${p.id}`);
                if (rotateBtn) {
                  rotateBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (mv.hasAttribute('auto-rotate')) {
                      mv.removeAttribute('auto-rotate');
                      rotateBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Auto Rotate`;
                    } else {
                      mv.setAttribute('auto-rotate', '');
                      rotateBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg> Pause`;
                    }
                  });
                }
                const fsBtn = document.getElementById(`mv-fullscreen-${p.id}`);
                if (fsBtn) {
                  fsBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (!document.fullscreenElement) {
                      container.requestFullscreen().catch(err => {
                        console.error('Fullscreen err:', err);
                      });
                    } else {
                      document.exitFullscreen();
                    }
                  });
                }
                const zoomInBtn = document.getElementById(`mv-zoom-in-${p.id}`);
                if (zoomInBtn) {
                  zoomInBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const orbit = mv.getCameraOrbit();
                    orbit.radius *= 0.8;
                    mv.cameraOrbit = `${orbit.theta}rad ${orbit.phi}rad ${orbit.radius}m`;
                  });
                }
                const zoomOutBtn = document.getElementById(`mv-zoom-out-${p.id}`);
                if (zoomOutBtn) {
                  zoomOutBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const orbit = mv.getCameraOrbit();
                    orbit.radius *= 1.25;
                    mv.cameraOrbit = `${orbit.theta}rad ${orbit.phi}rad ${orbit.radius}m`;
                  });
                }
              }, 100);mv.addEventListener('progress', (e) => {
            const percent = Math.round(e.detail.totalProgress * 100);
            if (fill) fill.style.width = percent + '%';
            if (text) {
              if (percent < 100) {
                text.textContent = `Downloading 3D Data... ${percent}%`;
              } else {
                text.textContent = `Finalizing 3D Model...`;
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
  const isSuperAdmin = localStorage.getItem('steeltrack_is_superadmin') === 'true';
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
        <div class="stat"><div class="n" id="stat-proj">0</div><div class="l">TOTAL PROJECTS</div></div>
        <div class="stat"><div class="n" id="stat-state">0</div><div class="l">REGIONS COVERED</div></div>
        <div class="stat"><div class="n" id="stat-tons">0</div><div class="l">TOTAL TONS</div></div>
      `;
      const animVal = (el, end) => {
        let startTS = null;
        const step = (ts) => {
          if (!startTS) startTS = ts;
          const p = Math.min((ts - startTS) / 1200, 1);
          const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
          if (el) el.innerHTML = Math.floor(ease * end).toLocaleString();
          if (p < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
      };
      animVal(document.getElementById('stat-proj'), PROJECTS.length);
      animVal(document.getElementById('stat-state'), stateCount);
      animVal(document.getElementById('stat-tons'), totalTons);
  }
  renderAdminTable(typeof getFilteredSortedAdminProjects === 'function' ? getFilteredSortedAdminProjects() : window.PROJECTS);

}

window.currentAdminPage = 1;
  const adminPageSize = 10;

  function renderAdminTable(list) {
    const tbody = document.getElementById('adminTableBody');
    if (!tbody) return;
    
    // Pagination logic
    const totalPages = Math.ceil(list.length / adminPageSize) || 1;
    if (window.currentAdminPage > totalPages) window.currentAdminPage = totalPages;
    const start = (window.currentAdminPage - 1) * adminPageSize;
    const pagedList = list.slice(start, start + adminPageSize);
    
    tbody.innerHTML = pagedList.map(p => {
    const isCanada = p.country && (p.country.toLowerCase() === 'ca' || p.country.toLowerCase() === 'canada');
    const countryStyle = isCanada 
      ? "color: #ef4444; background: #fef2f2; border: 1px solid #fecaca;" 
      : "color: #0284c7; background: #e0f2fe; border: 1px solid #bae6fd;";
      
    const iconFill = isCanada ? "#fef2f2" : "#e0f2fe";
    const iconStroke = isCanada ? "#ef4444" : "#0284c7";

    return `
      <tr class="admin-interactive-tr" style="transition: all 0.3s ease;">
        <td style="font-weight: 700; color: var(--ink); font-size: 14px;">${p.title}</td>
        <td><div style="display:flex; align-items:center; gap:8px; font-weight:600;"><svg width="16" height="16" viewBox="0 0 24 24" fill="${iconFill}" stroke="${iconStroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>${p.state}</div></td>
        <td><span style="font-weight:700; padding: 4px 8px; border-radius: 6px; ${countryStyle}">${p.country}</span></td>
        <td style="font-variant-numeric: tabular-nums; font-weight:800; color: #475569;">${(p.tons || 0).toLocaleString()} <span style="font-size:10px; color:#94a3b8">T</span></td>
        <td style="font-weight:600; color: #64748b;">${p.year || 'N/A'}</td>
        <td style="white-space: nowrap;">
          <button class="btn-icon color-edit" title="Edit" onclick="openEditModal('${p.id}')" style="background:#f0f9ff; color:#0284c7; border:1px solid #bae6fd; padding:8px; border-radius:8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="btn-icon color-delete" title="Delete" onclick="deleteProject('${p.id}')" style="background:#fef2f2; color:#ef4444; border:1px solid #fecaca; padding:8px; border-radius:8px; margin-left:6px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </td>
      </tr>
    `;
  }).join('');
    
    // Render pagination controls
    const paginationContainer = document.getElementById('adminPagination') || (function() {
      const c = document.createElement('div');
      c.id = 'adminPagination';
      c.style.display = 'flex';
      c.style.justifyContent = 'space-between';
      c.style.alignItems = 'center';
      c.style.padding = '16px';
      c.style.borderTop = '1px solid var(--border)';
      tbody.parentElement.parentElement.appendChild(c);
      return c;
    })();
    
    paginationContainer.innerHTML = `
      <div style="font-size:13px; color:var(--sub);">Showing ${start+1}-${Math.min(start+adminPageSize, list.length)} of ${list.length}</div>
      <div style="display:flex; gap:8px;">
        <button class="btn-sec" style="padding:4px 12px; font-size:13px;" ${window.currentAdminPage === 1 ? 'disabled' : ''} onclick="window.currentAdminPage--; renderAdminTable(typeof getFilteredSortedAdminProjects === 'function' ? getFilteredSortedAdminProjects() : window.PROJECTS)">Prev</button>
        <button class="btn-sec" style="padding:4px 12px; font-size:13px;" ${window.currentAdminPage === totalPages ? 'disabled' : ''} onclick="window.currentAdminPage++; renderAdminTable(typeof getFilteredSortedAdminProjects === 'function' ? getFilteredSortedAdminProjects() : window.PROJECTS)">Next</button>
      </div>
    `;
  }


async function deleteProject(id) {
  if (confirm('Remove this project?')) {
    try {
      await apiFetch('/projects/' + id, { method: 'DELETE' });
      PROJECTS = PROJECTS.filter(p => p.id !== id);
      renderAdmin();
      if (window.MapModule) window.MapModule.drawMap(window.PROJECT_STATS || PROJECTS, currentCategory, currentCountry);
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
          xhr.setRequestHeader('Authorization', 'Bearer ' + (localStorage.getItem('steeltrack_admin_token') || ''));
          
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
      if (window.MapModule) window.MapModule.drawMap(window.PROJECT_STATS || PROJECTS, currentCategory, currentCountry);
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
      th.querySelector('.sort-icon').innerHTML = currentAdminSort.asc ? ' â²' : ' â¼';
      
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
  // Load data â map renders after data arrives
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
    const coverInput = document.getElementById('d-cover');
    const status = document.getElementById('d-upload-status');

    if (!name || !tag || !fileInput.files[0]) {
      alert('Please fill out all fields and select a PDF file.');
      return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = 'Uploading...';
    status.innerText = 'Uploading PDF...';

    try {
      const formData = new FormData();
      formData.append('document', fileInput.files[0]);
      if (coverInput && coverInput.files[0]) {
        formData.append('images', coverInput.files[0]);
      }

      const res = await fetch('/api/media', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: formData
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Upload failed');

      // The returned path might have a leading slash, remove it so it's relative
      let pdfPath = json.document || '';
      if (pdfPath.startsWith('/')) pdfPath = pdfPath.substring(1);
      
      let coverPath = (json.images && json.images.length > 0) ? json.images[0] : '';
      if (coverPath.startsWith('/')) coverPath = coverPath.substring(1);
      
      if (!cachedDrawingsData[catKey]) {
        cachedDrawingsData[catKey] = { title: catKey, files: [] };
      }
      cachedDrawingsData[catKey].files.push({
        path: pdfPath,
        cover: coverPath,
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
window.openLightbox = function(src) {
  const overlay = document.createElement('div');
  overlay.id = 'customLightbox';
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.zIndex = '99999';
  overlay.style.backgroundColor = 'rgba(0,0,0,0.9)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.cursor = 'zoom-out';
  overlay.style.animation = 'viewFadeIn 0.3s ease';
  
  const img = document.createElement('img');
  img.src = src;
  img.style.maxWidth = '100vw';
  img.style.maxHeight = '100vh';
  img.style.objectFit = 'contain';
  
  const closeBtn = document.createElement('div');
  closeBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '20px';
  closeBtn.style.right = '20px';
  closeBtn.style.width = '44px';
  closeBtn.style.height = '44px';
  closeBtn.style.backgroundColor = '#fff';
  closeBtn.style.color = '#18181b';
  closeBtn.style.borderRadius = '50%';
  closeBtn.style.display = 'flex';
  closeBtn.style.alignItems = 'center';
  closeBtn.style.justifyContent = 'center';
  closeBtn.style.fontSize = '26px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
  
  overlay.appendChild(img);
  overlay.appendChild(closeBtn);
  
  overlay.onclick = function() {
    document.body.removeChild(overlay);
  };
  
  document.body.appendChild(overlay);
};

window.showToast = function(msg, type='success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.style.background = type === 'success' ? 'rgba(16,185,129,0.95)' : (type === 'error' ? 'rgba(239,68,68,0.95)' : 'rgba(59,130,246,0.95)');
  toast.style.backdropFilter = 'blur(10px)';
  toast.style.color = '#fff';
  toast.style.padding = '12px 24px';
  toast.style.borderRadius = '30px';
  toast.style.fontWeight = '600';
  toast.style.fontSize = '14px';
  toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
  toast.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
  toast.style.transform = 'translateY(20px)';
  toast.style.opacity = '0';
  toast.style.whiteSpace = 'nowrap';
  toast.innerHTML = msg;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
  }, 10);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
  }, 3000);
};

const STATE_COORDS = {
  'Texas': {lat: 31.9686, lon: -99.9018}, 'California': {lat: 36.7783, lon: -119.4179},
  'New York': {lat: 40.7128, lon: -74.0060}, 'Florida': {lat: 27.9944, lon: -81.7603},
  'Illinois': {lat: 40.0000, lon: -89.0000}, 'Ontario': {lat: 51.2538, lon: -85.3232},
  'British Columbia': {lat: 53.7267, lon: -127.6476}, 'Quebec': {lat: 52.9399, lon: -73.5491},
  'Washington': {lat: 47.7511, lon: -120.7401}, 'Nova Scotia': {lat: 44.6820, lon: -63.7443},
  'Alberta': {lat: 53.9333, lon: -116.5765}, 'Colorado': {lat: 39.5501, lon: -105.7821},
  'Pennsylvania': {lat: 41.2033, lon: -77.1945}, 'Michigan': {lat: 44.3148, lon: -85.6024},
  'Ohio': {lat: 40.4173, lon: -82.9071}, 'Georgia': {lat: 32.1656, lon: -82.9001},
  'North Carolina': {lat: 35.7596, lon: -79.0193}, 'Virginia': {lat: 37.4316, lon: -78.6569},
  'Massachusetts': {lat: 42.4072, lon: -71.3824}, 'New Jersey': {lat: 40.0583, lon: -74.4057},
  'Arizona': {lat: 34.0489, lon: -111.0937}, 'Nevada': {lat: 38.8026, lon: -116.4194},
  'Utah': {lat: 39.3210, lon: -111.0937}, 'Oregon': {lat: 43.8041, lon: -120.5542},
  'Maryland': {lat: 39.0458, lon: -76.6413}, 'Wisconsin': {lat: 43.7844, lon: -88.7879},
  'Minnesota': {lat: 46.7296, lon: -94.6859}, 'Missouri': {lat: 37.9643, lon: -91.8318},
  'Indiana': {lat: 39.7684, lon: -86.1581}, 'Tennessee': {lat: 35.5175, lon: -86.5804},
  'Manitoba': {lat: 53.7609, lon: -98.8139}, 'Saskatchewan': {lat: 52.9399, lon: -106.4509},
  'New Brunswick': {lat: 46.5653, lon: -66.4619},
  'New York State': {lat: 40.7128, lon: -74.0060}, 'United Arab Emirates': {lat: 23.4241, lon: 53.8478}
};




  // ─── Spotlight Search ───────────────────────────────────────────────────────
  const spotlightModal = document.getElementById('spotlightSearch');
  const spotlightInput = document.getElementById('spotlightInput');
  const spotlightResults = document.getElementById('spotlightResults');

  // Toggle Spotlight
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (spotlightModal.classList.contains('active')) {
        closeSpotlight();
      } else {
        openSpotlight();
      }
    }
    if (e.key === 'Escape' && spotlightModal.classList.contains('active')) {
      closeSpotlight();
    }
  });

  spotlightModal?.addEventListener('click', (e) => {
    if (e.target === spotlightModal) closeSpotlight();
  });

  window.openSpotlight = openSpotlight;
  function openSpotlight() {
    spotlightModal.classList.add('active');
    spotlightInput.focus();
    renderSpotlightResults('');
  }

  window.closeSpotlight = closeSpotlight;
  function closeSpotlight() {
    spotlightModal.classList.remove('active');
    spotlightInput.value = '';
  }

  spotlightInput?.addEventListener('input', (e) => {
    renderSpotlightResults(e.target.value.trim().toLowerCase());
  });

  function renderSpotlightResults(query) {
    if (!spotlightResults) return;
    spotlightResults.innerHTML = '';
    
    let filtered = window.PROJECTS || [];
    if (query) {
      filtered = filtered.filter(p => 
        (p.title && p.title.toLowerCase().includes(query)) ||
        (p.state && p.state.toLowerCase().includes(query)) ||
        (p.category && p.category.toLowerCase().includes(query)) ||
        (p.tons && p.tons.toString().includes(query))
      );
    }
    
    // Limit to 20 results for performance
    filtered = filtered.slice(0, 20);
    
    if (filtered.length === 0) {
      spotlightResults.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--sub);">No projects found</div>';
      return;
    }
    
    filtered.forEach(p => {
      const row = document.createElement('div');
      row.className = 'proj-row';
      row.style.cursor = 'pointer';
      
      const thumb = (p.images && p.images[0]) ? (p.images[0].startsWith('http') ? p.images[0] : 'uploads/' + p.images[0]) : 'assets/logo.png';
      const fallback = "this.src='assets/logo.png'";
      
      row.innerHTML = `
        <img class="prow-img" src="${thumb}" onerror="${fallback}">
        <div class="prow-body">
          <div class="prow-eyebrow">${p.category}</div>
          <div class="prow-title">${p.title}</div>
          <div class="prow-meta">
            ${p.tons ? `<span class="prow-badge">${p.tons} Tons</span>` : ''}
            <span style="color:var(--sub); font-size:12px;">${p.state}</span>
          </div>
        </div>
      `;
      row.addEventListener('click', () => {
        closeSpotlight();
        window.openDetail(p.id);
      });
      spotlightResults.appendChild(row);
    });
  }

// Mobile Bottom Nav Hooks
document.getElementById('mbnMap')?.addEventListener('click', () => { showView('map'); document.querySelectorAll('.mbn-item').forEach(e => e.classList.remove('active')); document.getElementById('mbnMap').classList.add('active'); });
document.getElementById('mbnDrawings')?.addEventListener('click', () => { showView('drawings'); document.querySelectorAll('.mbn-item').forEach(e => e.classList.remove('active')); document.getElementById('mbnDrawings').classList.add('active'); });
document.getElementById('mbnBrochure')?.addEventListener('click', () => { showView('brochure'); document.querySelectorAll('.mbn-item').forEach(e => e.classList.remove('active')); document.getElementById('mbnBrochure').classList.add('active'); });
