const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

// Update popup animation
content = content.replace(
  "popup.style.animation = 'viewFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)';",
  "popup.style.animation = 'popupFadeScale 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards';"
);

// Increase modal width
content = content.replace("popup.style.maxWidth = '650px';", "popup.style.maxWidth = '800px';");
content = content.replace("popup.style.width = '90%';", "popup.style.width = '85%';");

// Increase padding of row to make it taller
content = content.replace(
  "padding:12px; background:${rowBg}",
  "padding:16px 20px; background:${rowBg}"
);

// Increase thumbnail size from 56px to 72px
content = content.replace(
  "width:56px; height:56px; border-radius:12px;",
  "width:72px; height:72px; border-radius:14px;"
);

// Increase font sizes slightly
content = content.replace("font-size:15px; margin-bottom:6px;", "font-size:18px; margin-bottom:8px;"); // title
content = content.replace("font-size:12px; color:var(--sub); display:flex; align-items:center; gap:12px; font-weight:500;", "font-size:14px; color:var(--sub); display:flex; align-items:center; gap:16px; font-weight:500;"); // subtitle
content = content.replace("padding:2px 8px; border-radius:100px;", "padding:4px 10px; border-radius:100px;"); // category badge
content = content.replace("font-size:10.5px; text-transform:uppercase;", "font-size:11px; text-transform:uppercase; font-weight:700;"); // category text
content = content.replace("font-size:16px; letter-spacing:-0.5px;", "font-size:22px; letter-spacing:-0.5px;"); // tons

fs.writeFileSync(p, content);
console.log("Made popup bigger and fixed animation");
