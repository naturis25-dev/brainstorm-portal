map_js_path = 'frontend/js/map.js'
with open(map_js_path, 'r', encoding='utf-8') as f:
    map_js = f.read()

# Enhance loadMapData with robust relative path fallbacks and auto-execution
old_load_map = '''function loadMapData(onReady) {
  if (usFeatures && usFeatures.length && caFeatures && caFeatures.length) {
    if (onReady) onReady();
    return;
  }
  var tryLoad = function(path) {
    return d3.json(path).catch(function() {
      return d3.json('/' + path);
    });
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
}'''

new_load_map = '''function loadMapData(onReady) {
  if (usFeatures && usFeatures.length && caFeatures && caFeatures.length) {
    if (onReady) onReady();
    return;
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
  if (window.MapModule && window.drawMap) {
    window.MapModule.drawMap(window.PROJECTS || [], window.currentCategory || 'All', window.currentCountry || 'us');
  }
});'''

if old_load_map in map_js:
    map_js = map_js.replace(old_load_map, new_load_map)
    with open(map_js_path, 'w', encoding='utf-8') as f:
        f.write(map_js)
    print('Updated loadMapData in map.js!')
else:
    print('Target old_load_map not found.')
