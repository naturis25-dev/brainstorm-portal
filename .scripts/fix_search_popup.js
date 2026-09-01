const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

const regex = /function executeSearch\(\) \{[\s\S]*?if \(window\.MapModule\) \{\s*window\.MapModule\.drawMap\(filtered, currentCategory, currentCountry\);\s*\}/;

const newExecuteSearch = `function executeSearch() {
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
          popup.style.top = '140px';
          popup.style.left = '50%';
          popup.style.transform = 'translateX(-50%)';
          popup.style.width = '90%';
          popup.style.maxWidth = '600px';
          popup.style.maxHeight = '60vh';
          popup.style.background = 'var(--bg)';
          popup.style.border = '1px solid var(--line)';
          popup.style.borderRadius = '16px';
          popup.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)';
          popup.style.zIndex = '9999';
          popup.style.display = 'flex';
          popup.style.flexDirection = 'column';
          popup.style.overflow = 'hidden';
          popup.style.animation = 'viewFadeIn 0.3s ease-out';
          document.body.appendChild(popup);
        }

        let resultsHtml = \`<div style="padding: 16px 20px; border-bottom: 1px solid var(--line); display: flex; justify-content: space-between; align-items: center; background: var(--bg-alt);">
            <h3 style="margin:0; font-size:16px; font-weight:700;">Search Results (\${filtered.length})</h3>
            <button onclick="document.getElementById('searchResultsPopup').remove()" style="background:none; border:none; cursor:pointer; color:var(--sub); padding:4px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
        </div>
        <div style="overflow-y:auto; padding: 12px; background: var(--bg);">\`;

        if (filtered.length === 0) {
            resultsHtml += \`<div style="padding: 30px; text-align: center; color: var(--sub);">No projects found matching "\${q}"</div>\`;
        } else {
            resultsHtml += \`<div style="display: flex; flex-direction: column; gap: 8px;">\`;
            filtered.forEach(p => {
                resultsHtml += \`<div onclick="document.getElementById('searchResultsPopup').remove(); openDetail('\${p.id}')" style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; background:var(--bg-alt); border:1px solid var(--line); border-radius:12px; cursor:pointer; transition:all 0.2s;" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--line)'">
                    <div>
                        <div style="font-weight:700; color:var(--ink); font-size:14px; margin-bottom:4px;">\${p.title}</div>
                        <div style="font-size:12px; color:var(--sub); display:flex; gap:12px;">
                            <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px; vertical-align:-2px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>\${p.state}</span>
                            <span>\${p.category}</span>
                        </div>
                    </div>
                    <div style="font-weight:800; color:var(--accent); font-size:14px;">\${(p.tons || 0).toLocaleString()} <span style="font-size:10px;">T</span></div>
                </div>\`;
            });
            resultsHtml += \`</div>\`;
        }
        resultsHtml += \`</div>\`;
        popup.innerHTML = resultsHtml;
    `;

content = content.replace(regex, newExecuteSearch);
fs.writeFileSync(p, content);
console.log("Added search results popup window!");
