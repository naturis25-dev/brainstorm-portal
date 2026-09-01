const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

const regex = /popup = document\.createElement\('div'\);[\s\S]*?popup\.innerHTML = resultsHtml;/;

const newPopup = `popup = document.createElement('div');
          popup.id = 'searchResultsPopup';
          popup.style.position = 'fixed';
          popup.style.top = '120px';
          popup.style.left = '50%';
          popup.style.transform = 'translateX(-50%)';
          popup.style.width = '90%';
          popup.style.maxWidth = '650px';
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
          popup.style.animation = 'viewFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
          document.body.appendChild(popup);
        }

        let isDark = document.body.classList.contains('dark-mode');
        let headerBg = isDark ? 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(0,0,0,0))' : 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(255,255,255,0))';
        let rowBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.6)';
        let rowHoverBg = isDark ? 'rgba(37,99,235,0.15)' : 'rgba(255,255,255,1)';
        let borderColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

        let resultsHtml = \`<div style="padding: 20px 24px; border-bottom: 1px solid \${borderColor}; display: flex; justify-content: space-between; align-items: center; background: \${headerBg};">
            <div style="display:flex; align-items:center; gap:12px;">
              <div style="background:var(--accent); color:#fff; width:32px; height:32px; border-radius:10px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(37,99,235,0.4);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <div>
                <h3 style="margin:0; font-size:18px; font-weight:800; color:var(--ink); letter-spacing:-0.3px;">Search Results</h3>
                <div style="font-size:12px; color:var(--sub); font-weight:500; margin-top:2px;">Found \${filtered.length} matches for "\${q}"</div>
              </div>
            </div>
            <button onclick="document.getElementById('searchResultsPopup').remove()" style="background:var(--bg-alt); border:1px solid var(--line); border-radius:50%; cursor:pointer; color:var(--sub); width:32px; height:32px; display:flex; align-items:center; justify-content:center; transition:all 0.2s; box-shadow:0 2px 8px rgba(0,0,0,0.05);" onmouseover="this.style.background='var(--accent)'; this.style.color='#fff'; this.style.transform='rotate(90deg)'" onmouseout="this.style.background='var(--bg-alt)'; this.style.color='var(--sub)'; this.style.transform='none'">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>
        <div style="overflow-y:auto; padding: 16px; display:flex; flex-direction:column; gap:12px;">\`;

        if (filtered.length === 0) {
            resultsHtml += \`<div style="padding: 40px; text-align: center; color: var(--sub);">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="opacity:0.3; margin-bottom:16px;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <div style="font-size:16px; font-weight:600;">No projects found</div>
              <div style="font-size:13px; margin-top:4px;">Try adjusting your search terms</div>
            </div>\`;
        } else {
            filtered.forEach((p, idx) => {
                let imgUrl = (p.images && p.images.length > 0) ? \`/uploads/\${p.images[0]}\` : 'assets/logo.png';
                let animDelay = idx * 0.05;
                resultsHtml += \`<div onclick="document.getElementById('searchResultsPopup').remove(); openDetail('\${p.id}')" style="display:flex; align-items:center; justify-content:space-between; padding:12px; background:\${rowBg}; border:1px solid \${borderColor}; border-radius:16px; cursor:pointer; transition:all 0.3s cubic-bezier(0.16, 1, 0.3, 1); animation: viewFadeIn 0.4s ease backwards \${animDelay}s;" onmouseover="this.style.background='\${rowHoverBg}'; this.style.transform='translateY(-2px) scale(1.01)'; this.style.boxShadow='0 12px 24px rgba(0,0,0,0.08)'" onmouseout="this.style.background='\${rowBg}'; this.style.transform='none'; this.style.boxShadow='none'">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <div style="width:56px; height:56px; border-radius:12px; overflow:hidden; background:var(--bg-alt); flex-shrink:0; border:1px solid \${borderColor};">
                          <img src="\${imgUrl}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='assets/logo.png'; this.style.objectFit='contain'; this.style.padding='8px';">
                        </div>
                        <div>
                            <div style="font-weight:800; color:var(--ink); font-size:15px; margin-bottom:6px; letter-spacing:-0.2px;">\${p.title}</div>
                            <div style="font-size:12px; color:var(--sub); display:flex; align-items:center; gap:12px; font-weight:500;">
                                <span style="display:flex; align-items:center; gap:4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>\${p.state}</span>
                                <span style="background:var(--bg-alt); padding:2px 8px; border-radius:100px; border:1px solid var(--line); font-size:10.5px; text-transform:uppercase; letter-spacing:0.5px;">\${p.category}</span>
                            </div>
                        </div>
                    </div>
                    <div style="text-align:right; padding-right:8px;">
                      <div style="font-weight:800; color:var(--accent); font-size:16px; letter-spacing:-0.5px;">\${(p.tons || 0).toLocaleString()} <span style="font-size:11px; opacity:0.7;">TONS</span></div>
                    </div>
                </div>\`;
            });
        }
        resultsHtml += \`</div>\`;
        popup.innerHTML = resultsHtml;`;

content = content.replace(regex, newPopup);
fs.writeFileSync(p, content);
console.log("Updated search popup UI to premium version!");
