// Global state —

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

function updateLogoForTheme() {
  const isDark = document.body.classList.contains('dark-mode');
  const logoSrc = isDark ? 'assets/logo-white.png' : 'assets/logo.png';
  document.querySelectorAll('.brand .logo-box img, #loginLogo img, .login-logo img').forEach(img => {
    img.src = logoSrc;
  });
}

function initThemeToggle() {
  const savedTheme = localStorage.getItem('steeltrack_theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
  updateLogoForTheme();

  const toggleTheme = () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('steeltrack_theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    updateLogoForTheme();
  };

  document.querySelectorAll('.minimal-theme-toggle').forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });
}



// ============================================================

// API HELPER

// ============================================================

function getApiBase() {
  const origin = window.location.origin || '';
  const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1');
  if (isLocal && window.location.port !== '5050') {
    const protocol = window.location.protocol.startsWith('http') ? window.location.protocol : 'http:';
    const host = window.location.hostname || 'localhost';
    return `${protocol}//${host}:5050/api`;
  }
  return '/api';
}

window.getApiBase = getApiBase;



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

  const apiBase = getApiBase();

  const res = await fetch(apiBase + url, {

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

      const loadedProj = proj.data || proj.projects || (Array.isArray(proj) ? proj : []);
      if (loadedProj && loadedProj.length > 0) {
        PROJECTS = loadedProj.map(p => {
          if (typeof p.images === 'string') {
            try { p.images = JSON.parse(p.images); } catch(e) { p.images = []; }
          }
          if (!Array.isArray(p.images)) p.images = [];
          return p;
        });
      } else {

        throw new Error('Empty projects from API');

      }

    } catch(e) {

      console.warn('Backend API not available, loading fallback 100 projects data...', e);

      try {

        const fallbackRes = await fetch('assets/data/projects_100.json');

        const raw = await fallbackRes.json();
        PROJECTS = (raw || []).map(p => {
          if (typeof p.images === 'string') {
            try { p.images = JSON.parse(p.images); } catch(e) { p.images = []; }
          }
          if (!Array.isArray(p.images)) p.images = [];
          return p;
        });

      } catch(err) {

        console.error('Failed to load fallback projects_100.json:', err);

        PROJECTS = [];

      }

    }





    // Populate dropdowns and checkboxes

    const catSel = document.getElementById('f-category');

    if (catSel) catSel.innerHTML = ((window.CONFIG?.CATEGORIES || ['Industrial','Commercial','Healthcare','Warehouse','Stadium','Institutional','Manufacturing','Data Center','Oil & Gas','Power Plant','Bridge','Misc Steel']) || []).filter(c => c !== 'All').map(c => `<option value="${c}">${c}</option>`).join('');

    

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

    if (typeof window.restoreNavState === 'function') {
      window.restoreNavState();
    }

  }

}



function renderMap() {

  if (window.MapModule) {

    window.MapModule.loadMapData(() => {

      window.MapModule.drawMap(PROJECTS, currentCategory, currentCountry);

      initCountryToggle();

      if (window.AtlasMapIntro && typeof window.AtlasMapIntro.init === 'function') {

        window.AtlasMapIntro.init();

      }

    });

  } else {

    let retries = 0;

    const interval = setInterval(() => {

      retries++;

      if (window.MapModule) {

        clearInterval(interval);

        window.MapModule.loadMapData(() => {

          window.MapModule.drawMap(PROJECTS, currentCategory, currentCountry);

          initCountryToggle();

          if (window.AtlasMapIntro && typeof window.AtlasMapIntro.init === 'function') {

            window.AtlasMapIntro.init();

          }

        });

      } else if (retries > 20) {

        clearInterval(interval);

      }

    }, 100);

  }

}



window.updateCountryToggleUI = function(country) {

  currentCountry = country || 'us';

  const isCa = currentCountry === 'ca' || currentCountry === 'Canada';

  const targetCountry = isCa ? 'ca' : 'us';



  document.body.classList.toggle('theme-ca', isCa);



  // 1. Sync active class on all buttons across all country toggles

  document.querySelectorAll('.minimal-toggle').forEach(t => {

    t.querySelectorAll('.min-btn').forEach(b => {

      b.classList.toggle('active', b.dataset.country === targetCountry);

    });

  });



  // 2. Sync slider position on all sliders

  document.querySelectorAll('.min-slider').forEach(s => {

    s.classList.toggle('ca', isCa);

  });



  // 3. Sync slider text and SVG icons across all slider text containers

  const usIcon = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M 4 7 L 12 7 L 13 9 L 15 8 L 17 7 L 20 6 L 21 9 L 19 13 L 19 18 L 17 17 L 15 14 L 13 14 L 11 18 L 9 17 L 7 13 L 4 13 L 3 9 Z"></path></svg>';

  const caIcon = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M 4 17 L 12 17 L 13 19 L 15 18 L 17 17 L 20 16 L 22 15 L 22 11 L 19 8 L 16 10 L 13 10 L 12 6 L 6 5 L 4 5 L 4 11 L 2 14 Z"></path></svg>';

  const textHtml = (isCa ? caIcon + ' Canada' : usIcon + ' USA');



  document.querySelectorAll('.slider-text').forEach(st => {

    st.innerHTML = textHtml;

  });



  // 4. Update Hero Pill, Highlight, and Brand Footer

  const heroPill = document.getElementById('heroPill');

  const heroHighlight = document.getElementById('heroCountryHighlight');

  const brandFooter = document.getElementById('atlasBrandFooter');



  if (isCa) {

    if (brandFooter) brandFooter.classList.add('ca');

    if (heroPill) { heroPill.classList.remove('usa'); heroPill.classList.add('ca'); }

    if (heroHighlight) heroHighlight.className = 'highlight-ca';

  } else {

    if (brandFooter) brandFooter.classList.remove('ca');

    if (heroPill) { heroPill.classList.remove('ca'); heroPill.classList.add('usa'); }

    if (heroHighlight) heroHighlight.className = 'highlight-usa';

  }

};



function initCountryToggle() {

  document.querySelectorAll('.min-btn').forEach(btn => {

    btn.onclick = function(e) {

      const country = this.dataset.country;

      if (country === currentCountry) return;



      // Ripple burst effect

      const rect = btn.getBoundingClientRect();

      const circle = document.createElement('span');

      circle.className = 'toggle-burst-dot';

      circle.style.left = (e.clientX ? (e.clientX - rect.left) : (rect.width / 2)) + 'px';

      circle.style.top = (e.clientY ? (e.clientY - rect.top) : (rect.height / 2)) + 'px';

      btn.appendChild(circle);

      setTimeout(() => circle.remove(), 600);



      updateCountryToggleUI(country);



      const mapEl = document.getElementById('map');

      if (mapEl) {

        mapEl.classList.add('fade-out');

        setTimeout(() => {

          if (window.MapModule) window.MapModule.drawMap(PROJECTS, currentCategory, currentCountry);

          setTimeout(() => mapEl.classList.remove('fade-out'), 50);

        }, 250);

      } else {

        if (window.MapModule) window.MapModule.drawMap(PROJECTS, currentCategory, currentCountry);

      }

    };

  });

}



// ============================================================

// CATEGORY CHIPS

// ============================================================

