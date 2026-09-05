const fs = require('fs');
let p = 'frontend/css/style.css';
let content = fs.readFileSync(p, 'utf8');

content = content.replace("body.dark-mode @keyframes logoPulse {", "@keyframes logoPulseDark {");

content = content + `
body.dark-mode .brand .logo-box {
  animation: logoPulseDark 3s infinite alternate;
}
`;

fs.writeFileSync(p, content);
console.log("Fixed dark mode keyframes syntax");
