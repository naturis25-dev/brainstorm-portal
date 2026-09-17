import re

# 1. Update openPanel in frontend/js/map.js
map_js_path = 'frontend/js/map.js'
with open(map_js_path, 'r', encoding='utf-8') as f:
    map_js = f.read()

new_open_panel_js = '''function openPanel(name, list) {
  var body = document.getElementById('panelBody');
  if (!body) return;

  var tons = (list || []).reduce(function(sum, p) { return sum + (p.tons || 0); }, 0);
  var activeCategory = 'All';
  var activeSort = 'newest';

  // Build category list and counts
  var cats = ['All'];
  var catCounts = { 'All': list.length };
  (list || []).forEach(function(p) {
    var c = p.category || 'Misc Steel';
    if (!catCounts[c]) {
      catCounts[c] = 0;
      cats.push(c);
    }
    catCounts[c]++;
  });

  function renderPanelContent() {
    var filtered = (list || []).filter(function(p) {
      return activeCategory === 'All' || p.category === activeCategory;
    });

    if (activeSort === 'tonnage') filtered.sort(function(a, b) { return (b.tons || 0) - (a.tons || 0); });
    else if (activeSort === 'year') filtered.sort(function(a, b) { return (parseInt(b.year) || 0) - (parseInt(a.year) || 0); });
    else if (activeSort === 'newest') filtered.sort(function(a, b) { return (parseInt(b.year) || 0) - (parseInt(a.year) || 0); });
    else if (activeSort === 'title') filtered.sort(function(a, b) { return (a.title || '').localeCompare(b.title || ''); });

    var chipHTML = cats.map(function(c) {
      var isAct = c === activeCategory ? 'active' : '';
      return '<button class="region-filter-pill ' + isAct + '" onclick="window.setRegionCat(\'' + c.replace(/'/g, "\\'") + '\')">' + c + ' (' + catCounts[c] + ')</button>';
    }).join('');

    var cardsHTML = '';
    if (!filtered.length) {
      cardsHTML = '<div class="no-data" style="padding: 40px 20px; text-align: center; color: var(--sub);">No projects match this category.</div>';
    } else {
      cardsHTML = filtered.map(function(p) {
        var imgSrc = (p.images && p.images[0]) ? p.images[0] : 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=300&q=80';
        var catBadge = (p.category || 'INDUSTRIAL').toUpperCase();
        var tonsFormatted = p.tons ? Math.round(p.tons).toLocaleString() + ' T' : 'N/A';
        var yearFormatted = p.year || '2026';
        var locFormatted = p.state ? (p.state + ', ' + (p.country || 'USA')) : 'North America';

        return '<div class="region-proj-card" onclick="window.openDetail(\'' + p.id + '\')">' +
          '<img class="region-card-img" src="' + imgSrc + '" alt="' + p.title + '">' +
          '<div class="region-card-body">' +
            '<span class="region-card-badge">' + catBadge + '</span>' +
            '<h4 class="region-card-title">' + p.title + '</h4>' +
            '<div class="region-card-specs">' +
              '<span>📦 ' + tonsFormatted + '</span>' +
              '<span class="spec-dot">•</span>' +
              '<span>📅 ' + yearFormatted + '</span>' +
              '<span class="spec-dot">•</span>' +
              '<span>📍 ' + locFormatted + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="region-card-arrow">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    body.innerHTML =
      '<div class="region-modal-header">' +
        '<div class="region-header-left">' +
          '<span class="region-eyebrow">REGION</span>' +
          '<h2 class="region-name-title">' + name + '</h2>' +
          '<div class="region-stats-sub">' +
            '<span>🏢 ' + list.length + ' projects</span>' +
            '<span class="stats-sep">•</span>' +
            '<span>📦 ' + Math.round(tons).toLocaleString() + ' tons detailed</span>' +
          '</div>' +
        '</div>' +
        '<div class="region-header-watermark">' +
          '<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="rgba(37,99,235,0.18)" stroke-width="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>' +
        '</div>' +
      '</div>' +
      
      '<div class="region-toolbar-row">' +
        '<div class="region-chips-wrapper">' + chipHTML + '</div>' +
        '<div class="region-sort-wrap">' +
          '<select class="region-sort-select" onchange="window.setRegionSort(this.value)">' +
            '<option value="newest"' + (activeSort === 'newest' ? ' selected' : '') + '>Sort by: Newest</option>' +
            '<option value="tonnage"' + (activeSort === 'tonnage' ? ' selected' : '') + '>Sort by: Tonnage</option>' +
            '<option value="title"' + (activeSort === 'title' ? ' selected' : '') + '>Sort by: Title</option>' +
          '</select>' +
        '</div>' +
      '</div>' +

      '<div class="region-cards-list">' + cardsHTML + '</div>' +

      '<div class="region-modal-footer">' +
        '<div class="region-footer-left">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>' +
          '<span>View all ' + name + ' projects</span>' +
        '</div>' +
        '<button class="region-explore-btn" onclick="window.closePanel && window.closePanel()">' +
          '<span>Explore on map</span>' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>' +
        '</button>' +
      '</div>';
  }

  window.setRegionCat = function(c) {
    activeCategory = c;
    renderPanelContent();
  };

  window.setRegionSort = function(s) {
    activeSort = s;
    renderPanelContent();
  };

  renderPanelContent();

  document.getElementById('overlay').classList.add('open');
  document.getElementById('panel').classList.add('open');
  if (typeof updateAdminBtnVisibility === 'function') updateAdminBtnVisibility();
}'''

