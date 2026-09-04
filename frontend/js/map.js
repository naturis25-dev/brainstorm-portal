// map.js - D3.js Map Renderer
// NOTE: currentCountry and currentCategory are managed by app.js (global scope)

let usFeatures = [];
let caFeatures = [];

function bandFor(count) {
  if (!count) return 0;
  if (count <= 3) return 1;
  if (count <= 6) return 2;
  if (count <= 9) return 3;
  return 4;
}

function projectsForState(name, projectsList, categoryFilter) {
  var cat = categoryFilter || 'All';
  return (projectsList || []).filter(function(p) {
    return p.state === name && (cat === 'All' || p.category === cat);
  });
}

function loadMapData(onReady) {
  Promise.all([
    d3.json('assets/vendor/us-states.json'),
    d3.json('assets/vendor/canada.geojson')
  ]).then(function(results) {
    var usTopo = results[0];
    var caGeo  = results[1];
    usFeatures = topojson.feature(usTopo, usTopo.objects.states).features;
    caFeatures = caGeo.features;
    if (onReady) onReady();
  }).catch(function(err) {
    console.error('Map data load failed:', err);
    var mapCard = document.querySelector('.map-card');
    if (mapCard) {
      mapCard.innerHTML = '<div style="text-align:center;padding:60px 20px;color:#666;font-weight:600;">Map failed to load. Please refresh.</div>';
    }
  });
}

function drawMap(projectsList, categoryFilter, countryFilter) {
  var country  = countryFilter  || 'us';
  var category = categoryFilter || 'All';

  var svg = d3.select('#map');
  if (svg.empty()) return;
  svg.selectAll('*').remove();

  document.body.classList.toggle('theme-ca', country === 'ca');

  var feats = country === 'us' ? usFeatures : caFeatures;
  if (!feats || !feats.length) {
    console.warn('No map features loaded yet for country:', country);
    return;
  }

  var projection = country === 'us'
    ? d3.geoAlbersUsa().translate([480, 300]).scale(1150)
    : d3.geoAlbers().rotate([96, 0]).center([5, 63]).parallels([50, 70]).translate([480, 380]).scale(950);

  var path = d3.geoPath(projection);

  svg.append('g').selectAll('path')
    .data(feats)
    .join('path')
    .attr('class', function(d) {
      var name = d.properties.name;
      var c = projectsForState(name, projectsList, category).length;
      return 'state ' + (c ? 'band-' + bandFor(c) + ' has-projects' : 'nodata');
    })
    .attr('d', path)
    .on('mouseenter', function(event, d) { handleHover(event, d, projectsList, category); })
    .on('mousemove',  handleMove)
    .on('mouseleave', handleLeave)
    .on('click',      function(event, d) { handleClick(event, d, projectsList, category); });

  renderStats(projectsList, country, category);
}

function handleHover(event, d, projectsList, category) {
  var tooltip = d3.select('#tooltip');
  var name    = d.properties.name;
  var list    = projectsForState(name, projectsList, category);
  var tons    = list.reduce(function(a, p) { return a + (p.tons || 0); }, 0);

  if (!list || list.length === 0) {
    tooltip.html(
      '<div class="t-name">' + name + '</div>' +
      '<div class="t-meta">No projects yet</div>'
    ).classed('show', true);
  } else {
    tooltip.html(
      '<div class="t-name">' + name + '</div>' +
      '<div class="t-meta">' + Math.round(tons).toLocaleString() + ' Total Tons</div>' +
      '<div class="t-cta">Click to explore &rarr;</div>'
    ).classed('show', true);
  }
}

function handleMove(event) {
  var mapCard = document.querySelector('.map-card');
  var tooltip = d3.select('#tooltip');
  if (!mapCard || tooltip.empty()) return;
  var rect = mapCard.getBoundingClientRect();
  tooltip
    .style('left', (event.clientX - rect.left) + 'px')
    .style('top',  (event.clientY - rect.top) + 'px');
}

function handleLeave() {
  d3.select('#tooltip').classed('show', false);
}

