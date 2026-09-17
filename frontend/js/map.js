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
  if (usFeatures && usFeatures.length && caFeatures && caFeatures.length) {
    if (onReady) onReady();
    return;
  }
  
  if (window.US_MAP_DATA && window.CA_MAP_DATA) {
    try {
      if (window.US_MAP_DATA.objects) {
        usFeatures = topojson.feature(window.US_MAP_DATA, window.US_MAP_DATA.objects.states).features;
      }
      if (window.CA_MAP_DATA.features) {
        caFeatures = window.CA_MAP_DATA.features;
      }
      if (onReady) onReady();
      return;
    } catch (e) {
      console.warn('Error parsing global map data, falling back to fetch', e);
    }
  }

  var tryLoad = function(path) {
    return d3.json(path)
      .catch(function() { return d3.json('./' + path); })
      .catch(function() { return d3.json('/' + path); });
  };

  Promise.all([
    tryLoad('assets/vendor/us-states.json'),
    tryLoad('assets/vendor/canada.geojson')
  ]).then(function(results) {
    var usTopo = results[0];
    var caGeo  = results[1];
    if (usTopo && usTopo.objects) {
      usFeatures = topojson.feature(usTopo, usTopo.objects.states).features;
    }
    if (caGeo && caGeo.features) {
      caFeatures = caGeo.features;
    }
    if (onReady) onReady();
  }).catch(function(err) {
    console.error('Map data load failed:', err);
  });
}

// Auto-trigger map feature loading immediately
loadMapData(function() {
  if (typeof drawMap === 'function') {
    drawMap(window.PROJECTS || [], window.currentCategory || 'All', window.currentCountry || 'us');
  }
});

function drawMap(projectsList, categoryFilter, countryFilter) {
  var country  = countryFilter  || window.currentCountry || 'us';
  var category = categoryFilter || window.currentCategory || 'All';
  var list     = projectsList   || window.PROJECTS || [];

  var svg = d3.select('#map');
  if (svg.empty()) return;
  svg.selectAll('*').remove();

  document.body.classList.toggle('theme-ca', country === 'ca');

  var feats = country === 'us' ? usFeatures : caFeatures;
  if (!feats || !feats.length) {
    console.warn('No map features loaded yet for country:', country, '— Triggering loadMapData fallback');
    loadMapData(function() {
      drawMap(list, category, country);
    });
    return;
  }
  var isMobile = window.innerWidth <= 768;
  var projection = country === 'us'
    ? d3.geoAlbersUsa().translate([480, isMobile ? 300 : 300]).scale(isMobile ? 1180 : 1150)
    : d3.geoAlbers().rotate([96, 0]).center([2, 59]).parallels([50, 70])
        .translate([480, isMobile ? 370 : 365])
        .scale(isMobile ? 880 : 720);

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

var STATE_ABBRS = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
  'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
  'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
  'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
  'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
  'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
  'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY',
  'Alberta': 'AB', 'British Columbia': 'BC', 'Manitoba': 'MB', 'New Brunswick': 'NB',
  'Newfoundland and Labrador': 'NL', 'Nova Scotia': 'NS', 'Ontario': 'ON', 'Prince Edward Island': 'PE',
  'Quebec': 'QC', 'Saskatchewan': 'SK', 'Northwest Territories': 'NT', 'Nunavut': 'NU', 'Yukon': 'YT'
};

function getStateAbbr(name) {
  return STATE_ABBRS[name] || (name ? name.substring(0, 2).toUpperCase() : '');
}

function renderStateIllustration(name) {
  var allFeats = (usFeatures || []).concat(caFeatures || []);
  var feat = allFeats.find(function(f) { return f && f.properties && f.properties.name === name; });
  var abbr = getStateAbbr(name);
  
  var pathD = '';
  if (feat) {
    try {
      var projection = d3.geoIdentity().reflectY(true).fitSize([90, 80], feat);
      pathD = d3.geoPath(projection)(feat);
    } catch(e) {}
  }
  
  if (!pathD) {
    return '<div class="region-header-watermark">' +
      '<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="rgba(37,99,235,0.18)" stroke-width="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>' +
    '</div>';
  }

  return '<div class="state-illustration-container">' +
    '<div class="state-svg-wrapper">' +
      '<svg width="100" height="90" viewBox="-5 -5 100 90">' +
        '<path d="' + pathD + '" class="state-illustration-path" />' +
      '</svg>' +
      '<div class="state-illustration-badge">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="#2563eb" class="state-badge-pin"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>' +
        '<span class="state-badge-abbr">' + abbr + '</span>' +
      '</div>' +
    '</div>' +
    '<div class="state-script-name">' + name + '</div>' +
  '</div>';
}

function openPanel(name, list) {
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
      var safeCat = c.replace(/'/g, "\\'");
      return '<button class="region-filter-pill ' + isAct + '" onclick="window.setRegionCat(\'' + safeCat + '\')">' + c + ' (' + catCounts[c] + ')</button>';
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
              '<span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px; margin-right:4px; opacity:0.75;"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>' + tonsFormatted + '</span>' +
              '<span class="spec-divider">|</span>' +
              '<span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px; margin-right:4px; opacity:0.75;"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>' + yearFormatted + '</span>' +
              '<span class="spec-divider">|</span>' +
              '<span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px; margin-right:4px; opacity:0.75;"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>' + locFormatted + '</span>' +
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
            '<span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px; margin-right:4px;"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12h12"/><path d="M6 7h12"/><path d="M6 17h12"/></svg>' + list.length + ' projects</span>' +
            '<span class="stats-sep">•</span>' +
            '<span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px; margin-right:4px;"><path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>' + Math.round(tons).toLocaleString() + ' tons detailed</span>' +
          '</div>' +
        '</div>' +
        renderStateIllustration(name) +
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
