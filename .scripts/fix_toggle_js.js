const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

const regex = /function initThemeToggle\(\) \{\s*const btn = document\.getElementById\('dntToggle'\);\s*if \(!btn\) return;/;

const replacement = `function initThemeToggle() {
  const btn = document.getElementById('dntToggle');
  if (!btn) return;
  
  // Detach from topbar on mobile to avoid backdrop-filter containing block bug
  if (window.innerWidth <= 768) {
    document.body.appendChild(btn);
  }
  
  // Handle resize dynamically
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 768 && btn.parentElement !== document.body) {
      document.body.appendChild(btn);
    } else if (window.innerWidth > 768 && btn.parentElement === document.body) {
      document.querySelector('.top-actions').appendChild(btn);
    }
  });`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(p, content);
  console.log("Successfully replaced DOM detachment logic");
} else {
  console.log("Regex did not match!");
}
