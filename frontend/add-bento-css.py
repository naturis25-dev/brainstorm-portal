# -*- coding: utf-8 -*-
with open('css/style.css', 'r', encoding='utf-8') as f:
    c = f.read()

bento_css = """
/* Bento Box Dashboard Grid */
.bento-dashboard-grid {
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  grid-template-rows: auto auto;
  gap: 24px;
}

.bento-card {
  background: var(--bg);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03);
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}

body.dark-mode .bento-card {
  background: var(--card-bg, #111214);
  border-color: rgba(255, 255, 255, 0.08);
}

.bento-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 48px -12px rgba(0, 0, 0, 0.1);
}

.bento-overview-card {
  grid-row: span 2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.bento-specs-card {
  grid-column: 2;
  grid-row: 1;
}

.bento-scope-card {
  grid-column: 2;
  grid-row: 2;
}

@media (max-width: 992px) {
  .bento-dashboard-grid {
    grid-template-columns: 1fr !important;
    grid-template-rows: auto !important;
  }
  .bento-overview-card {
    grid-row: auto !important;
  }
  .bento-specs-card, .bento-scope-card {
    grid-column: auto !important;
    grid-row: auto !important;
  }
}
"""

c += bento_css

with open('css/style.css', 'w', encoding='utf-8') as f:
    f.write(c)

print("Bento CSS added!")