# Replace openPanel in map.js
idx_start = map_js.find('function openPanel(name, list) {')
if idx_start != -1:
    idx_end = map_js.find('function renderStats(', idx_start)
    if idx_end != -1:
        map_js = map_js[:idx_start] + new_open_panel_js + '\n\n' + map_js[idx_end:]
        with open(map_js_path, 'w', encoding='utf-8') as f:
            f.write(map_js)
        print('Updated openPanel in map.js!')

# 2. Append CSS to frontend/css/style.css
css_path = 'frontend/css/style.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

region_modal_css = '''/* ============================================================
   EXACT REGION MODAL DRAWER STYLES (MATCHING REFERENCE IMAGE)
============================================================ */
.panel {
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -45%) scale(0.96) !important;
  width: min(580px, calc(100vw - 32px)) !important;
  height: min(760px, calc(100vh - 40px)) !important;
  max-height: calc(100vh - 40px) !important;
  background: #ffffff !important;
  border-radius: 24px !important;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.18) !important;
  border: 1px solid rgba(226, 232, 240, 0.9) !important;
  z-index: 1000 !important;
  opacity: 0 !important;
  pointer-events: none !important;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease !important;
  overflow: hidden !important;
  display: flex !important;
  flex-direction: column !important;
}

.panel.open {
  transform: translate(-50%, -50%) scale(1) !important;
  opacity: 1 !important;
  pointer-events: auto !important;
}

body.dark-mode .panel {
  background: #0f172a !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.5) !important;
}

/* Region Header */
.region-modal-header {
  padding: 24px 28px 16px !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: flex-start !important;
  position: relative !important;
}

.region-eyebrow {
  font-size: 11px !important;
  font-weight: 800 !important;
  letter-spacing: 1.2px !important;
  color: #94a3b8 !important;
  text-transform: uppercase !important;
  display: block !important;
  margin-bottom: 4px !important;
}

.region-name-title {
  font-size: 32px !important;
  font-weight: 800 !important;
  color: #0f172a !important;
  line-height: 1.15 !important;
  margin: 0 0 6px 0 !important;
  letter-spacing: -0.5px !important;
}

body.dark-mode .region-name-title {
  color: #f8fafc !important;
}

.region-stats-sub {
  font-size: 13px !important;
  font-weight: 600 !important;
  color: #64748b !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}

.stats-sep {
  color: #cbd5e1 !important;
}

/* Region Toolbar */
.region-toolbar-row {
  padding: 0 28px 14px !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  gap: 12px !important;
}

.region-chips-wrapper {
  display: flex !important;
  gap: 8px !important;
  overflow-x: auto !important;
  scrollbar-width: none !important;
}

.region-filter-pill {
  padding: 6px 14px !important;
  border-radius: 100px !important;
  font-size: 12.5px !important;
  font-weight: 600 !important;
  background: #f1f5f9 !important;
  color: #475569 !important;
  border: 1px solid transparent !important;
  cursor: pointer !important;
  white-space: nowrap !important;
  transition: all 0.2s ease !important;
}

.region-filter-pill.active {
  background: #2563eb !important;
  color: #ffffff !important;
}

.region-sort-select {
  padding: 6px 12px !important;
  border-radius: 100px !important;
  font-size: 12.5px !important;
  font-weight: 600 !important;
  border: 1px solid #e2e8f0 !important;
  background: #ffffff !important;
  color: #0f172a !important;
  cursor: pointer !important;
}

/* Region Cards List */
.region-cards-list {
  flex: 1 1 auto !important;
  overflow-y: auto !important;
  padding: 0 28px 16px !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 12px !important;
}

.region-proj-card {
  display: flex !important;
  align-items: center !important;
  gap: 16px !important;
  padding: 12px !important;
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 16px !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03) !important;
}

.region-proj-card:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.08) !important;
  border-color: rgba(37, 99, 235, 0.3) !important;
}

body.dark-mode .region-proj-card {
  background: #1e293b !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
}

.region-card-img {
  width: 105px !important;
  height: 75px !important;
  border-radius: 12px !important;
  object-fit: cover !important;
  flex-shrink: 0 !important;
  background: #f1f5f9 !important;
}

.region-card-body {
  flex: 1 1 auto !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 4px !important;
}

.region-card-badge {
  font-size: 10px !important;
  font-weight: 800 !important;
  color: #2563eb !important;
  background: rgba(37, 99, 235, 0.08) !important;
  padding: 3px 8px !important;
  border-radius: 100px !important;
  align-self: flex-start !important;
  letter-spacing: 0.5px !important;
}

.region-card-title {
  font-size: 14.5px !important;
  font-weight: 700 !important;
  color: #0f172a !important;
  margin: 0 !important;
  line-height: 1.3 !important;
}

body.dark-mode .region-card-title {
  color: #f8fafc !important;
}

.region-card-specs {
  font-size: 11.5px !important;
  font-weight: 500 !important;
  color: #64748b !important;
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
}

.spec-dot {
  color: #cbd5e1 !important;
}

.region-card-arrow {
  width: 32px !important;
  height: 32px !important;
  border-radius: 50% !important;
  background: #f1f5f9 !important;
  color: #475569 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0 !important;
  transition: all 0.2s ease !important;
}

.region-proj-card:hover .region-card-arrow {
  background: #2563eb !important;
  color: #ffffff !important;
}

/* Region Modal Footer */
.region-modal-footer {
  padding: 16px 28px !important;
  border-top: 1px solid #e2e8f0 !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  background: #f8fafc !important;
}

body.dark-mode .region-modal-footer {
  background: #0f172a !important;
  border-top-color: rgba(255, 255, 255, 0.08) !important;
}

.region-footer-left {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  font-size: 13.5px !important;
  font-weight: 700 !important;
  color: #0f172a !important;
}

body.dark-mode .region-footer-left {
  color: #f8fafc !important;
}

.region-explore-btn {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  padding: 8px 18px !important;
  border-radius: 100px !important;
  background: #dbeafe !important;
  color: #2563eb !important;
  font-size: 13px !important;
  font-weight: 700 !important;
  border: none !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
}

.region-explore-btn:hover {
  background: #2563eb !important;
  color: #ffffff !important;
}

@media (max-width: 768px) {
  .panel {
    width: 100vw !important;
    height: 90vh !important;
    max-height: 90vh !important;
    top: auto !important;
    bottom: 0 !important;
    left: 0 !important;
    transform: translateY(100%) !important;
    border-radius: 24px 24px 0 0 !important;
  }
  .panel.open {
    transform: translateY(0) !important;
  }
}
'''

if 'EXACT REGION MODAL DRAWER STYLES' not in css:
    css += '\n' + region_modal_css
    with open(css_path, 'w', encoding='utf-8') as f:
        f.write(css)
    print('Updated CSS with region modal styles!')
