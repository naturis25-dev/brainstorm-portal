const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

const regex = /const cats = window\.CONFIG\?\.CATEGORIES \|\| \['All'\];\s*row\.innerHTML = cats\.map\(c =>\s*`<button class="cat-chip \$\{c === currentCategory \? 'active' : ''\}" data-cat="\$\{c\}">\$\{c\}<\/button>`\s*\)\.join\(''\);/g;

const newRender = `const cats = window.CONFIG?.CATEGORIES || ['All'];
  const oldSearch = document.getElementById('globalProjectSearch');
  const oldVal = oldSearch ? oldSearch.value : '';

  row.innerHTML = cats.map(c =>
    \`<button class="cat-chip \${c === currentCategory ? 'active' : ''}" data-cat="\${c}">\${c}</button>\`
  ).join('') + 
  \`<div class="inline-search-wrap" style="position: relative; flex: 1; min-width: 180px; height: 34px; margin-left: auto;">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--sub); pointer-events:none; opacity:0.45;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
    <input type="text" id="globalProjectSearch" placeholder="Search projects..." value="\${oldVal.replace(/"/g, '&quot;')}" style="padding: 0 36px 0 32px; width: 100%; height: 100%; background: var(--gray-50, #f8fafc); border: 1.5px solid var(--line); border-radius: 100px; font-size: 12px; font-weight: 500; color: var(--ink); outline: none; transition: border-color 0.2s, box-shadow 0.2s;">
    <button id="globalSearchBtn" title="Search" style="position:absolute; right:4px; top:50%; transform:translateY(-50%); background: var(--accent); color:#fff; border:none; border-radius:50%; width:26px; height:26px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition: background 0.2s;">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
    </button>
  </div>\`;`;

content = content.replace(regex, newRender);
fs.writeFileSync(p, content);
console.log("Updated renderCategoryChips to add inline search bar!");