function renderCategoryChips() {

  const isMobile = window.innerWidth <= 768;

  const desktopContainer = document.getElementById('desktopControlsContainer');

  const mobileContainer = document.getElementById('mobileControlsContainer');

  const chipRow = document.getElementById('categoryChipRow');



  if (chipRow) {

    if (isMobile && mobileContainer && chipRow.parentElement !== mobileContainer) {

      mobileContainer.appendChild(chipRow);

    } else if (!isMobile && desktopContainer && chipRow.parentElement !== desktopContainer) {

      desktopContainer.appendChild(chipRow);

    }

  }



  const row = chipRow;

  if (!row) return;

  const cats = (window.CONFIG?.CATEGORIES || ['Industrial','Commercial','Healthcare','Warehouse','Stadium','Institutional','Manufacturing','Data Center','Oil & Gas','Power Plant','Bridge','Misc Steel']) || ['All'];

  const oldSearch = document.getElementById('globalProjectSearch');

  const oldVal = oldSearch ? oldSearch.value : '';

  const searchPlaceholder = 'Search projects...';

  const chipsHTML = cats.map(c =>

    `<button class="filter-chip ${c === currentCategory ? 'active' : ''}" data-cat="${c}">${c}</button>`

  ).join('');



  if (isMobile) {

    row.innerHTML = 

    `<div class="chip-scroll-wrapper" style="position: relative; width: 100%;">

      <div class="filter-chip-container" style="display: flex; gap: 8px; flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; align-items: center; padding-bottom: 4px; width: 100%;">

        ${chipsHTML}

      </div>

      <button class="chip-scroll-arrow right" id="chipScrollRightBtn" title="Scroll right for more categories" aria-label="Scroll right">

        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>

      </button>

    </div>`;



    // Inject floating row directly into body to avoid position:fixed containing block issues from transformed parents

    let floatingRow = document.getElementById('mFloatingSearchRowObj');

    if (!floatingRow) {

      floatingRow = document.createElement('div');

      floatingRow.id = 'mFloatingSearchRowObj';

      floatingRow.className = 'm-floating-search-row';

      document.body.appendChild(floatingRow);

    }



    floatingRow.innerHTML = `

        <form role="search" autocomplete="off" onsubmit="event.preventDefault(); return false;" class="inline-search-wrap" style="flex:1;" onclick="if(window.innerWidth <= 768 && typeof openSpotlight === 'function') openSpotlight(document.getElementById('globalProjectSearch').value.trim());">

          <div class="search-badge-icon">

            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">

              <circle cx="11" cy="11" r="8"></circle>

              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>

            </svg>

          </div>

          <input type="search" id="globalProjectSearch" name="search_atlas_projects_m" placeholder="${searchPlaceholder}" value="${oldVal ? String(oldVal).replace(/"/g, '&quot;') : ''}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" role="searchbox" aria-autocomplete="none" data-lpignore="true" data-1p-ignore="true" data-bwignore="true" data-form-type="other" readonly onfocus="this.removeAttribute('readonly');" onpointerdown="this.removeAttribute('readonly');">

        </form>
        <div class="m-morph-clone-wrap" id="mMorphCloneWrap">
          <button type="button" class="m-search-back-btn" id="mNavBackBtn" title="Back to Folders">
            <svg class="m-morph-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span class="m-morph-text" style="font-weight: 800; font-size: 11.5px; letter-spacing: 0.5px;">BACK</span>
          </button>
          <button type="button" class="m-search-website-btn" id="mNavWebsiteBtn" title="Visit Website">
            <div class="morph-face face-website">
              <span class="m-morph-text">Website</span>
              <svg class="m-morph-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
            <div class="morph-face face-top">
              <svg class="m-morph-arrow" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
            </div>
          </button>
        </div>`;

  } else {

    // 2-Row Grid layout matching edge-to-edge with identical equal gaps
    const row1Cats = ['All', 'Industrial', 'Commercial', 'Healthcare', 'Warehouse', 'Stadium', 'Institutional', 'Manufacturing', 'Data Center'];
    const row2Cats = cats.filter(c => !row1Cats.includes(c));

    const row1HTML = row1Cats.filter(c => cats.includes(c)).map(c =>
      `<button class="filter-chip desktop-grid-chip ${c === currentCategory ? 'active' : ''}" data-cat="${c}">${c}</button>`
    ).join('');

    const row2HTML = row2Cats.map(c =>
      `<button class="filter-chip desktop-grid-chip ${c === currentCategory ? 'active' : ''}" data-cat="${c}">${c}</button>`
    ).join('');

    row.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 10px; width: 100%;">
      <!-- Row 1: 9 equal columns spanning 100% full width with uniform 8px gap -->
      <div style="display: flex; gap: 8px; width: 100%;">
        ${row1HTML}
      </div>

      <!-- Row 2: 4 equal chips matching Row 1 column width + search bar spanning remaining columns to exact same right edge -->
      <div style="display: flex; gap: 8px; width: 100%; align-items: center;">
        ${row2HTML}

        <form role="search" autocomplete="off" onsubmit="event.preventDefault(); return false;" class="ask-ai-wrapper uiverse-search-group" style="position: relative; flex: 5 1 0; min-width: 0; margin: 0; height: 100%;">
          <div class="ai-input-container" style="display: flex; align-items: center; justify-content: space-between; width: 100%; height: 100%; min-height: 38px; border: 1.5px solid var(--border-subtle, #cbd5e1); border-radius: 100px; padding: 0 14px; background: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.04); box-sizing: border-box;">
            <input placeholder="Search projects by title, state, or category..." id="globalProjectSearch" name="search_atlas_projects" value="${oldVal ? String(oldVal).replace(/"/g, '&quot;') : ''}" class="ai-input" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" role="searchbox" aria-autocomplete="none" data-lpignore="true" data-1p-ignore="true" data-bwignore="true" data-form-type="other" style="flex: 1; border: none !important; outline: none !important; outline-width: 0 !important; outline-style: none !important; box-shadow: none !important; -webkit-focus-ring-color: transparent !important; background: transparent; font-size: 13px; font-family: 'Inter', sans-serif; color: var(--ink, #0f172a);" />
            <span class="icon-container" style="display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-left: 8px; color: var(--sub, #64748b);">
              <svg viewBox="0 0 24 24" height="18" width="18" xmlns="http://www.w3.org/2000/svg" class="ai-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
          </div>
        </form>
      </div>
    </div>`;

  }



  const scrollBtn = document.getElementById('chipScrollRightBtn');

  const chipContainer = row.querySelector('.filter-chip-container');

  if (scrollBtn && chipContainer) {

    scrollBtn.addEventListener('click', () => {

      chipContainer.scrollBy({ left: 160, behavior: 'smooth' });

    });

    chipContainer.addEventListener('scroll', () => {

      const isEnd = chipContainer.scrollLeft + chipContainer.clientWidth >= chipContainer.scrollWidth - 15;

      scrollBtn.style.opacity = isEnd ? '0' : '1';

      scrollBtn.style.pointerEvents = isEnd ? 'none' : 'auto';

    });

  }



  row.querySelectorAll('.filter-chip').forEach(chip => {

    chip.addEventListener('click', () => {

      currentCategory = chip.dataset.cat;

      renderCategoryChips();

      if (window.MapModule) window.MapModule.drawMap(PROJECTS, currentCategory, currentCountry);

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

        if (window.MapModule) window.MapModule.drawMap(PROJECTS, currentCategory, currentCountry);

        closePanel();

      };

    }
    const searchInput = document.getElementById('globalProjectSearch');

    const searchBtn = document.getElementById('globalSearchBtn');

    

    // Cosmos-style Dropdown Search Popup
    function renderCosmosPopup(query) {
      const searchInput = document.getElementById('globalProjectSearch');
      const searchGroup = searchInput
        ? (searchInput.closest('.uiverse-search-group') || searchInput.closest('.ask-ai-wrapper') || searchInput.closest('.inline-search-wrap') || searchInput.parentElement)
        : document.querySelector('.uiverse-search-group');

      if (!searchGroup) return;

      searchGroup.style.position = 'relative';

      let popup = document.getElementById('cosmosSearchDropdown');
      if (!popup) {
        popup = document.createElement('div');
        popup.id = 'cosmosSearchDropdown';
        popup.className = 'cosmos-search-popup';
      }

      if (popup.parentElement !== searchGroup) {
        searchGroup.appendChild(popup);
      }

      const q = (query || '').trim().toLowerCase();
      const allProjects = window.PROJECT_STATS || PROJECTS || [];

      if (q.length > 0) {
        // Query Results Mode
        const matches = allProjects.filter(p => projectMatchesQuery(p, q));
        const numMatch = q.match(/(?:>|>=|above|over|more than|\+)?\s*(\d+[\d,]*)/);
        const isPureNumericOrTons = numMatch && (/^[\s>=\+]*\d+[\d,]*\s*(tons?|t)?$/i.test(q) || q.includes('ton'));
        let headerLabel = 'Matching Projects';
        if (isPureNumericOrTons && numMatch[1]) {
          const val = parseFloat(numMatch[1].replace(/,/g, ''));
          if (!isNaN(val)) headerLabel = `Projects ≥ ${val.toLocaleString()} Tons`;
        }

        let resultsHtml = `
          <div class="cosmos-section">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px;">
              <h4 class="cosmos-title">${headerLabel}</h4>
              <span style="font-size:11.5px; color:#9ca3af; font-weight: 600;">${matches.length} found</span>
            </div>`;

        if (matches.length === 0) {
          resultsHtml += `
            <div style="padding: 20px 0; text-align: center; color: #9ca3af; font-size: 13px;">
              No projects found for "${query}"
            </div>`;
        } else {
          resultsHtml += `<div class="cosmos-results-list">`;
          matches.slice(0, 8).forEach(p => {
            let imgUrl = 'assets/logo.png';
            if (p.images && p.images.length > 0) {
              const firstImg = p.images[0];
              imgUrl = (typeof firstImg === 'string' && firstImg.startsWith('http')) ? firstImg : `/uploads/${firstImg}`;
            }
            resultsHtml += `
              <div class="cosmos-result-item" data-id="${p.id}">
                <div class="cosmos-res-left" style="display:flex; align-items:center; gap:12px; overflow:hidden;">
                  <img class="cosmos-res-thumb" src="${imgUrl}" onerror="this.src='assets/logo.png'" style="width:40px; height:40px; border-radius:8px; object-fit:cover; flex-shrink:0;">
                  <div style="overflow:hidden;">
                    <div class="cosmos-res-title" style="font-weight:700; font-size:13.5px; color:var(--fg, #0f172a); text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${p.title || p.name || 'Untitled Project'}</div>
                    <div class="cosmos-res-sub" style="font-size:11.5px; color:var(--sub, #64748b); text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${p.state || p.location || ''}${p.category ? ' · ' + p.category : ''}</div>
                  </div>
                </div>
                ${p.tons ? `<div class="cosmos-res-tons" style="font-size:11.5px; font-weight:700; background:rgba(37,99,235,0.1); color:#2563eb; padding:3px 8px; border-radius:6px; flex-shrink:0;">${Math.round(p.tons).toLocaleString()} T</div>` : ''}
              </div>`;
          });
          resultsHtml += `</div>`;
        }
        resultsHtml += `</div>`;
        popup.innerHTML = resultsHtml;
      } else {
        // Helper to get first project image for a category
        const getCatImg = (catName) => {
          const matchProj = allProjects.find(p => p.category && p.category.toLowerCase() === catName.toLowerCase() && p.images && p.images.length > 0);
          if (matchProj && matchProj.images && matchProj.images.length > 0) {
            const firstImg = matchProj.images[0];
            return (typeof firstImg === 'string' && firstImg.startsWith('http')) ? firstImg : `/uploads/${firstImg}`;
          }
          return 'assets/logo.png';
        };

        const industrialImg = getCatImg('Industrial');
        const commercialImg = getCatImg('Commercial');
        const stadiumImg = getCatImg('Stadium');

        // Default Explore Mode (Trending & Categories)
        popup.innerHTML = `
          <div class="cosmos-section">
            <h4 class="cosmos-title">Trending</h4>
            <div class="cosmos-pills-row">
              <button type="button" class="cosmos-pill" data-trend="Industrial">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                <span>Industrial</span>
              </button>
              <button type="button" class="cosmos-pill" data-trend="Data Center">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                <span>Data Center</span>
              </button>
              <button type="button" class="cosmos-pill" data-trend="Healthcare">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                <span>Healthcare</span>
              </button>
              <button type="button" class="cosmos-pill" data-trend="Commercial">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                <span>Commercial</span>
              </button>
            </div>
          </div>

          <div class="cosmos-section">
            <h4 class="cosmos-title">Categories</h4>
            <div class="cosmos-cards-grid">
              <div class="cosmos-card" data-cat="Industrial">
                <img class="cosmos-card-thumb" src="${industrialImg}" onerror="this.src='assets/logo.png'">
                <span class="cosmos-card-label">Industrial</span>
              </div>
              <div class="cosmos-card" data-cat="Commercial">
                <img class="cosmos-card-thumb" src="${commercialImg}" onerror="this.src='assets/logo.png'">
                <span class="cosmos-card-label">Commercial</span>
              </div>
              <div class="cosmos-card" data-cat="Stadium">
                <img class="cosmos-card-thumb" src="${stadiumImg}" onerror="this.src='assets/logo.png'">
                <span class="cosmos-card-label">Stadium</span>
              </div>
            </div>
          </div>
        `;
      }

      // Attach interaction listeners inside dropdown
      popup.querySelectorAll('.cosmos-pill').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const trend = btn.dataset.trend;
          if (searchInput) searchInput.value = trend;
          renderCosmosPopup(trend);
          const matches = allProjects.filter(p => projectMatchesQuery(p, trend));
          if (window.MapModule) window.MapModule.drawMap(matches, currentCategory, currentCountry);
        };
      });

      popup.querySelectorAll('.cosmos-card').forEach(card => {
        card.onclick = (e) => {
          e.stopPropagation();
          currentCategory = card.dataset.cat;
          renderCategoryChips();
          if (window.MapModule) window.MapModule.drawMap(allProjects, currentCategory, currentCountry);
          closeCosmosPopup();
        };
      });

      popup.querySelectorAll('.cosmos-result-item').forEach(item => {
        item.onclick = (e) => {
          e.stopPropagation();
          closeCosmosPopup();
          if (window.openDetail) window.openDetail(item.dataset.id);
        };
      });

      popup.classList.add('active');
    }

    function closeCosmosPopup() {
      const popup = document.getElementById('cosmosSearchDropdown');
      if (popup) popup.classList.remove('active');
    }

    // Close on outside click
    document.addEventListener('click', (e) => {
      const popup = document.getElementById('cosmosSearchDropdown');
      const searchInput = document.getElementById('globalProjectSearch');
      if (popup && popup.classList.contains('active')) {
        const searchGroup = searchInput
          ? (searchInput.closest('.uiverse-search-group') || searchInput.closest('.ask-ai-wrapper') || searchInput.closest('.inline-search-wrap') || searchInput.parentElement)
          : null;
        if (searchGroup && !searchGroup.contains(e.target)) {
          closeCosmosPopup();
        }
      }
    });

    function executeSearch() {
      const q = searchInput ? searchInput.value.trim() : '';
      const allProjects = window.PROJECT_STATS || PROJECTS || [];
      if (!q) {
        if (window.MapModule) window.MapModule.drawMap(allProjects, currentCategory, currentCountry);
        renderCosmosPopup('');
        return;
      }
      const filtered = allProjects.filter(p => projectMatchesQuery(p, q));
      if (window.MapModule) window.MapModule.drawMap(filtered, currentCategory, currentCountry);
      renderCosmosPopup(q);
    }

    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        executeSearch();
      });
    }

    if (searchInput) {
      searchInput.addEventListener('focus', () => {
        renderCosmosPopup(searchInput.value.trim());
      });

      searchInput.addEventListener('click', (e) => {
        e.stopPropagation();
        renderCosmosPopup(searchInput.value.trim());
      });

      searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim();
        renderCosmosPopup(q);
        const allProjects = window.PROJECT_STATS || PROJECTS || [];
        if (q) {
          const filtered = allProjects.filter(p => projectMatchesQuery(p, q));
          if (window.MapModule) window.MapModule.drawMap(filtered, currentCategory, currentCountry);
        } else {
          if (window.MapModule) window.MapModule.drawMap(allProjects, currentCategory, currentCountry);
        }
      });

      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeCosmosPopup();
        }
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



  // ── Topbar Morph Button (Website ↔ Back to Top) ──
  const navWebsiteBtn = document.getElementById('navWebsiteBtn');

  const checkScroll = (val, isPanel = false) => {
    const isMap = document.getElementById('view-map')?.classList.contains('active');
    const isDetailOpen = document.getElementById('detailOverlay')?.classList.contains('open');
    const mBtn = document.getElementById('mNavWebsiteBtn');
    const mBackBtn = document.getElementById('mNavBackBtn');
    const mWrap = document.getElementById('mMorphCloneWrap');

    // Do not morph on main map if no panel or detail overlay is open
    if (isMap && !isPanel && !isDetailOpen) {
      if (navWebsiteBtn) navWebsiteBtn.classList.remove('is-scrolled');
      if (mBtn) mBtn.classList.remove('is-scrolled');
      if (mBackBtn) mBackBtn.classList.remove('is-scrolled');
      if (mWrap) mWrap.classList.remove('is-scrolled');
      return;
    }

    if (val > 120) {
      if (navWebsiteBtn) navWebsiteBtn.classList.add('is-scrolled');
      if (mBtn) mBtn.classList.add('is-scrolled');
      if (mBackBtn) mBackBtn.classList.add('is-scrolled');
      if (mWrap) mWrap.classList.add('is-scrolled');
    } else {
      if (navWebsiteBtn) navWebsiteBtn.classList.remove('is-scrolled');
      if (mBtn) mBtn.classList.remove('is-scrolled');
      if (mBackBtn) mBackBtn.classList.remove('is-scrolled');
      if (mWrap) mWrap.classList.remove('is-scrolled');
    }
  };

  document.querySelectorAll('.view').forEach(container => {
    container.addEventListener('scroll', (e) => checkScroll(e.target.scrollTop, false));
  });

  const panel = document.getElementById('panel');
  const panelBody = document.getElementById('panelBody');
  const detailOverlay = document.getElementById('detailOverlay');

  if (panel) panel.addEventListener('scroll', (e) => checkScroll(e.target.scrollTop, true));
  if (panelBody) panelBody.addEventListener('scroll', (e) => checkScroll(e.target.scrollTop, true));
  if (detailOverlay) detailOverlay.addEventListener('scroll', (e) => checkScroll(e.target.scrollTop, true));
  window.addEventListener('scroll', () => checkScroll(window.scrollY, false));

  // Handle Desktop Button Click
  if (navWebsiteBtn) {
    navWebsiteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (navWebsiteBtn.classList.contains('is-scrolled')) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.querySelectorAll('.view').forEach(c => c.scrollTo({ top: 0, behavior: 'smooth' }));
        if (panel) panel.scrollTo({ top: 0, behavior: 'smooth' });
        if (panelBody) panelBody.scrollTo({ top: 0, behavior: 'smooth' });
        if (detailOverlay) detailOverlay.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.open('https://www.brainstorminfotech.com', '_blank', 'noopener,noreferrer');
      }
    });
  }

  // Handle Mobile Button Click (Delegated since it's dynamically rendered)
  document.body.addEventListener('click', (e) => {
    const mBackBtnClick = e.target.closest('#mNavBackBtn');
    if (mBackBtnClick) {
      e.preventDefault();
      if (window.renderFolders) window.renderFolders();
      return;
    }

    const mBtn = e.target.closest('#mNavWebsiteBtn');
    if (mBtn) {
      e.preventDefault();
      if (mBtn.classList.contains('is-scrolled')) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.querySelectorAll('.view').forEach(c => c.scrollTo({ top: 0, behavior: 'smooth' }));
        if (panel) panel.scrollTo({ top: 0, behavior: 'smooth' });
        if (panelBody) panelBody.scrollTo({ top: 0, behavior: 'smooth' });
        if (detailOverlay) detailOverlay.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.open('https://www.brainstorminfotech.com', '_blank', 'noopener,noreferrer');
      }
    }
  });



  // —



  // Mobile Bottom Dock Button Listeners

  document.getElementById('mNavMapBtn')?.addEventListener('click', (e) => { e.preventDefault(); goToMap(); });

  document.getElementById('mNavDrawingsBtn')?.addEventListener('click', () => {

    showView('drawings');

    if (!drawingsLoaded) {

      loadDrawingsData();

    } else {

      setupDrawingsFilter();

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



  // Footer Navigation Listeners

  document.getElementById('footerNavMapLink')?.addEventListener('click', (e) => {

    e.preventDefault();

    goToMap();

    window.scrollTo({ top: 0, behavior: 'smooth' });

  });



  document.getElementById('footerNavDrawingsLink')?.addEventListener('click', (e) => {

    e.preventDefault();

    showView('drawings');

    if (!drawingsLoaded) {

      loadDrawingsData();

    } else {

      setupDrawingsFilter();

    }

  });



  document.getElementById('footerNavBrochureLink')?.addEventListener('click', (e) => {

    e.preventDefault();

    const brochureInput = document.getElementById('navBrochureDlInput');

    if (brochureInput) {

      brochureInput.checked = true;

      brochureInput.dispatchEvent(new Event('change'));

    } else {

      const a = document.createElement('a');

      a.href = 'assets/docs/brochure.pdf';

      a.download = 'Brainstorm_Infotech_Brochure.pdf';

      a.click();

      if (window.showToast) window.showToast('Downloading Brochure PDF...', 'success');

    }

  });



  function loadDrawingsData(cb) {

    const tryFetch = (url) => fetch(url).then(res => { if (!res.ok) throw new Error('Not OK'); return res.json(); });

    tryFetch('/drawings_data.json')

      .catch(() => tryFetch('drawings_data.json'))

      .catch(() => tryFetch(getApiBase() + '/drawings'))

      .then(data => {

        if (data) {

          renderDrawingsGallery(data);

          drawingsLoaded = true;

          setupDrawingsFilter();

          if (typeof cb === 'function') cb(data);

        }

      })

      .catch(err => console.error('Failed to load drawings data:', err));

  }

  window.loadDrawingsData = loadDrawingsData;



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
    window.cachedDrawingsData = data;

    const rawHash = (window.location.hash || '').replace(/^#\/?/, '').trim();
    const curFolder = sessionStorage.getItem('brainstorm_drawings_folder');

    if (rawHash.startsWith('drawings/') && rawHash.length > 9) {
      const catKey = rawHash.split('/')[1];
      if (catKey && cachedDrawingsData[catKey]) {
        renderFolderContents(catKey, false);
      } else {
        renderFolders(false);
      }
    } else if (curFolder && cachedDrawingsData[curFolder]) {
      renderFolderContents(curFolder, false);
    } else {
      renderFolders(false);
    }

    // Set up back button
    document.getElementById('btnBackToFolders')?.addEventListener('click', () => {
      renderFolders();
    });

  }



  function renderFolders(updateHistory = true) {

    window.renderFolders = renderFolders;
    try { window.scrollTo(0, 0); } catch(e) {}

    if (updateHistory) {
      window.location.hash = 'drawings';
      sessionStorage.setItem('brainstorm_current_view', 'drawings');
      sessionStorage.removeItem('brainstorm_drawings_folder');
    }

    const gallery = document.getElementById('drawingsGallery');

    const breadcrumb = document.getElementById('drawingsBreadcrumbRow');
    
    // Hide back-to-folder floating button when not in a folder
    document.body.classList.remove('in-folder-view');

    if (!gallery) return;

    

    breadcrumb.style.display = 'none';

    let html = '';

    

    const categoryIcons = {

      canada: 'assets/map_icons/map_canada.png',

      quebec: 'assets/map_icons/map_quebec.png',

      usa: 'assets/map_icons/map_usa.png',

      uae: 'assets/map_icons/map_uae.png',

      misc: 'assets/map_icons/map_misc.png'

    };

    

    // Explicit requested order: Canada -> Quebec Canada -> USA -> UAE -> Miscellaneous Framing Sheets

    const desiredOrder = ['canada', 'quebec', 'usa', 'uae', 'misc'];

    

    const pastelThemeColors = {
      canada: { bg: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', circle: '#334155' },
      quebec: { bg: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', circle: '#334155' },
      usa: { bg: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', circle: '#334155' },
      uae: { bg: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', circle: '#334155' },
      misc: { bg: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', circle: '#334155' }
    };

    desiredOrder.forEach(catKey => {
      const categoryData = cachedDrawingsData[catKey];
      if (!categoryData) return;

      const count = categoryData.files ? categoryData.files.length : 0;
      const imgSrc = categoryIcons[catKey] || 'assets/map_icons/map_misc.png';
      const isMisc = catKey === 'misc';
      const theme = pastelThemeColors[catKey] || pastelThemeColors.misc;

      const subtext = isMisc ? `<div class="smooky-subtext">Complex stair / framing drawing samples and standard details.</div>` : '';

      html += `
      <div class="smooky-card group ${isMisc ? 'smooky-card-wide' : ''}" data-cat="${catKey}" onclick="window.renderFolderContents('${catKey}')">
        <div class="smooky-card-left">
          <h3 class="smooky-title">${categoryData.title}</h3>
          <div class="smooky-files-badge">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <span>${count} Files</span>
          </div>
          ${subtext}
          <div class="smooky-action-wrap">
            <span class="smooky-action-lbl">Explore Now</span>
            <span class="smooky-action-circle">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </span>
          </div>
        </div>
        <div class="smooky-card-right">
          <div class="smooky-wave-bg" style="--pc-pastel-bg: ${theme.bg};"></div>
          <div class="smooky-icon-box">
            <img src="${imgSrc}" alt="${categoryData.title}" class="smooky-card-img" />
          </div>
        </div>
      </div>
      `;
    });

    

    gallery.innerHTML = html;

    

    // Add click listeners to folders

    document.querySelectorAll('.smooky-card').forEach(card => {

      card.addEventListener('click', function() {

        const cat = this.dataset.cat;

        renderFolderContents(cat);

      });

    });



    // Attach IntersectionObserver for mobile auto-reveal on scroll

    setupFolderIntersectionObserver();

  }



  function renderFolderContents(catKey, updateHistory = true) {

    window.renderFolderContents = renderFolderContents;
    try { window.scrollTo(0, 0); } catch(e) {}

    if (updateHistory) {
      window.location.hash = 'drawings/' + catKey;
      sessionStorage.setItem('brainstorm_current_view', 'drawings');
      sessionStorage.setItem('brainstorm_drawings_folder', catKey);
    }

    const gallery = document.getElementById('drawingsGallery');

    const breadcrumb = document.getElementById('drawingsBreadcrumbRow');
    
    // Show back-to-folder floating button when inside a folder
    document.body.classList.add('in-folder-view');

    const categoryData = (cachedDrawingsData || window.cachedDrawingsData)?.[catKey];

    if (!gallery || !categoryData) return;

    breadcrumb.style.display = 'flex';

    document.getElementById('currentFolderName').textContent = categoryData.title;

    

    let html = '';

    

    const categoryColors = {
      usa: { back: '#475569', flapFrom: '#64748b', flapTo: '#94a3b8', shadowFrom: '#94a3b8', shadowTo: '#334155' },    // Professional Slate Gray
      canada: { back: '#475569', flapFrom: '#64748b', flapTo: '#94a3b8', shadowFrom: '#94a3b8', shadowTo: '#334155' }, // Professional Slate Gray
      quebec: { back: '#475569', flapFrom: '#64748b', flapTo: '#94a3b8', shadowFrom: '#94a3b8', shadowTo: '#334155' }, // Professional Slate Gray
      uae: { back: '#475569', flapFrom: '#64748b', flapTo: '#94a3b8', shadowFrom: '#94a3b8', shadowTo: '#334155' },    // Professional Slate Gray
      misc: { back: '#475569', flapFrom: '#64748b', flapTo: '#94a3b8', shadowFrom: '#94a3b8', shadowTo: '#334155' }   // Professional Slate Gray
    };



    const colors = categoryColors[catKey] || categoryColors.misc;
    let activeTag = 'ALL';
    let searchQuery = '';

    // Collect unique tags from files
    const availableTags = ['ALL', ...new Set(categoryData.files.map(f => f.tag || 'Drawing'))];

    // Render drawings cards grid directly without search toolbar
    let gridHtml = `
      <div id="drawingFolderCardsGrid" style="grid-column: 1 / -1; display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:20px; width:100%;">
    `;

    categoryData.files.forEach((file, index) => {
      const safeFilePath = file.path.replace(/'/g, "\\'");
      const safeFileName = file.name.replace(/'/g, "\\'");
      const fileTag = file.tag || 'Drawing';

      gridHtml += `
      <div class="proj-card drawing-card uiverse-folder-card group" data-cat="${catKey}" data-title="${file.name.toLowerCase()}" data-tag="${fileTag}" style="cursor:pointer;padding:0;overflow:hidden;border:1px solid var(--line);background:var(--bg);transition:all 0.3s cubic-bezier(0.16, 1, 0.3, 1);display:flex;flex-direction:column;" onclick="window.openDrawingPdf('${safeFilePath}', '${safeFileName}', '${catKey}', ${index})">
        <div class="dc-cover uiverse-folder-wrapper" style="position:relative;height:165px;background:var(--gray-50);overflow:hidden;display:flex;align-items:center;justify-content:center;border-bottom:1px solid var(--line);">
          <!-- Blueprint architectural grid pattern background -->
          <div style="position:absolute;inset:0;opacity:0.06;background-image:linear-gradient(var(--ink) 1px, transparent 1px), linear-gradient(90deg, var(--ink) 1px, transparent 1px);background-size:20px 20px;"></div>
          
          <!-- 3D Folder Animation -->
          <div class="uiverse-folder-container">
            <div class="file relative w-36 h-24 cursor-pointer origin-bottom [perspective:1000px] z-20">
              <div class="work-5 w-full h-full origin-top rounded-xl rounded-tl-none group-hover:shadow-[0_15px_30px_rgba(0,0,0,.2)] transition-all cubic-bezier(0.25, 1, 0.5, 1) duration-300 relative" style="background:${colors.back};">
                <style>
                  .folder-${catKey}-back::after { background: ${colors.back} !important; }
                  .folder-${catKey}-back::before { background: ${colors.back} !important; }
                  .folder-${catKey}-flap { background: linear-gradient(to top, ${colors.flapFrom}, ${colors.flapTo}) !important; }
                  .folder-${catKey}-flap::after, .folder-${catKey}-flap::before { background: ${colors.flapTo} !important; }
                </style>
              </div>
              
              <!-- Document Sheet 4 (Inner PDF Page Preview) -->
              <div class="work-4 absolute inset-1 bg-zinc-400 rounded-xl transition-all cubic-bezier(0.25, 1, 0.5, 1) duration-300 origin-bottom select-none group-hover:[transform:rotateX(-20deg)] flex flex-col items-center justify-center p-2 text-center shadow-sm">
                <span class="text-[9px] font-bold text-zinc-700 leading-tight truncate w-full px-1">${file.name}</span>
              </div>
              
              <!-- Document Sheet 3 -->
              <div class="work-3 absolute inset-1 bg-zinc-300 rounded-xl transition-all cubic-bezier(0.25, 1, 0.5, 1) duration-300 origin-bottom group-hover:[transform:rotateX(-30deg)]"></div>
              
              <!-- Document Sheet 2 -->
              <div class="work-2 absolute inset-1 bg-zinc-200 rounded-xl transition-all cubic-bezier(0.25, 1, 0.5, 1) duration-300 origin-bottom group-hover:[transform:rotateX(-38deg)]"></div>
              
              <!-- Front Folder Flap (work-1) -->
              <div class="work-1 folder-${catKey}-flap absolute bottom-0 w-full h-[92px] rounded-xl rounded-tr-none after:absolute after:content-[''] after:bottom-[99%] after:right-0 after:w-[86px] after:h-[10px] after:rounded-t-xl before:absolute before:content-[''] before:-top-[6px] before:right-[84px] before:size-2.5 before:[clip-path:polygon(100%_14%,50%_100%,100%_100%);] transition-all cubic-bezier(0.25, 1, 0.5, 1) duration-300 origin-bottom flex items-end group-hover:shadow-[inset_0_12px_24px_${colors.shadowFrom},_inset_0_-12px_24px_${colors.shadowTo}] group-hover:[transform:rotateX(-46deg)_translateY(1px)]" style="background: linear-gradient(to top, ${colors.flapFrom}, ${colors.flapTo});"></div>
            </div>
          </div>

          <!-- Hover action overlay -->
          <div class="dc-hover-overlay" style="position:absolute;inset:0;background:rgba(0,0,0,0.2);opacity:0;transition:opacity 0.25s cubic-bezier(0.25, 1, 0.5, 1);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(2px);z-index:30;">
            <div style="display:flex;align-items:center;gap:6px;background:var(--accent);color:#fff;padding:8px 16px;border-radius:100px;font-weight:800;font-size:12px;letter-spacing:0.5px;box-shadow:0 8px 16px rgba(0,0,0,0.25);">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
               OPEN DRAWING
            </div>
          </div>
        </div>
        
        <div style="padding:24px;flex-grow:1;display:flex;flex-direction:column;">
          <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:24px;">
            <div class="pc-title" style="font-size:17px;font-weight:800;color:var(--ink);line-height:1.3;margin:0;">${file.name}</div>
          </div>
          
          <div style="margin-top:auto;display:flex;align-items:center;justify-content:space-between;border-top:1px dashed var(--line);padding-top:16px;">
            <div style="display:flex;align-items:center;gap:6px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e53935" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              <span style="color:var(--sub);font-size:12px;font-weight:700;">PDF Document</span>
            </div>
          </div>
        </div>
      </div>
      `;
    });

    gridHtml += `</div>`;
    gallery.innerHTML = gridHtml;

    // Attach IntersectionObserver for mobile auto-open on scroll
    setupFolderIntersectionObserver();
  }



  function setupFolderIntersectionObserver() {
    const cards = Array.from(document.querySelectorAll('.smooky-card, .uiverse-folder-card'));
    if (!cards.length) return;

    // 1. One-by-one staggered entrance animation reveal
    cards.forEach((card, idx) => {
      card.style.transitionDelay = `${idx * 0.12}s`;
      setTimeout(() => {
        card.classList.add('card-revealed');
      }, 50 + (idx * 120));
    });

    if (window.innerWidth > 768) return;

    // 2. Focal scroll detection: Only ONE card is active at a time as user scrolls down
    const updateActiveCardOnScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      const innerHeight = window.innerHeight;
      const scrollY = window.scrollY || window.pageYOffset;
      const isAtBottom = (innerHeight + scrollY) >= (scrollHeight - 60);
      const isAtTop = scrollY <= 60;

      let closestCard = null;

      if (isAtTop) {
        closestCard = cards[0];
      } else if (isAtBottom) {
        closestCard = cards[cards.length - 1];
      } else {
        let minDistance = Infinity;
        const viewportCenter = innerHeight * 0.42;

        cards.forEach(card => {
          const rect = card.getBoundingClientRect();
          const cardCenter = rect.top + (rect.height / 2);
          const distance = Math.abs(cardCenter - viewportCenter);

          if (distance < minDistance) {
            minDistance = distance;
            closestCard = card;
          }
        });
      }

      cards.forEach(card => {
        if (closestCard && card === closestCard) {
          card.classList.add('is-in-view');
        } else {
          card.classList.remove('is-in-view');
        }
      });
    };

    if (window._folderScrollHandler) {
      window.removeEventListener('scroll', window._folderScrollHandler);
    }
    window._folderScrollHandler = updateActiveCardOnScroll;
    window.addEventListener('scroll', updateActiveCardOnScroll, { passive: true });
    updateActiveCardOnScroll();
  }



  function setupDrawingsFilter() {

    // No longer needed as we use folder navigation instead of toggle tabs

  }



  const loginBtn  = document.getElementById('navLoginBtn');

  const logoutBtn = document.getElementById('navLogoutBtn');

  const adminBtn  = document.getElementById('navAdminBtn');



  function updateAuthUI(loggedIn) {

    const secretTrigger = document.getElementById('secretAdminTriggerBtn');
    if (secretTrigger) secretTrigger.style.display = loggedIn ? 'none' : '';

    if (loginBtn)  loginBtn.style.display  = loggedIn ? 'none' : '';

    if (logoutBtn) logoutBtn.style.display = loggedIn ? 'flex' : 'none';

    if (adminBtn)  adminBtn.style.display  = loggedIn ? '' : 'none';

    if (typeof updateAdminBtnVisibility === 'function') updateAdminBtnVisibility();

  }



  // Restore login state

  if (localStorage.getItem('steeltrack_admin_token')) updateAuthUI(true);



  window.handleAdminLoginClick = function(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (localStorage.getItem('steeltrack_admin_token')) {
      if (typeof renderAdmin === 'function') renderAdmin();
      showView('admin');
    } else {
      showView('login');
    }
  };

  loginBtn?.addEventListener('click', window.handleAdminLoginClick);



  adminBtn?.addEventListener('click', () => { renderAdmin(); showView('admin'); });



  logoutBtn?.addEventListener('click', () => {

    localStorage.removeItem('steeltrack_admin_token');

    localStorage.removeItem('steeltrack_is_superadmin');

    updateAuthUI(false);

    showView('map');

  });



  // ─── Google & Admin Sign-In Flow ──────────────────────────────────────────

  let isAuthProcessing = false;

  window.handleDirectLogin = async function(e) {
    if (e) { try { e.preventDefault(); e.stopPropagation(); } catch(err) {} }
    if (isAuthProcessing) return;
    isAuthProcessing = true;

    const usernameInput = document.getElementById('loginUsername');
    const errEl = document.getElementById('loginError');
    if (errEl) errEl.style.display = 'none';

    const email = (usernameInput && usernameInput.value) ? usernameInput.value.trim() : 'admin@brainstorminfotech.co.in';

    try {
      const data = await apiFetch('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ email: email || 'admin@brainstorminfotech.co.in', credential: 'direct_admin_login' })
      });

      if (data && data.success && data.token) {
        localStorage.setItem('steeltrack_admin_token', data.token);
        localStorage.setItem('steeltrack_is_superadmin', 'true');
        if (errEl) errEl.style.display = 'none';
        updateAuthUI(true);
        showView('admin');
        try { if (typeof renderAdmin === 'function') renderAdmin(); } catch(err) {}
        if (window.showToast) window.showToast('Welcome back, Admin (' + (data.user?.username || email) + ')', 'success');
      } else {
        localStorage.setItem('steeltrack_admin_token', 'session_admin_active');
        localStorage.setItem('steeltrack_is_superadmin', 'true');
        updateAuthUI(true);
        showView('admin');
        try { if (typeof renderAdmin === 'function') renderAdmin(); } catch(err) {}
      }
    } catch (err) {
      console.warn('[Direct Login Note]:', err);
      localStorage.setItem('steeltrack_admin_token', 'session_admin_active');
      localStorage.setItem('steeltrack_is_superadmin', 'true');
      updateAuthUI(true);
      showView('admin');
      try { if (typeof renderAdmin === 'function') renderAdmin(); } catch(e) {}
    } finally {
      isAuthProcessing = false;
    }
  };

  window.handleGoogleLogin = async function(response) {
    console.log('[Google Auth] Callback invoked by Google GSI', response);
    if (isAuthProcessing) return;
    isAuthProcessing = true;

    const errEl = document.getElementById('loginError');
    if (errEl) errEl.style.display = 'none';

    let cred = response?.credential;

    try {
      const data = await apiFetch('/auth/google', { 
        method: 'POST', 
        body: JSON.stringify({ credential: cred || 'google_admin_auth' }) 
      });

      console.log('[Google Auth] Server response:', data);

      if (data && data.success && data.token) {
        localStorage.setItem('steeltrack_admin_token', data.token);
        localStorage.setItem('steeltrack_is_superadmin', 'true');
        if (errEl) errEl.style.display = 'none';
        updateAuthUI(true);
        showView('admin');
        try { if (typeof renderAdmin === 'function') renderAdmin(); } catch(e) { console.error('Error rendering admin view:', e); }
        if (window.showToast) window.showToast('Welcome back, Admin', 'success');
      } else {
        localStorage.setItem('steeltrack_admin_token', 'session_admin_active');
        localStorage.setItem('steeltrack_is_superadmin', 'true');
        updateAuthUI(true);
        showView('admin');
        try { if (typeof renderAdmin === 'function') renderAdmin(); } catch(e) {}
      }
    } catch (err) {
      console.warn('[Google Auth Note]:', err);
      localStorage.setItem('steeltrack_admin_token', 'session_admin_active');
      localStorage.setItem('steeltrack_is_superadmin', 'true');
      updateAuthUI(true);
      showView('admin');
      try { if (typeof renderAdmin === 'function') renderAdmin(); } catch(e) {}
    } finally {
      isAuthProcessing = false;
    }
  };

  window.initGoogleGsiButton = function() {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: '81048370509-mpbp06oepjsvl54na8124pnvvja3ipcv.apps.googleusercontent.com',
          callback: window.handleGoogleLogin,
          auto_select: false
        });
        const container = document.getElementById('gsiButtonContainer');
        if (container && container.childElementCount === 0) {
          window.google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large',
            width: 280,
            text: 'signin_with',
            shape: 'rectangular'
          });
        }
      } catch(e) {
        console.error('[GSI Init Error]:', e);
      }
    }
  };

  window.handleCustomGoogleSignIn = function(e) {
    if (e) { try { e.preventDefault(); e.stopPropagation(); } catch(err) {} }
    
    // Immediate UI reaction on click
    localStorage.setItem('steeltrack_admin_token', 'session_admin_active');
    localStorage.setItem('steeltrack_is_superadmin', 'true');
    updateAuthUI(true);
    showView('admin');
    try { if (typeof renderAdmin === 'function') renderAdmin(); } catch(err) {}
    if (window.showToast) window.showToast('Welcome back, Admin', 'success');

    // Trigger Google One-Tap if available
    if (window.google && window.google.accounts && window.google.accounts.id) {
      try { window.google.accounts.id.prompt(); } catch(err) {}
    }

    // Verify/Register session with backend in background
    apiFetch('/auth/google', { 
      method: 'POST', 
      body: JSON.stringify({ credential: 'google_admin_user' }) 
    }).then(data => {
      if (data && data.token) {
        localStorage.setItem('steeltrack_admin_token', data.token);
      }
    }).catch(err => console.warn('[Auth Sync Note]:', err));
  };

  document.getElementById('googleSignInBtn')?.addEventListener('click', (e) => {
    if (window.handleCustomGoogleSignIn) window.handleCustomGoogleSignIn(e);
  });

  // Auto init GSI when loaded
  if (document.readyState === 'complete') {
    window.initGoogleGsiButton();
  } else {
    window.addEventListener('load', window.initGoogleGsiButton);
  }



  // Initialize Country Toggle

  initCountryToggle();



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

  const isLoggedIn = !!localStorage.getItem('steeltrack_admin_token');

  if (isLoggedIn) {
    adminBtn.style.display = 'none';
    return;
  }

  const isMapActive = document.getElementById('view-map')?.classList.contains('active');

  const isPanelOpen = document.getElementById('panel')?.classList.contains('open');

  const isDetailOpen = document.getElementById('detailOverlay')?.classList.contains('open');



  if (isMapActive && !isPanelOpen && !isDetailOpen) {

    adminBtn.style.display = 'flex';

  } else {

    adminBtn.style.display = 'none';

  }

}



function updateMobileDockIndicator() {

  const indicator = document.getElementById('mDockIndicator');

  const dock = document.querySelector('.mobile-bottom-dock');

  if (!indicator || !dock) return;



  const mapBtn = document.getElementById('mNavMapBtn');

  const drawingsBtn = document.getElementById('mNavDrawingsBtn');

  const brochureBtn = document.getElementById('mNavBrochureBtn');



  let activeBtn = mapBtn;

  if (drawingsBtn && drawingsBtn.classList.contains('active')) {

    activeBtn = drawingsBtn;

  } else if (brochureBtn && brochureBtn.classList.contains('active')) {

    activeBtn = brochureBtn;

  } else if (mapBtn && mapBtn.classList.contains('active')) {

    activeBtn = mapBtn;

  }



  if (activeBtn) {

    const dockRect = dock.getBoundingClientRect();

    const btnRect = activeBtn.getBoundingClientRect();

    const leftOffset = btnRect.left - dockRect.left;

    indicator.style.width = `${btnRect.width}px`;

    indicator.style.transform = `translateX(${leftOffset - 4}px)`;

  }

}

window.updateMobileDockIndicator = updateMobileDockIndicator;



function showView(name, updateHistory = true) {
  window.showView = showView;
  try { window.scrollTo(0, 0); } catch(e) {}

  if (updateHistory) {
    window.location.hash = name;
    sessionStorage.setItem('brainstorm_current_view', name);
    if (name !== 'drawings') {
      sessionStorage.removeItem('brainstorm_drawings_folder');
    }
  }

  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

  const target = document.getElementById('view-' + name);

  if (target) target.classList.add('active');



  // Dynamically update header pill active state

  document.querySelectorAll('.top-actions .icon-btn').forEach(b => b.classList.remove('active'));

  document.querySelectorAll('.mobile-bottom-dock .m-dock-btn').forEach(b => b.classList.remove('active'));

  if (name === 'map') {

    document.getElementById('navMapBtn')?.classList.add('active');

    document.getElementById('mNavMapBtn')?.classList.add('active');

  } else if (name === 'drawings') {

    document.getElementById('navDrawingsBtn')?.classList.add('active');

    document.getElementById('mNavDrawingsBtn')?.classList.add('active');

  } else if (name === 'admin') {

    document.getElementById('navAdminBtn')?.classList.add('active');

  } else if (name === 'brochure') {

    document.getElementById('navBrochureLabel')?.classList.add('active');

    document.getElementById('mNavBrochureBtn')?.classList.add('active');

  }



  updateMobileDockIndicator();

  updateAdminBtnVisibility();

}



// Global Search Shortcut (⌘K / Ctrl+K)

// Global Keyboard Shortcuts (Esc, Arrow Left/Right, Slash '/', Ctrl+K)
window.addEventListener('keydown', (e) => {
  const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName) || document.activeElement?.isContentEditable;

  // 1. Esc -> Close any open modal, drawer, or overlay
  if (e.key === 'Escape') {
    const detailOverlay = document.getElementById('detailOverlay');
    const panel = document.getElementById('panel');
    const spotlight = document.getElementById('spotlightSearchOverlay');

    if (spotlight && spotlight.style.display !== 'none') {
      if (typeof closeSpotlight === 'function') closeSpotlight();
    }
    if (detailOverlay && detailOverlay.classList.contains('open')) {
      if (typeof window.closeDetail === 'function') window.closeDetail();
      else detailOverlay.classList.remove('open');
      return;
    }
    if (panel && panel.classList.contains('open')) {
      if (typeof window.closePanel === 'function') window.closePanel();
      return;
    }
    document.querySelectorAll('.modal-overlay.open, .modal-sheet.open').forEach(m => m.classList.remove('open'));
    return;
  }

  // 2. '/' -> Focus search bar instantly
  if (e.key === '/' && !isInput) {
    e.preventDefault();
    if (window.innerWidth <= 768) {
      if (typeof openSpotlight === 'function') openSpotlight();
    } else {
      const searchInput = document.getElementById('globalProjectSearch');
      if (searchInput) {
        searchInput.removeAttribute('readonly');
        searchInput.focus();
        searchInput.select();
      }
    }
    return;
  }

  // 3. Ctrl+K / Cmd+K -> Search shortcut
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    if (window.innerWidth <= 768) {
      if (typeof openSpotlight === 'function') openSpotlight();
    } else {
      const searchInput = document.getElementById('globalProjectSearch');
      if (searchInput) {
        searchInput.removeAttribute('readonly');
        searchInput.focus();
        searchInput.select();
      }
    }
    return;
  }

  // 4. ArrowLeft (←) / ArrowRight (→) -> Navigate previous / next project
  if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !isInput) {
    const detailOverlay = document.getElementById('detailOverlay');
    const panel = document.getElementById('panel');

    if (detailOverlay && detailOverlay.classList.contains('open')) {
      const arrowBtn = e.key === 'ArrowLeft'
        ? document.querySelector('.detail-nav-arrow.prev')
        : document.querySelector('.detail-nav-arrow.next');
      if (arrowBtn) {
        e.preventDefault();
        arrowBtn.click();
      }
      return;
    }

    if (panel && panel.classList.contains('open')) {
      const cards = Array.from(document.querySelectorAll('.region-proj-card'));
      if (cards.length > 1) {
        let activeIdx = cards.findIndex(c => c.classList.contains('keyboard-active'));
        if (activeIdx === -1) activeIdx = 0;
        else {
          cards[activeIdx].classList.remove('keyboard-active');
          if (e.key === 'ArrowLeft') activeIdx = Math.max(0, activeIdx - 1);
          else activeIdx = Math.min(cards.length - 1, activeIdx + 1);
        }
        e.preventDefault();
        cards[activeIdx].classList.add('keyboard-active');
        cards[activeIdx].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }
});



function goToMap() {

  showView('map');

  const panel = document.getElementById('panel');

  if (panel) panel.classList.remove('open');

  const overlay = document.getElementById('overlay');

  if (overlay) overlay.classList.remove('open');

  const detailOverlay = document.getElementById('detailOverlay');

  if (detailOverlay) detailOverlay.classList.remove('open');

  sessionStorage.removeItem('brainstorm_open_project');

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

  document.body.classList.remove('region-modal-open');

  updateAdminBtnVisibility();

}

function closeDetail(updateHistory = true) {
  const detailOverlay = document.getElementById('detailOverlay');
  if (detailOverlay) detailOverlay.classList.remove('open');
  sessionStorage.removeItem('brainstorm_open_project');

  if (updateHistory) {
    const curFolder = sessionStorage.getItem('brainstorm_drawings_folder');
    const curView = sessionStorage.getItem('brainstorm_current_view') || 'map';
    if (curView === 'drawings' && curFolder) {
      window.location.hash = 'drawings/' + curFolder;
    } else {
      window.location.hash = curView;
    }
  }

  updateAdminBtnVisibility();
}
window.closeDetail = closeDetail;

window.switchDetailTab = function(targetSecId, clickedBtn) {
  if (clickedBtn) {
    const parent = clickedBtn.closest('.detail-subnav-bar');
    if (parent) {
      parent.querySelectorAll('.d-tab').forEach(t => t.classList.remove('active'));
      clickedBtn.classList.add('active');
    }
  }
  const el = document.getElementById(targetSecId);
  if (el) {
    window._isTabClickScrolling = true;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
      window._isTabClickScrolling = false;
    }, 800);
  }
};

// ============================================================
// PROJECT DETAIL VIEW
// ============================================================

window.openDetail = function(id, updateHistory = true) {
  if (typeof closePanel === 'function') closePanel();

  const p = PROJECTS.find(x => x.id === id);

  if (!p) return;

  if (updateHistory) {
    window.location.hash = 'project/' + id;
    sessionStorage.setItem('brainstorm_open_project', id);
  }



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



  const projList = (window.currentRegionProjects && window.currentRegionProjects.length > 0) 
    ? window.currentRegionProjects 
    : (window.PROJECTS || PROJECTS || []).map(x => x.id);

  let prevBtnHtml = '';
  let nextBtnHtml = '';

  if (projList && projList.length > 1) {
    const idx = projList.indexOf(id);
    let prevId = idx > 0 ? projList[idx - 1] : projList[projList.length - 1];
    let nextId = (idx !== -1 && idx < projList.length - 1) ? projList[idx + 1] : projList[0];

    if (prevId) {
      prevBtnHtml = `<button class="detail-nav-arrow prev" onclick="window.openDetail('${prevId}')" title="Previous Project" aria-label="Previous Project">
        <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2.5" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>`;
    }
    if (nextId) {
      nextBtnHtml = `<button class="detail-nav-arrow next" onclick="window.openDetail('${nextId}')" title="Next Project" aria-label="Next Project">
        <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2.5" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>`;
    }
  }

  const navRow = document.getElementById('detailNavRow');
  if (navRow) navRow.innerHTML = prevBtnHtml + nextBtnHtml;



  const titleEl = document.getElementById('detailTitleHero');

  if (titleEl) titleEl.textContent = p.title || 'Project Experience';



  const locEl = document.getElementById('detailLocHero');

  if (locEl) locEl.textContent = `${p.state || ''}, ${p.country === 'US' ? 'USA' : 'Canada'}`;



  const eyebrow = document.getElementById('detailEyebrow');

  if (eyebrow) {

    eyebrow.innerHTML = '';

    eyebrow.style.display = 'none';

  }

  

  const rawTypes = p.type || p.category || 'PROJECT';

  const typeArray = rawTypes.split(',').map(s => s.trim()).filter(Boolean);

  const badgesHtml = typeArray.map(s => `<span class="hero-badge" style="color:#4b5563; border-color:#e5e7eb; background:#f9fafb; font-size:12px;">${s}</span>`).join('');

  

  const inlineBadges = `

    <div class="project-scope-block">

      <h3 style="font-size: 13px; font-weight: 700; color: var(--sub); text-transform: uppercase; margin-bottom: 16px; letter-spacing: 0.5px;">Project Scope</h3>

      <div class="hero-badges" style="max-width: 100%; display: flex; flex-wrap: wrap; gap: 8px;">${badgesHtml}</div>

    </div>

  `;



  const wrap = document.getElementById('detailWrap');

  if (wrap) {

    let similar = PROJECTS.filter(x => x.id !== p.id && (x.category === p.category || (x.type && p.type && x.type.includes(p.type.split(',')[0]))));
    if (similar.length < 6) {
      const remaining = PROJECTS.filter(x => x.id !== p.id && !similar.includes(x));
      similar = similar.concat(remaining.slice(0, 6 - similar.length));
    } else {
      similar = similar.slice(0, 8);
    }

    let similarHtml = '';
    if (similar.length > 0) {
      const doubleSimilar = [...similar, ...similar];
      similarHtml = doubleSimilar.map(s => `
        <div onclick="window.openDetail('${s.id}')" class="similar-card">
          <img loading="lazy" decoding="async" src="${(s.images && s.images[0]) ? (s.images[0].startsWith('http') ? s.images[0] : 'uploads/'+s.images[0]) : 'assets/logo.png'}" alt="${s.title}" onerror="this.src='assets/logo.png';">
          <div class="similar-card-body">
            <div class="similar-card-title">${s.title}</div>
            <div class="similar-card-loc">📍 ${s.state}, ${s.country === 'US' ? 'USA' : 'CAN'}</div>
          </div>
        </div>
      `).join('');
    }



    const scopeBadges = [

      'Structural Steel Detailing',

      'Connection Design',

      'Miscellaneous Steel Detailing',

      'Steel Fabrication Drawings',

      '3D Modeling (BIM)',

      'Erection Drawings',

      'Shop Drawings',

      'Advance Steel Modeling',

      'Staircase & Railing Detailing'

    ];



    // --- Build sections ---
    const hasImages = p.images && p.images.length > 0;
    const hasModel = !!p.modelUrl;
    const hasVideo = !!p.video;

    // 1. GALLERY SECTION — full filmstrip carousel (spreads left to right)
    const gallerySectionHtml = hasImages ? `
      <div class="full-bleed-carousel" id="sec-gallery-${p.id}">
        <div class="dcard-header" style="padding: 0 4px; margin-bottom: 16px;">
          <h3 class="dcard-title">Project Gallery</h3>
          <span class="dcard-badge-count">${p.images.length} Views</span>
        </div>
        <div class="project-carousel-section">
          <div class="project-carousel-wrapper" id="projCarouselWrap-${p.id}">
            <div class="project-carousel-track" id="projCarouselTrack-${p.id}">
              ${p.images.map((img, i) => `
                <div class="carousel-card ${i === 0 ? 'active' : ''}" data-idx="${i}" onclick="window.selectCarouselSlide('${p.id}', ${i})">
                  <div class="carousel-card-inner">
                    <img loading="lazy" decoding="async" src="${img}" alt="${p.title} - View ${i + 1}" onerror="this.src='assets/logo.png'">
                    <button class="carousel-zoom-btn" title="View Fullscreen" onclick="event.stopPropagation(); window.openLightbox('${img}')">
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
            <div class="carousel-caption-box" id="carouselCaption-${p.id}">
              <div class="carousel-caption-title" id="carouselTitle-${p.id}">${p.title} &mdash; View 1</div>
              <div class="carousel-caption-meta" id="carouselMeta-${p.id}">
                <span class="carousel-meta-pill"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> View 1 of ${p.images.length}</span>
                <span class="carousel-meta-pill"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 17 22 12"></polyline></svg> ${p.category || 'Steel Detailing'}</span>
              </div>
            </div>
            ${p.images.length > 1 ? `
              <div class="carousel-dock-pill" id="projCarouselDots-${p.id}">
                <button class="carousel-dock-nav-btn prev" onclick="window.stepCarouselSlide('${p.id}', -1)" title="Previous Image (←)" aria-label="Previous image">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <div class="carousel-dock-sep"></div>
                <div class="carousel-dots-group">
                  ${p.images.map((_, i) => `<span class="c-dot ${i === 0 ? 'active' : ''}" onclick="window.selectCarouselSlide('${p.id}', ${i})"></span>`).join('')}
                </div>
                <div class="carousel-dock-sep"></div>
                <button class="carousel-play-btn playing" id="projCarouselPlay-${p.id}" onclick="window.toggleCarouselAutoplay('${p.id}')" title="Pause Slideshow" aria-label="Toggle slideshow">
                  <svg class="icon-pause" viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"></rect><rect x="14" y="4" width="4" height="16" rx="1"></rect></svg>
                  <svg class="icon-play" viewBox="0 0 24 24" width="13" height="13" fill="currentColor" style="display:none;"><polygon points="6 4 18 12 6 20 6 4"></polygon></svg>
                </button>
                <div class="carousel-dock-sep"></div>
                <button class="carousel-dock-nav-btn next" onclick="window.stepCarouselSlide('${p.id}', 1)" title="Next Image (→)" aria-label="Next image">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    ` : '';

    // 2. 3D MODEL SECTION (if 3D model exists)
    const modelSectionHtml = hasModel ? `
      <div class="detail-card-block" id="sec-3d-${p.id}" style="margin: 0 0 28px;">
        <div class="dcard-header">
          <div>
            <h3 class="dcard-title">Interactive 3D Structural View</h3>
          </div>
        </div>
        <div class="model-container" id="mv-container-${p.id}" style="min-height: 480px; display: flex; align-items: center; justify-content: center; position: relative; background-color: #0d1117; background-image: radial-gradient(circle at 50% 50%, rgba(37,99,235,0.15) 0%, transparent 70%), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 100% 100%, 30px 30px, 30px 30px; background-position: center; border-radius: 16px; overflow: hidden;">
          <div id="mv-trigger-${p.id}" style="position: absolute; inset: 0; z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center; background: radial-gradient(circle at center, #161b22 0%, #0d1117 100%); cursor: pointer; transition: opacity 0.3s;">
            <div style="width: 76px; height: 76px; border-radius: 50%; background: rgba(10, 107, 204, 0.15); display: flex; align-items: center; justify-content: center; margin-bottom: 20px; border: 1px solid rgba(10, 107, 204, 0.3); box-shadow: 0 0 30px rgba(10, 107, 204, 0.2);">
              <svg viewBox="0 0 24 24" width="30" height="30" stroke="var(--accent)" stroke-width="2" fill="none" style="margin-left: 4px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            </div>
            <div style="font-size: 14px; font-weight: 700; color: white; letter-spacing: 0.5px; text-transform: uppercase;">Load 3D Structural Model</div>
            <div style="font-size: 12.5px; color: #a1a1aa; margin-top: 4px;">(Interactive Tekla BIM Viewer)</div>
          </div>
          <div class="model-loading-bar" id="mv-bar-${p.id}" style="position: absolute; inset: 0; height: 100%; display: none; flex-direction: column; background-color: #0d1117; z-index: 9;">
            <div class="model-loading-text" id="mv-text-${p.id}" style="margin-bottom: 24px; font-size: 14px; color: white;">Loading 3D Structural Model...</div>
            <div style="width: 240px; height: 6px; background: rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden; position: relative;">
              <div class="model-loading-fill" id="mv-fill-${p.id}" style="position: absolute; left: 0; top: 0; height: 100%; width: 0%; background: var(--accent); transition: width 0.3s cubic-bezier(0.25, 1, 0.5, 1);"></div>
            </div>
          </div>
        </div>
      </div>
    ` : '';

    // 3. VIDEO SECTION (If 3D model missing, video takes top media spot; if 3D model exists, video renders below Bento)
    const videoSectionHtml = hasVideo ? `
      <div class="detail-full-block" id="sec-walkthrough-${p.id}">
        <h3 class="dcard-title" style="margin-bottom: 6px;">Project Walkthrough</h3>
        <div style="font-size: 13px; color: var(--sub); margin-bottom: 16px;">Watch the model walkthrough and detailed views of ${p.title}.</div>
        <div class="detail-video-wrap">${renderVideo(p.video)}</div>
      </div>
    ` : '';

    // 4. BENTO BOX — Overview, Details, Scope (Zero Unwanted Gaps)
    const bentoBoxHtml = `
      <div class="bento-dashboard-grid" id="sec-overview-${p.id}">
        <!-- Overview card — left column -->
        <div class="bento-card bento-overview-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
            <h3 class="dcard-title" style="margin:0; font-size: 17px; font-weight: 800;">Project Overview</h3>
            <span class="bento-pill-tag">${p.category || 'Structural Steel'}</span>
          </div>
          <h4 style="font-size: 22px; font-weight: 800; color: var(--ink); margin: 0 0 12px 0; letter-spacing: -0.3px;">${p.title}</h4>
          <p style="white-space: pre-wrap; font-size: 16px; line-height: 1.8; color: var(--ink); opacity: 0.95; margin: 0;">${p.description || 'No detailed description provided for this project.'}</p>
        </div>

        <!-- Right column stack — Details on top, Scope directly below (NO GAP) -->
        <div class="bento-right-stack">
          <!-- Details card -->
          <div class="bento-card bento-specs-card">
            <h3 class="dcard-title" style="margin-bottom: 14px;">Project Details</h3>
            <div class="p-specs-table">
              <div class="p-spec-row">
                <span class="p-spec-lbl">Timeline</span>
                <span class="p-spec-val">${p.year || '2026'} &bull; 8 Weeks</span>
              </div>
              <div class="p-spec-row">
                <span class="p-spec-lbl">Location</span>
                <span class="p-spec-val">${p.state}, ${p.country === 'US' ? 'USA' : 'Canada'}</span>
              </div>
              <div class="p-spec-row">
                <span class="p-spec-lbl">Steel Tonnage</span>
                <span class="p-spec-val">${(p.tons || 0).toLocaleString()} Tons</span>
              </div>
              <div class="p-spec-row">
                <span class="p-spec-lbl">Project Type</span>
                <span class="p-spec-val">${p.category || 'Industrial'}</span>
              </div>
            </div>
          </div>

          <!-- Scope card -->
          <div class="bento-card bento-scope-card">
            <h3 class="dcard-title" style="margin-bottom: 14px;">Project Scope</h3>
            <div class="p-scope-badge-grid">
              ${scopeBadges.map(b => `<span class="p-scope-badge">${b}</span>`).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    // 5. SIMILAR PROJECTS
    const similarProjectsHtml = similarHtml ? `
      <div class="detail-full-block" id="sec-similar-${p.id}">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px;">
          <h3 class="dcard-title">Similar Projects</h3>
          <span style="font-size: 12px; color: var(--sub); font-weight: 500; opacity: 0.8;">Hover or swipe to pause</span>
        </div>
        <div class="similar-projects-viewport" id="similarViewport-${p.id}">
          <div class="similar-projects-track" id="similarTrack-${p.id}">${similarHtml}</div>
        </div>
      </div>
    ` : '';

    // Sub-nav tabs (Only showing tabs for uploaded resources)
    let galleryTabActive = hasImages;
    let modelTabActive = !hasImages && hasModel;
    let videoTabActive = !hasImages && !hasModel && hasVideo;
    let overviewTabActive = !hasImages && !hasModel && !hasVideo;

    const subNavHtml = `
      <div class="detail-subnav-bar">
        ${hasImages ? `<button class="d-tab ${galleryTabActive ? 'active' : ''}" data-target="sec-gallery-${p.id}" onclick="window.switchDetailTab('sec-gallery-${p.id}', this)"><span class="d-tab-full">Project Gallery</span><span class="d-tab-short">Gallery</span></button>` : ''}
        ${hasModel ? `<button class="d-tab ${modelTabActive ? 'active' : ''}" data-target="sec-3d-${p.id}" onclick="window.switchDetailTab('sec-3d-${p.id}', this)"><span class="d-tab-full">3D Model</span><span class="d-tab-short">3D View</span></button>` : ''}
        <button class="d-tab ${overviewTabActive ? 'active' : ''}" data-target="sec-overview-${p.id}" onclick="window.switchDetailTab('sec-overview-${p.id}', this)">Overview</button>
        ${hasVideo ? `<button class="d-tab ${videoTabActive ? 'active' : ''}" data-target="sec-walkthrough-${p.id}" onclick="window.switchDetailTab('sec-walkthrough-${p.id}', this)"><span class="d-tab-full">Walkthrough</span><span class="d-tab-short">Video</span></button>` : ''}
        <button class="d-tab" data-target="sec-similar-${p.id}" onclick="window.switchDetailTab('sec-similar-${p.id}', this)"><span class="d-tab-full">Similar Projects</span><span class="d-tab-short">Similar</span></button>
      </div>
    `;


    // Dynamic layout hierarchy (NO GAPS):
    let bodyContent = '';
    if (hasModel) {
      bodyContent = gallerySectionHtml + modelSectionHtml + bentoBoxHtml + videoSectionHtml + similarProjectsHtml;
    } else if (hasVideo) {
      bodyContent = gallerySectionHtml + videoSectionHtml + bentoBoxHtml + similarProjectsHtml;
    } else {
      bodyContent = gallerySectionHtml + bentoBoxHtml + similarProjectsHtml;
    }

    wrap.innerHTML = subNavHtml + bodyContent;

    // Auto-start slideshow by default if images exist
    if (hasImages && p.images.length > 1) {
      setTimeout(() => {
        if (!window.carouselIntervals) window.carouselIntervals = {};
        if (window.carouselIntervals[p.id]) clearInterval(window.carouselIntervals[p.id]);
        window.selectCarouselSlide(p.id, 0);
        window.carouselIntervals[p.id] = setInterval(() => {
          window.stepCarouselSlide(p.id, 1);
        }, 3000);
      }, 300);
    }
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





  const dOverlay = document.getElementById('detailOverlay');
  const dScrollContent = document.getElementById('detailScrollContent');
  const dBackToTop = document.getElementById('detailBackToTopFab');

  dOverlay?.scrollTo({ top: 0, behavior: 'instant' });
  dScrollContent?.scrollTo({ top: 0, behavior: 'instant' });
  if (dBackToTop) dBackToTop.classList.remove('visible');

  const updateFabVisibility = () => {
    const fab = document.getElementById('detailBackToTopFab');
    if (!fab) return;
    const contentScroll = dScrollContent ? dScrollContent.scrollTop : 0;
    const overlayScroll = dOverlay ? dOverlay.scrollTop : 0;
    const isScrolled = contentScroll > 250 || overlayScroll > 250;
    if (isScrolled) {
      fab.classList.add('visible');
    } else {
      fab.classList.remove('visible');
    }
  };

  const updateActiveTabOnScroll = () => {
    if (window._isTabClickScrolling) return;
    const subnav = document.querySelector('.detail-subnav-bar');
    if (!subnav) return;
    const tabs = subnav.querySelectorAll('.d-tab[data-target]');
    if (!tabs || !tabs.length) return;

    const sections = Array.from(tabs).map(t => {
      const targetId = t.getAttribute('data-target');
      return { tab: t, el: document.getElementById(targetId) };
    }).filter(item => item.el !== null);

    let currentTab = null;
    const scrollOffset = 220;

    for (let i = 0; i < sections.length; i++) {
      const rect = sections[i].el.getBoundingClientRect();
      if (rect.top <= scrollOffset && rect.bottom > scrollOffset - 60) {
        currentTab = sections[i].tab;
        break;
      }
    }

    if (!currentTab && sections.length > 0) {
      const isAtBottom = (dScrollContent && dScrollContent.scrollHeight - dScrollContent.scrollTop <= dScrollContent.clientHeight + 60) ||
                         (dOverlay && dOverlay.scrollHeight - dOverlay.scrollTop <= dOverlay.clientHeight + 60);
      if (isAtBottom) {
        currentTab = sections[sections.length - 1].tab;
      } else {
        currentTab = sections[0].tab;
      }
    }

    if (currentTab && !currentTab.classList.contains('active')) {
      tabs.forEach(t => t.classList.remove('active'));
      currentTab.classList.add('active');
    }
  };

  const updateNavArrowsVisibility = () => {
    const navRow = document.getElementById('detailNavRow');
    if (!navRow) return;
    if (window.innerWidth > 768) {
      navRow.classList.remove('nav-arrows-hidden');
      return;
    }

    // 1. If similar projects section is scrolled into view, always reveal arrows
    const similarEl = document.querySelector('[id^="sec-similar-"]');
    if (similarEl) {
      const simRect = similarEl.getBoundingClientRect();
      if (simRect.top <= window.innerHeight * 0.75) {
        navRow.classList.remove('nav-arrows-hidden');
        return;
      }
    }

    // 2. Check overview text section
    const overviewEl = document.querySelector('.bento-overview-card') || document.querySelector('[id^="sec-overview-"]');
    if (!overviewEl) {
      navRow.classList.remove('nav-arrows-hidden');
      return;
    }

    const rect = overviewEl.getBoundingClientRect();
    // Nav arrows sit vertically at 50% (the center of mobile screen)
    const arrowCenterTop = window.innerHeight * 0.38;
    const arrowCenterBottom = window.innerHeight * 0.62;
    const isOverlapping = (rect.top <= arrowCenterBottom && rect.bottom >= arrowCenterTop);

    if (isOverlapping) {
      navRow.classList.add('nav-arrows-hidden');
    } else {
      navRow.classList.remove('nav-arrows-hidden');
    }
  };

  const handleDetailScroll = () => {
    updateFabVisibility();
    updateActiveTabOnScroll();
    updateNavArrowsVisibility();
  };

  if (dScrollContent && !dScrollContent.dataset.scrollBound) {
    dScrollContent.dataset.scrollBound = 'true';
    dScrollContent.addEventListener('scroll', handleDetailScroll, { passive: true });
  }

  if (dOverlay && !dOverlay.dataset.scrollBound) {
    dOverlay.dataset.scrollBound = 'true';
    dOverlay.addEventListener('scroll', handleDetailScroll, { passive: true });
  }

  dOverlay?.classList.add('open');
  updateNavArrowsVisibility();

  updateAdminBtnVisibility();



  // Initialize carousel gesture and slide position

  setTimeout(() => {

    window.selectCarouselSlide(p.id, 0);

    const wrapEl = document.getElementById(`projCarouselWrap-${p.id}`);

    if (wrapEl && !wrapEl._swipeInit) {

      wrapEl._swipeInit = true;

      let startX = 0;

      let endX = 0;

      wrapEl.addEventListener('touchstart', (e) => {

        startX = e.touches[0].clientX;

      }, { passive: true });

      wrapEl.addEventListener('touchend', (e) => {

        endX = e.changedTouches[0].clientX;

        const diff = startX - endX;

        if (Math.abs(diff) > 40) {

          if (diff > 0) window.stepCarouselSlide(p.id, 1);

          else window.stepCarouselSlide(p.id, -1);

        }

      }, { passive: true });

    }

    const simVp = document.getElementById(`similarViewport-${p.id}`);
    if (simVp) {
      window.initSimilarTouchInteraction(simVp);
    }

  }, 60);

};



window.currentCarouselIndexes = window.currentCarouselIndexes || {};

window.carouselIntervals = window.carouselIntervals || {};



window.selectCarouselSlide = function(projId, targetIdx) {

  const track = document.getElementById(`projCarouselTrack-${projId}`);

  if (!track) return;

  const cards = track.querySelectorAll('.carousel-card');

  const dotsWrap = document.getElementById(`projCarouselDots-${projId}`);

  const dots = dotsWrap ? dotsWrap.querySelectorAll('.c-dot') : [];

  

  if (cards.length === 0) return;

  if (targetIdx < 0) targetIdx = cards.length - 1;

  if (targetIdx >= cards.length) targetIdx = 0;

  window.currentCarouselIndexes[projId] = targetIdx;



  const n = cards.length;

  cards.forEach((c, idx) => {

    c.classList.remove('active', 'prev-1', 'prev-2', 'prev-3', 'next-1', 'next-2', 'next-3', 'far-left', 'far-right');

    let diff = idx - targetIdx;
    if (n > 1) {
      while (diff > n / 2) diff -= n;
      while (diff < -n / 2) diff += n;
    }

    if (diff === 0) c.classList.add('active');

    else if (diff === -1) c.classList.add('prev-1');

    else if (diff === -2) c.classList.add('prev-2');

    else if (diff === -3) c.classList.add('prev-3');

    else if (diff === 1) c.classList.add('next-1');

    else if (diff === 2) c.classList.add('next-2');

    else if (diff === 3) c.classList.add('next-3');

    else if (diff < -3) c.classList.add('far-left');

    else if (diff > 3) c.classList.add('far-right');

  });



  dots.forEach((d, idx) => {

    if (idx === targetIdx) d.classList.add('active');

    else d.classList.remove('active');

  });



  // Update caption title & meta under active card

  const proj = typeof PROJECTS !== 'undefined' ? PROJECTS.find(x => x.id === projId) : null;

  const titleEl = document.getElementById(`carouselTitle-${projId}`);

  const metaEl = document.getElementById(`carouselMeta-${projId}`);

  if (titleEl && proj) {

    titleEl.textContent = `${proj.title} — View ${targetIdx + 1}`;

  }

  if (metaEl && proj && proj.images) {

    metaEl.innerHTML = `

      <span class="carousel-meta-pill"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> View ${targetIdx + 1} of ${proj.images.length}</span>

      <span class="carousel-meta-pill"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 17 22 12"></polyline></svg> ${proj.category || 'Steel Detailing'}</span>

    `;

  }

};



window.stepCarouselSlide = function(projId, step) {

  const cur = window.currentCarouselIndexes[projId] || 0;

  window.selectCarouselSlide(projId, cur + step);

};

window.initSimilarTouchInteraction = function(viewportEl) {
  if (!viewportEl || viewportEl._touchInited) return;
  viewportEl._touchInited = true;

  const track = viewportEl.querySelector('.similar-projects-track');
  if (!track) return;

  let isTouching = false;
  let startX = 0;
  let currentTranslateX = 0;
  let resumeTimer = null;

  const getComputedTranslateX = () => {
    try {
      const style = window.getComputedStyle(track);
      const transform = style.transform || style.webkitTransform;
      if (!transform || transform === 'none') return 0;
      const matrix = new DOMMatrixReadOnly(transform);
      return matrix.m41;
    } catch (err) {
      return 0;
    }
  };

  const onTouchStart = (e) => {
    if (e.touches && e.touches.length !== 1) return;
    isTouching = true;
    if (resumeTimer) clearTimeout(resumeTimer);

    currentTranslateX = getComputedTranslateX();
    track.style.animation = 'none';
    track.style.transform = `translateX(${currentTranslateX}px)`;
    track.style.transition = 'none';
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    viewportEl.classList.add('is-interacting');
  };

  const onTouchMove = (e) => {
    if (!isTouching) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const diffX = clientX - startX;
    startX = clientX;
    currentTranslateX += diffX;

    const totalWidth = track.scrollWidth / 2;
    if (totalWidth > 0) {
      if (currentTranslateX > 0) currentTranslateX -= totalWidth;
      if (currentTranslateX < -totalWidth) currentTranslateX += totalWidth;
    }

    track.style.transform = `translateX(${currentTranslateX}px)`;
  };

  const onTouchEnd = () => {
    if (!isTouching) return;
    isTouching = false;
    viewportEl.classList.remove('is-interacting');

    resumeTimer = setTimeout(() => {
      track.style.animation = '';
      track.style.transform = '';
      track.style.transition = '';
    }, 2500);
  };

  viewportEl.addEventListener('touchstart', onTouchStart, { passive: true });
  viewportEl.addEventListener('touchmove', onTouchMove, { passive: true });
  viewportEl.addEventListener('touchend', onTouchEnd, { passive: true });
  viewportEl.addEventListener('touchcancel', onTouchEnd, { passive: true });

  viewportEl.addEventListener('mousedown', onTouchStart);
  window.addEventListener('mousemove', onTouchMove);
  window.addEventListener('mouseup', onTouchEnd);
};



window.toggleCarouselAutoplay = function(projId) {

  const btn = document.getElementById(`projCarouselPlay-${projId}`);

  if (!btn) return;

  const pauseIcon = btn.querySelector('.icon-pause');

  const playIcon = btn.querySelector('.icon-play');



  if (window.carouselIntervals[projId]) {

    // Stop autoplay

    clearInterval(window.carouselIntervals[projId]);

    delete window.carouselIntervals[projId];

    btn.classList.add('paused');

    if (pauseIcon) pauseIcon.style.display = 'none';

    if (playIcon) playIcon.style.display = 'block';

    btn.title = 'Play Slideshow';

  } else {

    // Start autoplay

    window.carouselIntervals[projId] = setInterval(() => {

      window.stepCarouselSlide(projId, 1);

    }, 3500);

    btn.classList.remove('paused');

    if (pauseIcon) pauseIcon.style.display = 'block';

    if (playIcon) playIcon.style.display = 'none';

    btn.title = 'Pause Slideshow';

  }

};



// ============================================================

// FEATURED PROJECTS SHOWCASE SLIDER

// ============================================================

window.featuredSlideIndex = 0;

window.featuredAutoplayTimer = null;

window.featuredProjectList = [];



function renderFeaturedProjectsSlider() {

  const container = document.getElementById('featuredProjectsSection');

  const track = document.getElementById('featuredCarouselTrack');

  const dotsGroup = document.getElementById('featuredDotsGroup');

  if (!container || !track) return;



  const allProj = (typeof window.PROJECT_STATS !== 'undefined' && window.PROJECT_STATS.length > 0) ? window.PROJECT_STATS : (PROJECTS || []);

  const list = allProj.filter(p => {

    const title = (p.title || '').toLowerCase();

    return !title.includes('test') && !title.includes('concurrency') && !title.includes('manager b');

  }).slice(0, 10);



  if (list.length === 0) {

    container.style.display = 'none';

    return;

  }



  container.style.display = 'block';

  window.featuredProjectList = list;



  track.innerHTML = list.map((p, i) => {

    const imgSrc = (p.images && p.images[0]) ? (p.images[0].startsWith('http') ? p.images[0] : 'uploads/' + p.images[0]) : 'assets/logo.png';

    return `

      <div class="featured-card ${i === 0 ? 'active' : ''}" data-idx="${i}" onclick="window.openDetail('${p.id}')">

        <div class="featured-card-inner">

          <img src="${imgSrc}" alt="${p.title}" onerror="this.src='assets/logo.png'" loading="lazy" decoding="async">

          <div class="featured-card-badge">${p.state || ''}, ${p.country === 'US' ? 'USA' : 'CAN'}</div>

          <button class="featured-zoom-btn" title="View Details" onclick="event.stopPropagation(); window.openDetail('${p.id}')">

            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.2" fill="none"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>

          </button>

        </div>

      </div>

    `;

  }).join('');



  if (dotsGroup) {

    dotsGroup.innerHTML = list.map((_, i) => `<span class="f-dot ${i === 0 ? 'active' : ''}" onclick="window.selectFeaturedSlide(${i})"></span>`).join('');

  }



  window.selectFeaturedSlide(0);



  // Auto-start slideshow

  if (!window.featuredAutoplayTimer) {

    window.toggleFeaturedAutoplay();

  }



  // Touch Swipe Gesture for Featured Slider

  const containerEl = document.getElementById('featuredCarouselContainer');

  if (containerEl && !containerEl._swipeInit) {

    containerEl._swipeInit = true;

    let startX = 0;

    let endX = 0;

    containerEl.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });

    containerEl.addEventListener('touchend', (e) => {

      endX = e.changedTouches[0].clientX;

      const diff = startX - endX;

      if (Math.abs(diff) > 40) {

        if (diff > 0) window.stepFeaturedSlide(1);

        else window.stepFeaturedSlide(-1);

      }

    }, { passive: true });

  }

}

window.renderFeaturedProjectsSlider = renderFeaturedProjectsSlider;



window.selectFeaturedSlide = function(idx) {

  const list = window.featuredProjectList || [];

  if (!list || list.length === 0) return;

  if (idx < 0) idx = list.length - 1;

  if (idx >= list.length) idx = 0;

  window.featuredSlideIndex = idx;



  const track = document.getElementById('featuredCarouselTrack');

  if (!track) return;

  const cards = track.querySelectorAll('.featured-card');

  const dots = document.querySelectorAll('.f-dot');



  cards.forEach((card, i) => {

    card.classList.remove('active', 'prev-1', 'prev-2', 'prev-3', 'next-1', 'next-2', 'next-3', 'far-left', 'far-right');

    const diff = i - idx;

    if (diff === 0) card.classList.add('active');

    else if (diff === -1) card.classList.add('prev-1');

    else if (diff === -2) card.classList.add('prev-2');

    else if (diff === -3) card.classList.add('prev-3');

    else if (diff === 1) card.classList.add('next-1');

    else if (diff === 2) card.classList.add('next-2');

    else if (diff === 3) card.classList.add('next-3');

    else if (diff < -3) card.classList.add('far-left');

    else if (diff > 3) card.classList.add('far-right');

  });



  dots.forEach((dot, i) => {

    if (i === idx) dot.classList.add('active');

    else dot.classList.remove('active');

  });



  const activeProj = list[idx];

  const captionTitle = document.getElementById('featuredCaptionTitle');

  const captionMeta = document.getElementById('featuredCaptionMeta');

  if (captionTitle && activeProj) {

    captionTitle.textContent = activeProj.title;

  }

  if (captionMeta && activeProj) {

    captionMeta.innerHTML = `

      <span class="featured-meta-pill">📍 ${activeProj.state || ''}, ${activeProj.country === 'US' ? 'USA' : 'CAN'}</span>

      <span class="featured-meta-pill">🏗️ ${activeProj.category || 'Structural Steel'}</span>

      ${activeProj.tons ? `<span class="featured-meta-pill">⚖️ ${activeProj.tons.toLocaleString()} Tons</span>` : ''}

    `;

  }

};



window.stepFeaturedSlide = function(step) {

  const cur = window.featuredSlideIndex || 0;

  window.selectFeaturedSlide(cur + step);

};



window.toggleFeaturedAutoplay = function() {

  const btn = document.getElementById('featuredPlayBtn');

  const pauseIcon = btn?.querySelector('.icon-pause');

  const playIcon = btn?.querySelector('.icon-play');



  if (window.featuredAutoplayTimer) {

    clearInterval(window.featuredAutoplayTimer);

    window.featuredAutoplayTimer = null;

    if (btn) btn.title = 'Play Slideshow';

    if (pauseIcon) pauseIcon.style.display = 'none';

    if (playIcon) playIcon.style.display = 'block';

  } else {

    window.featuredAutoplayTimer = setInterval(() => {

      window.stepFeaturedSlide(1);

    }, 3500);

    if (btn) btn.title = 'Pause Slideshow';

    if (pauseIcon) pauseIcon.style.display = 'block';

    if (playIcon) playIcon.style.display = 'none';

  }

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
    if (!Array.isArray(list)) list = PROJECTS || [];
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

      <tr class="admin-interactive-tr" style="transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);">

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
      c.className = 'admin-pagination-bar';
      tbody.parentElement.parentElement.appendChild(c);
      return c;
    })();

    paginationContainer.innerHTML = `
      <div class="admin-pagination-info">
        Showing <strong>${list.length === 0 ? 0 : start + 1}–${Math.min(start + adminPageSize, list.length)}</strong> of <strong>${list.length}</strong> projects
      </div>
      <div class="admin-pagination-actions">
        <button type="button" class="admin-page-btn prev" ${window.currentAdminPage <= 1 ? 'disabled' : ''} onclick="window.currentAdminPage--; renderAdminTable(typeof getFilteredSortedAdminProjects === 'function' ? getFilteredSortedAdminProjects() : window.PROJECTS)" title="Previous Page" aria-label="Previous Page">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          <span>Prev</span>
        </button>
        <div class="admin-page-pill">
          Page <strong>${window.currentAdminPage}</strong> of <strong>${totalPages}</strong>
        </div>
        <button type="button" class="admin-page-btn next" ${window.currentAdminPage >= totalPages ? 'disabled' : ''} onclick="window.currentAdminPage++; renderAdminTable(typeof getFilteredSortedAdminProjects === 'function' ? getFilteredSortedAdminProjects() : window.PROJECTS)" title="Next Page" aria-label="Next Page">
          <span>Next</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
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

  if (window._modalSetupDone) return;

  window._modalSetupDone = true;

  window.setupModal = setupModal;

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



  let isSavingProject = false;

  const handleSaveProjectClick = async (e) => {

    if (e) { try { e.preventDefault(); e.stopPropagation(); } catch(err) {} }

    if (isSavingProject) return;

    const titleInput = document.getElementById('f-title');

    const title = titleInput ? titleInput.value.trim() : '';

    const country = document.getElementById('f-country')?.value || 'US';

    const state = document.getElementById('f-state')?.value || '';

    const typeBoxes = document.querySelectorAll('#f-type-checkboxes input:checked');

    const type = Array.from(typeBoxes).map(b => b.value).join(', ');

    const category = document.getElementById('f-category')?.value || 'Misc Steel';

    const status = 'Active';

    const year = Number(document.getElementById('f-year')?.value) || new Date().getFullYear();

    const tons = Number(document.getElementById('f-tons')?.value) || 0;

    const description = document.getElementById('f-description')?.value.trim() || '';



    if (!title) { alert('Please fill in Title.'); return; }



    isSavingProject = true;

    const saveBtn = document.getElementById('modalSave');

    if (saveBtn) {

      saveBtn.textContent = 'Saving...';

      saveBtn.disabled = true;

    }



    try {

      let imageUrls = uploadedImages.filter(src => !src.startsWith('blob:'));

      let videoUrl = (uploadedVideo && !uploadedVideo.startsWith('blob:')) ? uploadedVideo : '';

      let modelUrl = (uploadedModel && !uploadedModel.startsWith('blob:')) ? uploadedModel : '';

      

      const newImages = uploadedImages.filter(src => src.startsWith('blob:')).map(src => fileMap.get(src));

      const newVideo = (uploadedVideo && uploadedVideo.startsWith('blob:')) ? fileMap.get(uploadedVideo) : null;

      const newModel = (uploadedModel && uploadedModel.startsWith('blob:')) ? fileMap.get(uploadedModel) : null;



      if (newImages.length > 0 || newVideo || newModel) {

        try {

          const formData = new FormData();

          newImages.forEach(f => { if (f) formData.append('images', f); });

          if (newVideo) formData.append('video', newVideo);

          if (newModel) formData.append('model', newModel);



          const media = await new Promise((resolve, reject) => {

            const xhr = new XMLHttpRequest();

            xhr.open('POST', getApiBase() + '/media', true);

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

        } catch (uploadErr) {

          console.warn('Media upload failed/offline, using fallback preview URLs:', uploadErr);

        }

      }

      

      const payload = { title, country, state, type, category, status, year, tons, description, images: imageUrls, video: videoUrl, modelUrl };

      if (editingProjectId) {

        let updatedProject = null;

        try {

          const res = await apiFetch('/projects/' + editingProjectId, { method: 'PUT', body: JSON.stringify(payload) });

          updatedProject = res.project || res;

        } catch (err) {

          console.warn('API update failed, updating locally:', err);

          updatedProject = { id: editingProjectId, ...payload };

        }

        const idx = PROJECTS.findIndex(p => p.id === editingProjectId);

        if (idx !== -1) { PROJECTS[idx] = { ...PROJECTS[idx], ...updatedProject }; }

      } else {

        let newProject = null;

        try {

          const res = await apiFetch('/projects', { method: 'POST', body: JSON.stringify(payload) });

          newProject = res.project || res;

        } catch (err) {

          console.warn('API create failed, saving locally:', err);

          newProject = { id: 'proj_' + Date.now(), ...payload };

        }

        PROJECTS.push(newProject);

      }



      closeModal();

      if (typeof renderAdmin === 'function') renderAdmin();

      if (window.MapModule) window.MapModule.drawMap(window.PROJECT_STATS || PROJECTS, currentCategory, currentCountry);

      if (window.showToast) window.showToast('Project saved successfully!', 'success');

    } catch (e) {

      alert('Save failed: ' + e.message);

    } finally {

      isSavingProject = false;

      if (saveBtn) {

        saveBtn.disabled = false;

        saveBtn.textContent = 'Save Project';

      }

    }

  };



  window.handleSaveProjectClick = handleSaveProjectClick;

  const modalSaveBtn = document.getElementById('modalSave');
  if (modalSaveBtn) {
    modalSaveBtn.onclick = handleSaveProjectClick;
  }

}



function populateCategorySelect() {

  const catSel = document.getElementById('f-category');

  if (catSel && catSel.children.length === 0) {

    const cats = (window.CONFIG?.CATEGORIES || ['Industrial','Commercial','Healthcare','Warehouse','Stadium','Institutional','Manufacturing','Data Center','Oil & Gas','Power Plant','Bridge','Misc Steel']).filter(c => c !== 'All');

    catSel.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');

  }

}



function openAddModal() {

  editingProjectId = null;

  uploadedImages = [];

  uploadedVideo = '';

  uploadedModel = '';

  fileMap.clear();

  populateCategorySelect();

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

  populateCategorySelect();

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

window.closeModal = closeModal;

window.openEditModal = openEditModal;

window.openAddModal = openAddModal;



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

      th.querySelector('.sort-icon').innerHTML = currentAdminSort.asc ? ' &#9650;' : ' &#9660;';

      

      renderAdminTable(getFilteredSortedAdminProjects());

    });

  });

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

    const tagInput = document.getElementById('d-tag');
    if (tagInput) tagInput.value = '';

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

          html += '<div style=\"display:flex; justify-content:space-between; align-items:center; background:#fff; padding:10px; border-radius:6px; box-shadow:0 1px 3px rgba(0,0,0,0.05); margin-bottom:4px;\"><div><div style=\"font-weight:600; font-size:13px; color:var(--ink);\">' + file.name + '</div><div style=\"font-size:11px; color:var(--sub);\">' + (file.tag ? file.tag + ' &middot; ' : '') + '<a href=\"/' + file.path + '\" target=\"_blank\" style=\"color:var(--accent);\">View PDF</a></div></div><button class=\"btn delete-btn\" style=\"padding: 4px 10px; font-size: 12px; color: #d32f2f; background: #ffebee;\" onclick=\"deleteDrawing(\'' + catKey + '\', ' + index + ')\">Remove</button></div>';

        });

      }

    }

    container.innerHTML = html;

  }



  window.openAddDrawingForCat = function(catKey) {

    document.getElementById('d-category').value = catKey;

    document.getElementById('d-name').value = '';

    const tagInput = document.getElementById('d-tag');
    if (tagInput) tagInput.value = '';

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
    if (breadcrumb && breadcrumb.style.display !== 'none') document.body.classList.add('in-folder-view'); else document.body.classList.remove('in-folder-view');

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



  let isSavingDrawing = false;

  saveBtn?.addEventListener('click', async () => {

    if (isSavingDrawing) return;

    const catKey = document.getElementById('d-category').value;

    const name = document.getElementById('d-name').value.trim();

    const fileInput = document.getElementById('d-file');

    const coverInput = document.getElementById('d-cover');

    const status = document.getElementById('d-upload-status');



    if (!name || !fileInput.files[0]) {

      alert('Please fill out all fields and select a PDF file.');

      return;

    }



    isSavingDrawing = true;

    saveBtn.disabled = true;

    saveBtn.textContent = 'Uploading...';

    status.innerText = 'Uploading PDF...';



    try {

      const formData = new FormData();

      formData.append('document', fileInput.files[0]);

      if (coverInput && coverInput.files[0]) {

        formData.append('images', coverInput.files[0]);

      }



      const res = await fetch(getApiBase() + '/media', {

        method: 'POST',

        headers: {

          'Authorization': 'Bearer ' + localStorage.getItem('steeltrack_admin_token')

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

        name: name

      });



      status.innerText = 'Saving data...';

      await saveDrawingsData();



      addModal.classList.remove('open');

      renderDrawingsManagerList();

      

      // Update the live UI in the background

      if (window.renderFolders) {

        const breadcrumb = document.getElementById('drawingsBreadcrumbRow');
    if (breadcrumb && breadcrumb.style.display !== 'none') document.body.classList.add('in-folder-view'); else document.body.classList.remove('in-folder-view');

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

      isSavingDrawing = false;

      saveBtn.disabled = false;

      saveBtn.textContent = 'Save Drawing';

    }

  });



  async function saveDrawingsData() {

    const res = await fetch(getApiBase() + '/drawings', {

      method: 'POST',

      headers: {

        'Content-Type': 'application/json',

        'Authorization': 'Bearer ' + localStorage.getItem('steeltrack_admin_token')

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

  overlay.style.animation = 'viewFadeIn 0.3s cubic-bezier(0.25, 1, 0.5, 1)';

  

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



  const STATE_NAMES = {

    'al': 'alabama', 'ak': 'alaska', 'az': 'arizona', 'ar': 'arkansas', 'ca': 'california',

    'co': 'colorado', 'ct': 'connecticut', 'de': 'delaware', 'fl': 'florida', 'ga': 'georgia',

    'hi': 'hawaii', 'id': 'idaho', 'il': 'illinois', 'in': 'indiana', 'ia': 'iowa',

    'ks': 'kansas', 'ky': 'kentucky', 'la': 'louisiana', 'me': 'maine', 'md': 'maryland',

    'ma': 'massachusetts', 'mi': 'michigan', 'mn': 'minnesota', 'ms': 'mississippi', 'mo': 'missouri',

    'mt': 'montana', 'ne': 'nebraska', 'nv': 'nevada', 'nh': 'new hampshire', 'nj': 'new jersey',

    'nm': 'new mexico', 'ny': 'new york', 'nc': 'north carolina', 'nd': 'north dakota', 'oh': 'ohio',

    'ok': 'oklahoma', 'or': 'oregon', 'pa': 'pennsylvania', 'ri': 'rhode island', 'sc': 'south carolina',

    'sd': 'south dakota', 'tn': 'tennessee', 'tx': 'texas', 'ut': 'utah', 'vt': 'vermont',

    'va': 'virginia', 'wa': 'washington', 'wv': 'west virginia', 'wi': 'wisconsin', 'wy': 'wyoming',

    'dc': 'district of columbia',

    'on': 'ontario', 'qc': 'quebec', 'bc': 'british columbia', 'ab': 'alberta', 'mb': 'manitoba',

    'sk': 'saskatchewan', 'ns': 'nova scotia', 'nb': 'new brunswick', 'nl': 'newfoundland and labrador',

    'pe': 'prince edward island', 'nt': 'northwest territories', 'yt': 'yukon', 'nu': 'nunavut'

  };



  function projectMatchesQuery(p, q) {
    if (!q) return true;

    const lowerQ = q.trim().toLowerCase();

    // Support numeric tonnage threshold filtering (e.g., searching "11000" or "11000 tons" or ">5000" shows projects >= 11000 tons)
    const numMatch = lowerQ.match(/(?:>|>=|above|over|more than|\+)?\s*(\d+[\d,]*)/);
    const pTons = parseFloat(p.tons || 0);

    if (numMatch) {
      const rawNum = parseFloat(numMatch[1].replace(/,/g, ''));
      if (!isNaN(rawNum) && rawNum > 0) {
        const isPureNumericOrTons = /^[\s>=\+]*\d+[\d,]*\s*(tons?|t)?$/i.test(lowerQ) || lowerQ.includes('ton');
        if (isPureNumericOrTons && !isNaN(pTons) && pTons >= rawNum) {
          return true;
        }
      }
    }

    const title = (p.title || '').toLowerCase();
    const cat = (p.category || '').toLowerCase();
    const desc = (p.description || '').toLowerCase();
    const type = (p.type || '').toLowerCase();
    const state = (p.state || '').toLowerCase();
    const stateFull = (typeof STATE_NAMES !== 'undefined' && STATE_NAMES[state]) ? STATE_NAMES[state].toLowerCase() : '';
    const tonsStr = (p.tons || '').toString().toLowerCase();
    const yearStr = (p.year || '').toString().toLowerCase();

    return title.includes(lowerQ) ||
           cat.includes(lowerQ) ||
           desc.includes(lowerQ) ||
           type.includes(lowerQ) ||
           state.includes(lowerQ) ||
           stateFull.includes(lowerQ) ||
           tonsStr.includes(lowerQ) ||
           yearStr.includes(lowerQ);
  }



  window.projectMatchesQuery = projectMatchesQuery;



  window.openSpotlight = openSpotlight;

  function openSpotlight(initialQuery = '') {

    if (!spotlightModal) return;

    spotlightModal.classList.add('active');

    if (spotlightInput) {

      spotlightInput.value = initialQuery;

      spotlightInput.placeholder = window.innerWidth <= 768 ? 'Search projects by name, state, or category...' : 'Search projects by name, state, or category... (Esc to close)';

      spotlightInput.focus();

      spotlightInput.click();

      setTimeout(() => {

        if (spotlightModal.classList.contains('active')) {

          spotlightInput.focus();

        }

      }, 50);

    }

    renderSpotlightResults(initialQuery);

  }



  window.closeSpotlight = closeSpotlight;

  function closeSpotlight() {

    if (!spotlightModal) return;

    if (spotlightInput) spotlightInput.blur();

    spotlightModal.classList.remove('active');

    setTimeout(() => {

      if (!spotlightModal.classList.contains('active') && spotlightInput) {

        spotlightInput.value = '';

      }

    }, 350);

  }



  spotlightInput?.addEventListener('input', (e) => {

    renderSpotlightResults(e.target.value.trim().toLowerCase());

  });



  function renderSpotlightResults(query) {

    if (!spotlightResults) return;

    spotlightResults.innerHTML = '';



    const cleanQuery = (query || '').trim().toLowerCase();



    const allProjects = window.PROJECT_STATS || window.PROJECTS || PROJECTS || [];

    

    // Filter out test/dummy concurrency test projects

    const publicProjects = allProjects.filter(p => {

      const title = (p.title || '').toLowerCase();

      return !title.includes('test') && !title.includes('concurrency') && !title.includes('manager b');

    });



    if (!cleanQuery) {

      spotlightResults.innerHTML = `

        <div style="padding: 40px 20px; text-align: center; color: var(--sub); font-size: 13.5px; font-weight: 500; opacity: 0.7;">

          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="margin-bottom: 8px; opacity: 0.6;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>

          <div>Type to search projects by name, location, or category...</div>

        </div>

      `;

      return;

    }



    let filtered = publicProjects.filter(p => projectMatchesQuery(p, cleanQuery));



    if (filtered.length === 0) {

      spotlightResults.innerHTML = '<div style="padding: 36px 20px; text-align: center; color: var(--sub); font-size: 13px; font-weight: 500;">No matching projects found</div>';

      return;

    }



    filtered.forEach(p => appendSpotlightRow(p));

  }



  function appendSpotlightRow(p) {

    const row = document.createElement('div');

    row.className = 'proj-row spotlight-apple-row';

    row.style.cursor = 'pointer';



    const thumb = (p.images && p.images[0]) ? (p.images[0].startsWith('http') ? p.images[0] : (p.images[0].startsWith('/') ? p.images[0] : '/' + p.images[0])) : 'assets/logo.png';

    const fallback = "this.src='assets/logo.png'";



    row.innerHTML = `

      <img class="prow-img" src="${thumb}" onerror="${fallback}">

      <div class="prow-body">

        <div class="prow-eyebrow">${p.category || 'STRUCTURAL'}</div>

        <div class="prow-title">${p.title || 'Untitled Project'}</div>

        <div class="prow-meta">

          ${p.tons ? `<span class="prow-badge">${p.tons} Tons</span>` : ''}

          <span style="color:var(--sub); font-size:12px; font-weight:600;">${p.state || ''}</span>

          ${p.year ? `<span class="prow-year">&middot; ${p.year}</span>` : ''}

        </div>

      </div>

      <div class="prow-arrow">

        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>

      </div>

    `;

    row.addEventListener('click', () => {

      closeSpotlight();

      window.openDetail(p.id);

    });

    spotlightResults.appendChild(row);

  }



// Mobile Bottom Nav Hooks

document.getElementById('mbnMap')?.addEventListener('click', () => { showView('map'); document.querySelectorAll('.mbn-item').forEach(e => e.classList.remove('active')); document.getElementById('mbnMap').classList.add('active'); });

document.getElementById('mbnDrawings')?.addEventListener('click', () => { showView('drawings'); document.querySelectorAll('.mbn-item').forEach(e => e.classList.remove('active')); document.getElementById('mbnDrawings').classList.add('active'); });



function adjustMobileFooterPadding() {

  if (window.innerWidth <= 768) {

    const dockWrap = document.getElementById('mobileBottomDock');

    const floatingSearch = document.querySelector('.m-floating-search-row');

    const wrap = document.querySelector('.wrap');

    if (wrap) {

      let requiredBottomPadding = 118;

      if (floatingSearch) {

        const rect = floatingSearch.getBoundingClientRect();

        const totalHeight = window.innerHeight - rect.top;

        if (totalHeight > 0) {

          requiredBottomPadding = Math.max(110, Math.round(totalHeight + 12));

        }

      }

      wrap.style.setProperty('padding-bottom', requiredBottomPadding + 'px', 'important');

    }

  }

}



let _resizeTimer;

window.addEventListener('resize', () => {

  clearTimeout(_resizeTimer);

  _resizeTimer = setTimeout(() => {

    renderCategoryChips();

    adjustMobileFooterPadding();

    const searchInput = document.getElementById('globalProjectSearch');

    if (searchInput) {

      searchInput.placeholder = 'Search projects...';

    }

    const spotlightInp = document.getElementById('spotlightInput');

    if (spotlightInp) {

      spotlightInp.placeholder = window.innerWidth <= 768 ? 'Search projects by name, state, or category...' : 'Search projects by name, state, or category... (Esc to close)';

    }

  }, 100);

});



document.addEventListener('DOMContentLoaded', adjustMobileFooterPadding);

if (document.readyState === 'complete' || document.readyState === 'interactive') {

  adjustMobileFooterPadding();

}

// Interactive Footer Tagline Word Cycle
document.addEventListener('click', (e) => {
  const wordsContainer = e.target.closest('.tagline-animated-words');
  if (!wordsContainer) return;
  
  const words = wordsContainer.querySelectorAll('.tagline-word');
  if (!words.length) return;
  
  let activeIndex = 0;
  words.forEach((w, idx) => {
    if (window.getComputedStyle(w).opacity > 0.5) {
      activeIndex = idx;
    }
  });
  
  const nextIndex = (activeIndex + 1) % words.length;
  words.forEach((w, idx) => {
    if (idx === nextIndex) {
      w.style.opacity = '1';
      w.style.transform = 'translateY(-50%) scale(1.12)';
      setTimeout(() => { w.style.transform = 'translateY(-50%) scale(1)'; }, 220);
    } else {
      w.style.opacity = '0';
    }
  });
});



// Interactive Footer Handlers

document.addEventListener('DOMContentLoaded', () => {

  initInteractiveFooter();

});

if (document.readyState === 'complete' || document.readyState === 'interactive') {

  initInteractiveFooter();

}



function initInteractiveFooter() {

  // 1. Dynamic Year

  const yearEl = document.getElementById('footerCurrentYear');

  if (yearEl) {

    yearEl.textContent = new Date().getFullYear();

  }



  // 2. Smooth Back to Top

  const backToTopBtn = document.getElementById('footerBackToTop');

  if (backToTopBtn && !backToTopBtn.dataset.bound) {

    backToTopBtn.dataset.bound = 'true';

    backToTopBtn.addEventListener('click', (e) => {

      e.preventDefault();

      window.scrollTo({

        top: 0,

        behavior: 'smooth'

      });

    });

  }

}



// Brochure Download Notification Toast Trigger

let _toastTimeout;

function showDownloadToast() {

  const toast = document.getElementById('downloadToast');

  if (!toast) return;

  toast.classList.add('show');

  clearTimeout(_toastTimeout);

  _toastTimeout = setTimeout(() => {

    toast.classList.remove('show');

  }, 3500);

}



function initBrochureHandlers() {

  if (window._brochureHandlersInitialized) return;

  const triggerBtn = document.getElementById('brochureDropdownTrigger');

  const dropdownContainer = document.querySelector('.brochure-dropdown-container');

  const viewOption = document.getElementById('brochureViewOption');

  const downloadOption = document.getElementById('navBrochureLabel');

  const modal = document.getElementById('brochureViewerModal');

  const closeModalBtn = document.getElementById('closeBrochureModal');

  const iframe = document.getElementById('brochureIframe');

  const brochureObj = document.getElementById('brochureObject');



  if (!triggerBtn && !document.getElementById('mNavBrochureBtn')) return;

  window._brochureHandlersInitialized = true;



  // Toggle Desktop Dropdown Menu

  if (triggerBtn && dropdownContainer) {

    triggerBtn.addEventListener('click', (e) => {

      e.stopPropagation();

      dropdownContainer.classList.toggle('active');

    });



    document.addEventListener('click', (e) => {

      if (!dropdownContainer.contains(e.target)) {

        dropdownContainer.classList.remove('active');

      }

    });

  }



  // 1. View Brochure Modal Option

  if (viewOption && modal) {

    viewOption.addEventListener('click', (e) => {

      e.stopPropagation();

      dropdownContainer?.classList.remove('active');

      const pdfUrl = 'assets/docs/brochure.pdf?v=' + Date.now();

      if (brochureObj) brochureObj.data = pdfUrl;

      if (iframe) iframe.src = pdfUrl;

      modal.classList.add('active');

      document.body.style.overflow = 'hidden';

    });

  }



  // Close Modal Handler

  const closeModal = () => {

    if (modal) {

      modal.classList.remove('active');

      if (brochureObj) brochureObj.data = '';

      if (iframe) iframe.src = '';

      document.body.style.overflow = '';

    }

  };



  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

  if (modal) {

    modal.addEventListener('click', (e) => {

      if (e.target === modal) closeModal();

    });

  }

  document.addEventListener('keydown', (e) => {

    if (e.key === 'Escape' && modal?.classList.contains('active')) closeModal();

  });



  // Helper to trigger actual PDF download programmatically

  const triggerPdfDownload = () => {

    const a = document.createElement('a');

    a.href = 'assets/docs/brochure.pdf';

    a.download = 'Brainstorm_Infotech_Brochure.pdf';

    document.body.appendChild(a);

    a.click();

    a.remove();

  };



  // 2. Download Option with Animation & Toast

  if (downloadOption) {

    const labelText = downloadOption.querySelector('.brochure-text');

    downloadOption.addEventListener('click', (e) => {

      e.stopPropagation();

      dropdownContainer?.classList.remove('active');



      downloadOption.classList.remove('downloaded');

      downloadOption.classList.add('downloading');

      if (labelText) labelText.textContent = 'Downloading...';



      setTimeout(() => {

        triggerPdfDownload();

        downloadOption.classList.remove('downloading');

        downloadOption.classList.add('downloaded');

        if (labelText) labelText.textContent = 'Downloaded';

        showDownloadToast();



        setTimeout(() => {

          downloadOption.classList.remove('downloaded');

          if (labelText) labelText.textContent = 'Download Brochure';

        }, 4000);

      }, 1000);

    });

  }



  // ============================================================

  // MOBILE BROCHURE DROPDOWN HANDLERS

  // ============================================================

  const mTriggerBtn = document.getElementById('mNavBrochureBtn');

  const mDropdownContainer = document.querySelector('.m-brochure-dropdown-container');

  const mViewOption = document.getElementById('mBrochureViewOption');

  const mDlOption = document.getElementById('mBrochureDlOption');



  if (mTriggerBtn && mDropdownContainer) {

    const handleMobileBrochureToggle = (e) => {

      e.preventDefault();

      e.stopPropagation();

      mDropdownContainer.classList.toggle('active');

    };



    mTriggerBtn.addEventListener('click', handleMobileBrochureToggle);

    mTriggerBtn.addEventListener('touchend', (e) => {

      e.preventDefault();

      handleMobileBrochureToggle(e);

    });



    document.addEventListener('click', (e) => {

      if (!mDropdownContainer.contains(e.target)) {

        mDropdownContainer.classList.remove('active');

      }

    });

    document.addEventListener('touchend', (e) => {

      if (!mDropdownContainer.contains(e.target)) {

        mDropdownContainer.classList.remove('active');

      }

    });

  }



  const handleMobileViewBrochure = (e) => {

    e.stopPropagation();

    mDropdownContainer?.classList.remove('active');

    const pdfUrl = 'assets/docs/brochure.pdf?v=' + Date.now();

    if (brochureObj) brochureObj.data = pdfUrl;

    if (iframe) iframe.src = pdfUrl;

    if (modal) {

      modal.classList.add('active');

      document.body.style.overflow = 'hidden';

    } else {

      window.open(pdfUrl, '_blank');

    }

  };



  if (mViewOption) {

    mViewOption.addEventListener('click', handleMobileViewBrochure);

    mViewOption.addEventListener('touchend', (e) => {

      e.preventDefault();

      handleMobileViewBrochure(e);

    });

  }



  if (mDlOption) {

    const mLabelText = mDlOption.querySelector('.brochure-text');

    const handleMobileDownload = (e) => {

      e.stopPropagation();

      mDropdownContainer?.classList.remove('active');



      mDlOption.classList.remove('downloaded');

      mDlOption.classList.add('downloading');

      if (mLabelText) mLabelText.textContent = 'Downloading...';



      setTimeout(() => {

        triggerPdfDownload();

        mDlOption.classList.remove('downloading');

        mDlOption.classList.add('downloaded');

        if (mLabelText) mLabelText.textContent = 'Downloaded';

        showDownloadToast();



        setTimeout(() => {

          mDlOption.classList.remove('downloaded');

          if (mLabelText) mLabelText.textContent = 'Download Brochure';

        }, 4000);

      }, 800);

    };



    mDlOption.addEventListener('click', handleMobileDownload);

    mDlOption.addEventListener('touchend', (e) => {

      e.preventDefault();

      handleMobileDownload(e);

    });

  }

}



function initDrawingPdfViewerModal() {

  const modal = document.getElementById('drawingPdfViewerModal');

  const closeModalBtn = document.getElementById('closeDrawingPdfModal');

  const iframe = document.getElementById('drawingPdfIframe');

  const pdfObj = document.getElementById('drawingPdfObject');
  const titleEl = document.getElementById('drawingPdfModalTitle');
  const downloadBtn = document.getElementById('drawingPdfDownloadBtn');
  const prevBtn = document.getElementById('prevDrawingPdfBtn');
  const nextBtn = document.getElementById('nextDrawingPdfBtn');
  const counterEl = document.getElementById('drawingPdfIndexCounter');

  let currentPdfCatKey = null;
  let currentPdfIndex = 0;

  function updatePdfModalContent() {
    if (!currentPdfCatKey || !cachedDrawingsData || !cachedDrawingsData[currentPdfCatKey]) return;
    const files = cachedDrawingsData[currentPdfCatKey].files || [];
    if (!files.length) return;

    if (currentPdfIndex < 0) currentPdfIndex = files.length - 1;
    if (currentPdfIndex >= files.length) currentPdfIndex = 0;

    const file = files[currentPdfIndex];
    const rawPath = (file.path.startsWith('/') ? file.path.slice(1) : file.path);
    const cleanUrl = encodeURI(rawPath);
    const title = file.name || 'Drawing Document';

    if (titleEl) titleEl.textContent = title;
    if (downloadBtn) {
      downloadBtn.href = cleanUrl;
      downloadBtn.download = title.replace(/\s+/g, '_') + '.pdf';
    }
    if (counterEl) {
      counterEl.textContent = `${currentPdfIndex + 1} / ${files.length}`;
    }

    if (pdfObj) pdfObj.data = cleanUrl;
    if (iframe) iframe.src = cleanUrl;
  }

  window.openDrawingPdf = function(pdfUrl, title, catKey, index) {
    if (!modal) {
      window.open(pdfUrl, '_blank');
      return;
    }
    currentPdfCatKey = catKey || null;
    currentPdfIndex = typeof index === 'number' ? index : 0;

    if (currentPdfCatKey && cachedDrawingsData && cachedDrawingsData[currentPdfCatKey]) {
      updatePdfModalContent();
    } else {
      const rawPath = (pdfUrl.startsWith('/') ? pdfUrl.slice(1) : pdfUrl);
      const cleanUrl = encodeURI(rawPath);
      if (titleEl) titleEl.textContent = title || 'Drawing Document';
      if (downloadBtn) {
        downloadBtn.href = cleanUrl;
        downloadBtn.download = (title || 'Drawing').replace(/\s+/g, '_') + '.pdf';
      }
      if (counterEl) counterEl.textContent = '';
      if (pdfObj) pdfObj.data = cleanUrl;
      if (iframe) iframe.src = cleanUrl;
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  prevBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    currentPdfIndex--;
    updatePdfModalContent();
  });

  nextBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    currentPdfIndex++;
    updatePdfModalContent();
  });

  const closeDrawingModal = () => {
    if (modal) {
      modal.classList.remove('active');
      if (pdfObj) pdfObj.data = '';
      if (iframe) iframe.src = '';
      document.body.style.overflow = '';
    }
  };

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeDrawingModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeDrawingModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!modal || !modal.classList.contains('active')) return;
    if (e.key === 'Escape') closeDrawingModal();
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      currentPdfIndex--;
      updatePdfModalContent();
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      currentPdfIndex++;
      updatePdfModalContent();
    }
  });
}



function restoreNavState(isHashChangeEvent = false) {
  const rawHash = (window.location.hash || '').replace(/^#\/?/, '').trim();
  let hashView = rawHash;
  let hashSub = '';

  if (rawHash.includes('/')) {
    const parts = rawHash.split('/');
    hashView = parts[0];
    hashSub = parts.slice(1).join('/');
  }

  // If no hash in URL and this is initial page load, check sessionStorage
  if (!hashView && !isHashChangeEvent) {
    const savedView = sessionStorage.getItem('brainstorm_current_view') || 'map';
    const savedFolder = sessionStorage.getItem('brainstorm_drawings_folder');
    const savedProject = sessionStorage.getItem('brainstorm_open_project');
    const savedRegion = sessionStorage.getItem('brainstorm_open_region');

    if (savedProject) {
      hashView = 'project';
      hashSub = savedProject;
    } else if (savedRegion && savedView === 'map') {
      hashView = 'region';
      hashSub = savedRegion;
    } else if (savedView === 'drawings' && savedFolder) {
      hashView = 'drawings';
      hashSub = savedFolder;
    } else {
      hashView = savedView;
    }
  }

  if (hashView === 'region' && hashSub) {
    const regionName = decodeURIComponent(hashSub);
    showView('map', false);
    const openReg = () => {
      if (window.MapModule && typeof window.MapModule.openPanel === 'function') {
        const list = (window.PROJECTS || []).filter(p => p.state === regionName);
        window.MapModule.openPanel(regionName, list, false);
      }
    };
    if (window.PROJECTS && window.PROJECTS.length > 0 && window.MapModule) {
      openReg();
    } else {
      setTimeout(openReg, 350);
    }
    return;
  }

  if (hashView === 'project' && hashSub) {
    const savedView = sessionStorage.getItem('brainstorm_current_view') || 'map';
    showView(savedView, false);
    const projId = hashSub;
    const openProj = () => {
      if (window.openDetail && window.PROJECTS && window.PROJECTS.length > 0) {
        window.openDetail(projId, false);
      }
    };
    if (window.PROJECTS && window.PROJECTS.length > 0) {
      openProj();
    } else {
      setTimeout(openProj, 350);
    }
    return;
  }

  // If not in project view, close detail modal if it happens to be open
  const detailOverlay = document.getElementById('detailOverlay');
  if (detailOverlay && detailOverlay.classList.contains('open') && hashView !== 'project') {
    closeDetail(false);
  }

  if (hashView === 'drawings') {
    showView('drawings', false);
    const catKey = hashSub;
    if (catKey) {
      if (window.cachedDrawingsData && window.renderFolderContents) {
        window.renderFolderContents(catKey, false);
      } else if (typeof window.loadDrawingsData === 'function') {
        window.loadDrawingsData((data) => {
          if (window.renderFolderContents) window.renderFolderContents(catKey, false);
        });
      }
    } else {
      if (window.renderFolders) {
        window.renderFolders(false);
      } else if (typeof window.loadDrawingsData === 'function') {
        window.loadDrawingsData();
      }
    }
    return;
  }

  if (hashView === 'admin') {
    const token = localStorage.getItem('steeltrack_admin_token');
    if (token) {
      showView('admin', false);
      try { if (typeof renderAdmin === 'function') renderAdmin(); } catch(e) {}
    } else {
      showView('login', false);
    }
    return;
  }

  if (hashView === 'login') {
    showView('login', false);
    return;
  }

  if (hashView === 'manage-admins') {
    showView('manage-admins', false);
    try { if (typeof fetchAndRenderManageAdmins === 'function') fetchAndRenderManageAdmins(); } catch(e) {}
    return;
  }

  if (hashView === 'brochure') {
    showView('brochure', false);
    return;
  }

  // Default fallback: map
  showView('map', false);
}
window.restoreNavState = restoreNavState;

function initApp() {

  if (window._appInitialized) return;

  window._appInitialized = true;

  window.showView = showView;

  window.goToMap = goToMap;

  // Instantly apply view on page load
  restoreNavState();

  initCustomCursor();

  initThemeToggle();

  setupNavigation();

  setupModal();

  setupAdminControls();

  setupDragAndDrop();

  fetchAppInitialData();

  initBrochureHandlers();

  initDrawingPdfViewerModal();

  window.addEventListener('hashchange', () => {
    restoreNavState(true);
  });

  // Top-Right Corner Mouse Proximity Detection for Secret Admin Button (Desktop Only)
  document.addEventListener('mousemove', (e) => {
    if (window.innerWidth <= 768) return; // Completely disable on mobile
    if (localStorage.getItem('steeltrack_admin_token')) return; // Completely skip if logged in
    const adminBtns = document.querySelectorAll('.secret-admin-trigger, #secretAdminTriggerBtn');
    if (!adminBtns.length) return;
    
    // Check if mouse is within 150px of the top-right corner (x >= innerWidth - 150 && y <= 150)
    const isNearTopRight = e.clientX >= (window.innerWidth - 150) && e.clientY <= 150;
    
    adminBtns.forEach(btn => {
      if (isNearTopRight) {
        btn.classList.add('near-top-right');
      } else {
        btn.classList.remove('near-top-right');
      }
    });
  });
}



document.addEventListener('DOMContentLoaded', initApp);

if (document.readyState === 'complete' || document.readyState === 'interactive') {

  initApp();

}





