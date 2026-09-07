const fs = require('fs');
let p = 'frontend/index.html';
let content = fs.readFileSync(p, 'utf8');

const regex = /<svg viewBox="0 0 280 80" aria-hidden="true">[\s\S]*?<\/svg>\s*<svg viewBox="0 0 280 80" aria-hidden="true">[\s\S]*?<\/svg>/;

const single = `<svg viewBox="0 0 280 80" aria-hidden="true">
      <path
        class="ldr-line"
        d="M10 40
           C35 15, 60 65, 85 40
           S135 15, 160 40
           S235 15, 270 40"
      />
    </svg>`;

if (regex.test(content)) {
  content = content.replace(regex, single);
  content = content.replace(/v=\d+/g, "v=" + Date.now());
  fs.writeFileSync(p, content);
  console.log("Removed duplicate SVG");
} else {
  console.log("No duplicates found");
}
