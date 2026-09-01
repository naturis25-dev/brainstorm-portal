const fs = require('fs');
let p = 'frontend/css/style.css';
let content = fs.readFileSync(p, 'utf8');

const additionalCSS = `
/* 16th Anniversary Logo Animations */
.brand .logo-box {
  animation: logoPulse 3s infinite alternate;
}
.brand:hover .logo-box {
  animation: logoHoverSpin 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes logoPulse {
  0% { box-shadow: 0 0 0 0 rgba(220, 20, 60, 0); transform: translateY(0); }
  100% { box-shadow: 0 4px 15px rgba(220, 20, 60, 0.3); transform: translateY(-2px); }
}

@keyframes logoHoverSpin {
  0% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.1) rotate(10deg); }
  100% { transform: scale(1.05) rotate(-4deg); border-color: var(--accent); }
}

body.dark-mode @keyframes logoPulse {
  0% { box-shadow: 0 0 0 0 rgba(220, 20, 60, 0); transform: translateY(0); }
  100% { box-shadow: 0 4px 20px rgba(220, 20, 60, 0.5); transform: translateY(-2px); }
}
`;

content = content + "\n" + additionalCSS;
fs.writeFileSync(p, content);
console.log("Added topbar logo animations");