function handleClick(event, d, projectsList, category) {
  var name = d.properties.name;
  var list = projectsForState(name, projectsList, category);
  
  // Smoothly scroll the map to the center of the screen when clicked
  var mapCardElement = document.querySelector('.map-card');
  if (mapCardElement) {
    mapCardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  
  // Hide tooltip
  d3.select('#tooltip').classed('show', false);

  if (!list || list.length === 0) {
    // If no projects, just open the empty panel immediately
    openPanel(name, list);
    return;
  }

  // 1. Create burst layer for the animation
  var rect = mapCardElement.getBoundingClientRect();
  var x = event.clientX - rect.left;
  var y = event.clientY - rect.top;

  var burst = document.createElement('div');
  burst.className = 'burst-layer';
  
  var topProjects = list.slice(0, 3);
  var html = '<div class="burst-pin" style="left:' + x + 'px; top:' + y + 'px;"></div>';
  
  // Arrange around center
  var angles = [-Math.PI/2, Math.PI/6, 5*Math.PI/6];
  var radius = window.innerWidth <= 768 ? 60 : 90;

  topProjects.forEach(function(p, i) {
    var px = x + Math.cos(angles[i]) * radius;
    var py = y + Math.sin(angles[i]) * radius;
    var imgSrc = (p.images && p.images[0]) ? p.images[0] : 'assets/placeholder.jpg';
    var cat = p.category || 'Industrial';
    
    var delay = i * 0.15; // Staggered pop effect

    html += `<div class="burst-thumb" style="left:${px}px; top:${py}px; animation-delay:${delay}s;">
              <img loading="lazy" decoding="async" src="${imgSrc}">
              <div class="bt-label">${cat}</div>
            </div>`;
  });

  burst.innerHTML = html;
  mapCardElement.appendChild(burst);

  // Wait 1.4s, then start fading it out and open the panel
  setTimeout(function() {
    burst.classList.add('dismiss');
    setTimeout(function() { burst.remove(); }, 300);
    openPanel(name, list);
  }, 1400); // Cinematic delay
}

function openPanel(name, list) {
  var body = document.getElementById('panelBody');
  if (!body) return;

  if (!list.length) {
    window.currentRegionProjects = [];
    body.innerHTML =
      '<div class="panel-hero">' +
        '<div class="panel-hero-bg"></div>' +
        '<div class="sd-head" style="position:relative; z-index:2;">' +
          '<div class="p-eyebrow">REGION</div>' +
          '<h2 class="p-title" style="margin:0; font-size:36px; font-weight:900; letter-spacing:-1px;">' + name + '</h2>' +
        '</div>' +
      '</div>' +
      '<div class="panel-content">' +
        '<div class="no-data">No projects delivered here yet.<br>Open for new engagements.</div>' +
      '</div>';
  } else {
    window.currentRegionProjects = list.map(function(p) { return p.id; });
    var tons = list.reduce(function(sum, p) { return sum + (p.tons || 0); }, 0);
    
    // Sort logic
    function sortList(sortMode) {
      var sorted = list.slice();
      if (sortMode === 'tonnage') sorted.sort(function(a, b) { return (b.tons || 0) - (a.tons || 0); });
      else if (sortMode === 'year') sorted.sort(function(a, b) { return (parseInt(b.year) || 0) - (parseInt(a.year) || 0); });
      else if (sortMode === 'title') sorted.sort(function(a, b) { return (a.title || '').localeCompare(b.title || ''); });
      return sorted;
    }

    body.innerHTML =
      '<div class="panel-hero">' +
        '<div class="panel-hero-bg"></div>' +
        '<div class="sd-head" style="position:relative; z-index:2;">' +
          '<div class="p-eyebrow">REGION</div>' +
          '<h2 class="p-title" style="margin:0; font-size:38px; font-weight:900; letter-spacing:-1.2px;">' + name + '</h2>' +
        '</div>' +
        '<div class="sd-summary" style="display:flex; gap:16px; margin-top:24px; position:relative; z-index:2;">' +
          '<div class="summary-cell premium-cell">' +
            '<div class="cell-icon"><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M9 8h1"/><path d="M9 12h1"/><path d="M9 16h1"/><path d="M14 8h1"/><path d="M14 12h1"/><path d="M14 16h1"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/></svg></div>' +
            '<div><div class="n" style="font-size:24px; font-weight:900;">' + list.length + '</div><div class="l" style="font-size:11px; font-weight:700; color:var(--sub);">PROJECTS</div></div>' +
          '</div>' +
          '<div class="summary-cell premium-cell">' +
            '<div class="cell-icon"><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg></div>' +
            '<div><div class="n" style="font-size:24px; font-weight:900;">' + Math.round(tons).toLocaleString() + '</div><div class="l" style="font-size:11px; font-weight:700; color:var(--sub);">TONS DETAILED</div></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="panel-content">' +
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">' +
          '<div style="font-weight:800;font-size:13px; color:var(--sub); letter-spacing:0.5px;">PROJECT LIST</div>' +
          '<div class="custom-select-wrap" id="projectSortWrap">' +
              '<div class="custom-select-trigger" id="projectSortTrigger" onclick="event.stopPropagation(); document.getElementById(\'projectSortWrap\').classList.toggle(\'open\');">' +
                '<span id="projectSortLabel">Sort: Default</span>' +
                '<svg class="sort-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>' +
              '</div>' +
              '<div class="custom-select-menu" id="projectSortMenu">' +
                '<div class="custom-select-option" onclick="window.selectSort(\'default\', \'Sort: Default\')">Sort: Default</div>' +
                '<div class="custom-select-option" onclick="window.selectSort(\'tonnage\', \'Largest Tonnage\')">Largest Tonnage</div>' +
                '<div class="custom-select-option" onclick="window.selectSort(\'year\', \'Newest First\')">Newest First</div>' +
                '<div class="custom-select-option" onclick="window.selectSort(\'title\', \'Alphabetical (A-Z)\')">Alphabetical (A-Z)</div>' +
              '</div>' +
            '</div>' +
            '</div>' +
        '</div>' +
        '<div id="projectListContainer"></div>' +
      '</div>';

    function renderCards(sortMode) {
      var sortedList = sortList(sortMode);
      window.currentRegionProjects = sortedList.map(function(p) { return p.id; });
      var container = document.getElementById('projectListContainer');
      if (container) {
        container.innerHTML = sortedList.map(function(p, index) {
          var delay = 0.15 + (index * 0.05); // staggered delay starting after the summary
          var imgSrc = (p.images && p.images[0]) ? '<img class="pc-img" loading="lazy" decoding="async" src="' + p.images[0] + '">' : '<div class="pc-img-placeholder"></div>';
          var catLabel = (p.category || 'MISC STEEL').toUpperCase();
          
          var imgThumb = (p.images && p.images[0]) ? '<img class="prow-img" loading="lazy" src="' + p.images[0] + '">' : '<div class="prow-img prow-img-ph"></div>';
            return '<div class="proj-row" data-id="' + p.id + '" style="animation-delay:' + delay + 's;">' +
              imgThumb +
              '<div class="prow-body">' +
                '<div class="prow-eyebrow">' + catLabel + '</div>' +
                '<div class="prow-title">' + p.title + '</div>' +
                '<div class="prow-meta">' +
                  (p.tons ? '<span class="prow-badge">' + Math.round(p.tons).toLocaleString() + ' T</span>' : '') +
                  (p.year ? '<span class="prow-year">' + p.year + '</span>' : '') +
                '</div>' +
              '</div>' +
              '<div class="prow-arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg></div>' +
            '</div>';
        }).join('');

        container.querySelectorAll('.proj-row').forEach(function(card) {
          card.addEventListener('click', function() {
            if (window.openDetail) window.openDetail(card.dataset.id);
          });
        });
      }
    }

    renderCards('default');

    
      window.selectSort = function(val, text) {
        var wrap = document.getElementById('projectSortWrap');
        var label = document.getElementById('projectSortLabel');
        if (label) label.textContent = text;
        if (wrap) wrap.classList.remove('open');
        renderCards(val);
      };
      
      document.onclick = function() {
        var wrap = document.getElementById('projectSortWrap');
        if (wrap) wrap.classList.remove('open');
      };

  }

  document.getElementById('overlay').classList.add('open');
  document.getElementById('panel').classList.add('open');
  if (typeof updateAdminBtnVisibility === 'function') updateAdminBtnVisibility();
}

function renderStats(projectsList, country, category) {
  var statsRow = document.getElementById('statsRow');
  if (!statsRow) return;

  var relevant = (projectsList || []).filter(function(p) {
    return p.country === country.toUpperCase() &&
           (category === 'All' || p.category === category);
  });

  var statesCovered = new Set(relevant.map(function(p) { return p.state; })).size;
  var unitLabel = country === 'us' ? 'states' : 'provinces';

  statsRow.innerHTML =
    '<h2 class="hm-title" style="font-size: 24px; font-weight: 800; color: var(--ink); margin-bottom: 12px; letter-spacing: -0.02em;">Mapping Our Projects Across North America.</h2>';
}

// Export module
window.MapModule = {
  loadMapData: loadMapData,
  drawMap:     drawMap,
  openPanel: openPanel
};
