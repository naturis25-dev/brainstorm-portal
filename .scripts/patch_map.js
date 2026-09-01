const fs = require('fs');

let content = fs.readFileSync('frontend/js/map.js', 'utf8');

// Update projectsForState
content = content.replace(
  /function projectsForState\\(name, projectsList, categoryFilter\\) \\{[\\s\\S]*?\\n\\}/,
  \unction projectsForState(name, stats) {
  if (!stats || !stats.regions) return { count: 0, tons: 0 };
  return stats.regions[name] || { count: 0, tons: 0 };
}\
);

// Update drawMap signature and internals
content = content.replace(/function drawMap\\(projectsList, categoryFilter, countryFilter\\) \\{/, 'function drawMap(stats, categoryFilter, countryFilter) {');
content = content.replace(/projectsForState\\(name, projectsList, category\\)\\.length/, 'projectsForState(name, stats).count');
content = content.replace(/handleHover\\(event, d, projectsList, category\\)/g, 'handleHover(event, d, stats)');
content = content.replace(/handleClick\\(event, d, projectsList, category\\)/g, 'handleClick(event, d, stats)');
content = content.replace(/renderStats\\(projectsList, country, category\\)/g, 'renderStats(stats, country)');

// Update handleHover
content = content.replace(/function handleHover\\(event, d, projectsList, category\\) \\{[\\s\\S]*?var list\\s*=\\s*projectsForState\\(name, projectsList, category\\);[\\s\\S]*?var tons\\s*=\\s*list\\.reduce\\([^)]+\\), 0\\);/m, 
\unction handleHover(event, d, stats) {
  var tooltip = d3.select('#tooltip');
  var name    = d.properties.name;
  var stateStats = projectsForState(name, stats);
  var tons    = stateStats.tons;
  var list = { length: stateStats.count };\);
  
// Update renderStats
content = content.replace(/function renderStats\\(projectsList, country, category\\) \\{[\\s\\S]*?var statesCovered = [^;]+;[\\s\\S]*?var unitLabel/m,
\unction renderStats(stats, country) {
  var statsRow = document.getElementById('statsRow');
  if (!statsRow) return;
  var relevantLength = stats.totalProjects || 0;
  var relevantTons = stats.totalTons || 0;
  var statesCovered = stats.statesCovered || 0;
  var unitLabel\);
content = content.replace(/relevant\\.length/g, 'relevantLength');
content = content.replace(/relevant\\.reduce\\(function\\(a, p\\) \\{ return a \\+ \\(p\\.tons \\|\\| 0\\); \\}, 0\\)/g, 'relevantTons');

// Update handleClick
let handleClickCode = \unction handleClick(event, d, stats) {
  var name = d.properties.name;
  var stateStats = projectsForState(name, stats);
  
  var mapCardElement = document.querySelector('.map-card');
  if (mapCardElement) mapCardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  d3.select('#tooltip').classed('show', false);

  if (stateStats.count === 0) {
    if (typeof openPanel === 'function') openPanel(name, []);
    return;
  }

  var rect = mapCardElement.getBoundingClientRect();
  var x = event.clientX - rect.left;
  var y = event.clientY - rect.top;

  var burst = document.createElement('div');
  burst.className = 'burst-layer';
  burst.innerHTML = '<div class="burst-pin" style="left:' + x + 'px; top:' + y + 'px;"></div>';
  mapCardElement.appendChild(burst);

  if (typeof apiFetch === 'function') {
    apiFetch(\\\/projects?state=\\$\\{encodeURIComponent(name)\\}&country=\\$\\{window.currentCountry || 'us'\\}&category=\\$\\{window.currentCategory || 'All'\\}&sort=key&limit=50\\\)
      .then(res => {
        var list = res.projects || [];
        var topProjects = list.slice(0, 3);
        var html = burst.innerHTML;
        var angles = [-Math.PI/2, Math.PI/6, 5*Math.PI/6];
        var radius = 90;
        topProjects.forEach(function(p, i) {
          var px = x + Math.cos(angles[i]) * radius;
          var py = y + Math.sin(angles[i]) * radius;
          var imgSrc = (p.images && p.images[0]) ? p.images[0] : 'assets/placeholder.jpg';
          var cat = p.category || 'Industrial';
          var delay = i * 0.15;
          html += \\\<div class="burst-thumb" style="left:\\\px; top:\\\px; animation-delay:\\\s;"><img loading="lazy" decoding="async" src="\\\"><div class="bt-label">\\\</div></div>\\\;
        });
        burst.innerHTML = html;
        setTimeout(function() {
          burst.classList.add('dismiss');
          setTimeout(function() { burst.remove(); }, 300);
          if (typeof openPanel === 'function') openPanel(name, list);
        }, 1400);
      })
      .catch(err => {
        burst.remove();
        if (typeof openPanel === 'function') openPanel(name, []);
      });
  }
}\;
content = content.replace(/function handleClick\\(event, d, projectsList, category\\) \\{[\\s\\S]*?function renderStats/m, handleClickCode + '\\n\\nfunction renderStats');

// Update openPanel
let openPanelTop = \unction openPanel(name, list) {
  var body = document.getElementById('panelBody');
  if (!body) return;

  if (!list.length) {
    window.currentRegionProjects = [];
    body.innerHTML =
      '<div class="panel-hero">' +
        '<div class="panel-hero-bg"></div>' +
        '<div class="sd-head" style="position:relative; z-index:2;">' +
          '<div class="p-eyebrow">REGION</div>' +
          '<h2 class="p-title" style="margin:0; font-size:38px; font-weight:900; letter-spacing:-1.2px;">' + name + '</h2>' +
        '</div>' +
      '</div>' +
      '<div class="panel-content">' +
        '<div class="no-data">No projects delivered here yet.<br>Open for new engagements.</div>' +
      '</div>';
  } else {
    window.currentRegionProjects = list.map(function(p) { return p.id; });
    var stats = projectsForState(name, window.PROJECT_STATS);
    var tons = stats.tons;
\;
content = content.replace(/function openPanel\\(name, list\\) \\{[\\s\\S]*?var tons = list\\.reduce[^;]+;/m, openPanelTop);

let openPanelSort = \    function renderCards(projectsData) {
      window.currentRegionProjects = projectsData.map(function(p) { return p.id; });
      var container = document.getElementById('projectListContainer');
      if (container) {
        container.innerHTML = projectsData.map(function(p, index) {
          var delay = 0.15 + (index * 0.05);
          var imgSrc = (p.images && p.images[0]) ? '<img class="pc-img" loading="lazy" decoding="async" src="' + p.images[0] + '">' : '<div class="pc-img-placeholder"></div>';
          var catLabel = (p.category || 'MISC STEEL').toUpperCase();
          return '<div class="proj-card premium-card" data-id="' + p.id + '" style="animation-delay: ' + delay + 's;">' +
            imgSrc +
            '<div class="pc-content">' +
              '<div class="pc-eyebrow">' + catLabel + '</div>' +
              '<div class="pc-title">' + p.title + '</div>' +
              '<div class="pc-meta">' + p.type + '</div>' +
            '</div>' +
            '<div class="pc-arrow"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg></div>' +
          '</div>';
        }).join('');

        container.querySelectorAll('.proj-card').forEach(function(card) {
          card.addEventListener('click', function() {
            if (window.openDetail) window.openDetail(card.dataset.id);
          });
        });
      }
    }

    renderCards(list);

    var sortSelect = document.getElementById('projectSort');
    if (sortSelect) {
      sortSelect.addEventListener('change', function(e) {
        var mode = e.target.value;
        var container = document.getElementById('projectListContainer');
        if (container) container.innerHTML = '<div style="padding: 40px; text-align: center; color: #64748b; font-weight: 600;">Loading...</div>';
        
        if (typeof apiFetch === 'function') {
          apiFetch(\\\/projects?state=\\$\\{encodeURIComponent(name)\\}&country=\\$\\{window.currentCountry || 'us'\\}&category=\\$\\{window.currentCategory || 'All'\\}&sort=\\$\\{mode\\}&limit=100\\\)
            .then(res => { renderCards(res.projects || []); })
            .catch(err => { console.error("Sort failed", err); });
        }
      });
    }
  }

  document.getElementById('overlay').classList.add('open');
  document.getElementById('panel').classList.add('open');
  if (typeof updateAdminBtnVisibility === 'function') updateAdminBtnVisibility();
}\;

content = content.replace(/function renderCards\\(sortMode\\) \\{[\\s\\S]*?if \\(typeof updateAdminBtnVisibility === 'function'\\) updateAdminBtnVisibility\\(\\);\\n\\}/m, openPanelSort);
content = content.replace(/\\s*function sortList[\\s\\S]*?return sorted;\\n    \\}/m, '');

fs.writeFileSync('frontend/js/map.js', content, 'utf8');
