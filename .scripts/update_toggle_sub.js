const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

const searchStr = `  document.querySelectorAll('.min-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.min-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCountry = btn.dataset.country;`;

const replacement = `  document.querySelectorAll('.min-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('active')) return;
      const svg = document.getElementById('map');
      if(svg) svg.classList.add('fade-out');
      setTimeout(() => {
        document.querySelectorAll('.min-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCountry = btn.dataset.country;`;

const postSearchStr = `      refreshMapStats();
      closePanel();
    });
  });`;

const postReplacement = `      refreshMapStats();
      closePanel();
      if(svg) svg.classList.remove('fade-out');
      }, 250);
    });
  });`;

content = content.replace(searchStr, replacement);
content = content.replace(postSearchStr, postReplacement);

fs.writeFileSync(p, content);
console.log("Substrings replaced!");
