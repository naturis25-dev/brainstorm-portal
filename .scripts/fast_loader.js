const fs = require('fs');
let p = 'frontend/index.html';
let content = fs.readFileSync(p, 'utf8');

// Reduce MIN_LOAD_TIME from 2500 to 1200
content = content.replace(/const MIN_LOAD_TIME = 2500;/, "const MIN_LOAD_TIME = 1200;");

// Revert progress percentage speed to be snappy again
content = content.replace(/80\);/g, "1400 / 30);");
content = content.replace(/Math\.floor\(Math\.random\(\) \* 4\) \+ 1/g, "Math.floor(Math.random() * 5) + 2");

content = content.replace(/v=\d+/g, "v=" + Date.now());

fs.writeFileSync(p, content);
console.log("Reduced loader time to 1.2s");
