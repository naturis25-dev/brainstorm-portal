import re

with open('frontend/js/map.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. projectsForState
content = re.sub(
    r'function projectsForState\(name, projectsList, categoryFilter\) \{[\s\S]*?\n\}',
    '''function projectsForState(name, stats) {
  if (!stats || !stats.regions) return { count: 0, tons: 0 };
  return stats.regions[name] || { count: 0, tons: 0 };
}''',
    content
)

# 2. drawMap
content = content.replace('function drawMap(projectsList, categoryFilter, countryFilter) {', 'function drawMap(stats, categoryFilter, countryFilter) {')
content = content.replace('var c = projectsForState(name, projectsList, category).length;', 'var c = projectsForState(name, stats).count;')
content = content.replace('handleHover(event, d, projectsList, category)', 'handleHover(event, d, stats)')
content = content.replace('handleClick(event, d, projectsList, category)', 'handleClick(event, d, stats)')
content = content.replace('renderStats(projectsList, country, category)', 'renderStats(stats, country)')

# 3. handleHover
content = re.sub(
    r'function handleHover\(event, d, projectsList, category\) \{[\s\S]*?var list\s*=\s*projectsForState\(name, projectsList, category\);[\s\S]*?var tons\s*=\s*list\.reduce[^;]+;',
    '''function handleHover(event, d, stats) {
  var tooltip = d3.select('#tooltip');
  var name    = d.properties.name;
  var stateStats = projectsForState(name, stats);
  var tons    = stateStats.tons;
  
  if (stateStats.count === 0) {''',
    content
)

# 4. handleClick
handle_click_code = '''function handleClick(event, d, stats) {
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
  var html = '<div class="burst-pin" style="left:' + x + 'px; top:' + y + 'px;"></div>';
  burst.innerHTML = html;
  mapCardElement.appendChild(burst);

  requestAnimationFrame(() => { burst.classList.add('active'); });

  if (typeof apiFetch === 'function') {
    apiFetch(/projects?state=&country=&category=&sort=key&limit=50)
      .then(res => {
        var list = res.projects || [];
        var topProjects = list.slice(0, 3);
        var angles = [-Math.PI/2, Math.PI/6, 5*Math.PI/6];
        var radius = 90;

        topProjects.forEach(function(p, i) {
          var px = x + Math.cos(angles[i]) * radius;
          var py = y + Math.sin(angles[i]) * radius;
          var imgSrc = (p.images && p.images[0]) ? p.images[0] : 'assets/placeholder.jpg';
          var cat = p.category || 'Industrial';
          var delay = i * 0.15;
          html += <div class="burst-thumb" style="left:px; top:px; animation-delay:s;"><img loading="lazy" decoding="async" src=""><div class="bt-label"></div></div>;
        });
        burst.innerHTML = html;

        setTimeout(function() {
          burst.classList.add('dismiss');
          setTimeout(function() { burst.remove(); }, 300);
          if (typeof openPanel === 'function') openPanel(name, list);
        }, 1400);
      })
      .catch(err => {
        console.error("Failed to load projects", err);
        burst.remove();
        if (typeof openPanel === 'function') openPanel(name, []);
      });
  }
}
'''
content = re.sub(
    r'function handleClick\(event, d, projectsList, category\) \{[\s\S]*?\}\s*function renderStats',
    handle_click_code + '\\nfunction renderStats',
    content
)

# 5. renderStats
render_stats_top = '''function renderStats(stats, country) {
  var statsRow = document.getElementById('statsRow');
  if (!statsRow) return;

  var statesCovered = stats.statesCovered || 0;
  var unitLabel = country === 'us' ? 'states' : 'provinces';
'''
content = re.sub(
    r'function renderStats\(projectsList, country, category\) \{[\s\S]*?var unitLabel = country === \'us\' \? \'states\' : \'provinces\';',
    render_stats_top,
    content
)
content = content.replace('relevant.length', '(stats.totalProjects || 0)')
content = re.sub(r'relevant\.reduce\([^)]+\)', '(stats.totalTons || 0)', content)

# 6. openPanel
# We need to change the UI injection for openPanel, and specifically the sort/render logic.
open_panel_top = '''function openPanel(name, list) {
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
    var stateStats = projectsForState(name, window.PROJECT_STATS);
    var tons = stateStats.tons;
    var pCount = stateStats.count;
'''
content = re.sub(
    r'function openPanel\(name, list\) \{[\s\S]*?var tons = list\.reduce[^;]+;',
    open_panel_top,
    content
)

# Replace list.length with pCount in openPanel stats rendering
content = re.sub(
    r'\'<div class="n" style="font-size:24px; font-weight:900;">\' \+ list\.length \+ \'</div>',
    '\'<div class="n" style="font-size:24px; font-weight:900;">\' + pCount + \'</div>',
    content
)

# Remove sortList
content = re.sub(r'\s*// Sort logic\s*function sortList\(sortMode\) \{[\s\S]*?return sorted;\n    \}', '', content)

# Rewrite renderCards logic
render_cards_code = '''    function renderCards(projectsData) {
      window.PROJECTS = projectsData;
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
          apiFetch(/projects?state=&country=&category=&sort=&limit=100)
            .then(res => { renderCards(res.projects || []); })
            .catch(err => { console.error("Sort failed", err); });
        }
      });
    }
  }

  document.getElementById('overlay').classList.add('open');
  document.getElementById('panel').classList.add('open');
  if (typeof updateAdminBtnVisibility === 'function') updateAdminBtnVisibility();
}
'''

content = re.sub(
    r'function renderCards\(sortMode\) \{[\s\S]*?if \(typeof updateAdminBtnVisibility === \'function\'\) updateAdminBtnVisibility\(\);\n\}',
    render_cards_code,
    content
)

with open('frontend/js/map.js', 'w', encoding='utf-8') as f:
    f.write(content)
