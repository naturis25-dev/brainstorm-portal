const fs = require('fs');
const p = 'frontend/index.html';
let content = fs.readFileSync(p, 'utf8');

const oldStructure = `
      <!-- Minimal Country Filter Toggle (US / CA) -->
      <div style="display: flex; justify-content: center;">
          <div class="minimal-toggle" id="countryToggle">
            <div class="min-slider" id="minSlider"></div>
            <button class="min-btn active" data-country="us">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M 4 7 L 12 7 L 13 9 L 15 8 L 17 7 L 20 6 L 21 9 L 19 13 L 19 18 L 17 17 L 15 14 L 13 14 L 11 18 L 9 17 L 7 13 L 4 13 L 3 9 Z"></path></svg>
              United States
            </button>
            <button class="min-btn" data-country="ca">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M 4 17 L 12 17 L 13 19 L 15 18 L 17 17 L 20 16 L 22 15 L 22 11 L 19 8 L 16 10 L 13 10 L 12 6 L 6 5 L 4 5 L 4 11 L 2 14 Z"></path></svg>
              Canada
            </button>
          </div>
      </div>

      <!-- Category Filter Chips -->
      <div class="chip-row" id="categoryChipRow"></div>
`;

// It might be formatted slightly differently, let's use a regex replace
const regex = /<!-- Minimal Country Filter Toggle[\s\S]*?id="categoryChipRow"><\/div>/;

const newStructure = `
      <!-- Global Map Controls Bar -->
      <div class="map-controls-bar" style="max-width: 1100px; margin: 0 auto 24px; display: flex; flex-direction: column; gap: 16px; padding: 0 20px;">
        
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <!-- Country Toggle -->
          <div class="minimal-toggle" id="countryToggle" style="margin: 0;">
            <div class="min-slider" id="minSlider"></div>
            <button class="min-btn active" data-country="us">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M 4 7 L 12 7 L 13 9 L 15 8 L 17 7 L 20 6 L 21 9 L 19 13 L 19 18 L 17 17 L 15 14 L 13 14 L 11 18 L 9 17 L 7 13 L 4 13 L 3 9 Z"></path></svg>
              United States
            </button>
            <button class="min-btn" data-country="ca">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M 4 17 L 12 17 L 13 19 L 15 18 L 17 17 L 20 16 L 22 15 L 22 11 L 19 8 L 16 10 L 13 10 L 12 6 L 6 5 L 4 5 L 4 11 L 2 14 Z"></path></svg>
              Canada
            </button>
          </div>

          <!-- Global Project Search -->
          <div class="field global-search" style="position: relative; flex: 1; max-width: 400px; margin: 0; min-width: 250px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="position:absolute; left:16px; top:50%; transform:translateY(-50%); color:var(--sub); pointer-events:none;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" id="globalProjectSearch" placeholder="Search map projects..." style="padding-left: 44px; width: 100%; background: var(--bg); border: 1px solid var(--line); border-radius: 12px; height: 44px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); transition: border-color 0.2s, box-shadow 0.2s; font-size: 14px;">
          </div>
        </div>

        <!-- Category Filter Chips -->
        <div class="chip-row" id="categoryChipRow" style="justify-content: flex-start; margin: 0; padding-bottom: 8px; overflow-x: auto;"></div>

      </div>
`;

content = content.replace(regex, newStructure);

fs.writeFileSync(p, content);
console.log("Updated filter UI layout in index.html!");
