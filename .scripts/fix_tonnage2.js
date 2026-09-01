const fs = require('fs');
const p = 'frontend/js/map.js';
let content = fs.readFileSync(p, 'utf8');

const oldSub = `'<div class="pc-meta">' + p.type + '</div>' +`;
const newSub = `'<div class="pc-meta" style="display:flex; align-items:center; flex-wrap:wrap; gap:8px;">' + 
                  '<span>' + (p.type || catLabel) + '</span>' +
                  (p.tons ? '<span style="font-weight:800; color:var(--accent); background:#f0f9ff; padding:2px 6px; border-radius:4px; font-size:10px; border: 1px solid #bae6fd; letter-spacing:0.5px;">' + Math.round(p.tons).toLocaleString() + ' TONS</span>' : '') +
                '</div>' +`;

content = content.replace(oldSub, newSub);

fs.writeFileSync(p, content);
console.log("Added tonnage badge to pc-meta!");
