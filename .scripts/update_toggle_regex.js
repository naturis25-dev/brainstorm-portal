const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

// Use regex to find the .min-btn event listener block
const regex = /document\.querySelectorAll\('\.min-btn'\)\.forEach\(btn => \{[\s\S]*?btn\.addEventListener\('click', \(\) => \{[\s\S]*?refreshMapStats\(\);\s*closePanel\(\);\s*\}\);\s*\}\);/;

const replacement = `document.querySelectorAll('.min-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('active')) return;
      
      const svg = document.getElementById('map');
      if(svg) svg.classList.add('fade-out');
      
      setTimeout(() => {
        document.querySelectorAll('.min-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCountry = btn.dataset.country;
        
        var minSlider = document.getElementById('minSlider');
        var heroPill = document.getElementById('heroPill');
        var heroHighlight = document.getElementById('heroCountryHighlight');
        
        if (currentCountry === 'ca' || currentCountry === 'Canada') {
          if (minSlider) minSlider.classList.add('ca');
          if (heroPill) { heroPill.classList.remove('usa'); heroPill.classList.add('ca'); }
          if (heroHighlight) heroHighlight.className = 'highlight-ca';
        } else {
          if (minSlider) minSlider.classList.remove('ca');
          if (heroPill) { heroPill.classList.remove('ca'); heroPill.classList.add('usa'); }
          if (heroHighlight) heroHighlight.className = 'highlight-usa';
        }
        
        refreshMapStats();
        closePanel();
        
        if(svg) svg.classList.remove('fade-out');
      }, 250);
    });
  });`;

content = content.replace(regex, replacement);
fs.writeFileSync(p, content);
console.log("Replaced country toggle logic with regex");
