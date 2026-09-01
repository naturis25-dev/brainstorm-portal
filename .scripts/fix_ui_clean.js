const fs = require('fs');
let p = 'frontend/css/style.css';
let content = fs.readFileSync(p, 'utf8');

const cleanCSS = `
#projectListContainer {
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
  gap: 24px !important;
  padding: 10px 0 !important;
}

.proj-card.premium-card {
  display: flex !important;
  flex-direction: column !important;
  align-items: stretch !important;
  padding: 0 !important;
  gap: 0 !important;
  overflow: hidden !important;
  position: relative !important;
  height: 100% !important;
}

.proj-card.premium-card .pc-img {
  width: 100% !important;
  height: 180px !important;
  border-radius: 0 !important;
  object-fit: cover !important;
  margin: 0 !important;
}

.proj-card.premium-card .pc-img-placeholder {
  width: 100% !important;
  height: 180px !important;
  border-radius: 0 !important;
  margin: 0 !important;
}

.proj-card.premium-card .pc-content {
  padding: 20px !important;
  display: flex !important;
  flex-direction: column !important;
  flex-grow: 1 !important;
}

.proj-card.premium-card .pc-title {
  font-size: 15px !important;
  margin-bottom: 12px !important;
}

.proj-card.premium-card .pc-arrow {
  position: absolute !important;
  bottom: 20px !important;
  right: 20px !important;
  background: var(--gray-100);
  border-radius: 50%;
  padding: 6px;
}
`;
content = content + "\n" + cleanCSS;
fs.writeFileSync(p, content);
console.log("Appended clean CSS");
