const fs = require('fs');
let p = 'frontend/index.html';
let content = fs.readFileSync(p, 'utf8');

const loaderCss = `
    .floating-logo {
      animation: logoFloat 3s ease-in-out infinite;
    }
    @keyframes logoFloat {
      0% { transform: scale(1) translateY(0); filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1)); }
      50% { transform: scale(1.03) translateY(-6px); filter: drop-shadow(0 12px 20px rgba(220,20,60,0.35)); }
      100% { transform: scale(1) translateY(0); filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1)); }
    }
`;

content = content.replace("/* ================= LOADER ================= */", "/* ================= LOADER ================= */\n" + loaderCss);

const onfinishTarget = `fill: "forwards" }
          ).onfinish = () => {`;
const onfinishReplacement = `fill: "forwards" }
          ).onfinish = () => {
            logo.classList.add("floating-logo");`;

content = content.replace(onfinishTarget, onfinishReplacement);
content = content.replace(/v=\d+/g, "v=" + Date.now());

fs.writeFileSync(p, content);
console.log("Added loader logo animation");
