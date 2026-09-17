# -*- coding: utf-8 -*-
with open('css/style.css', 'r', encoding='utf-8') as f:
    c = f.read()

import re

# Remove old subnav styles
c = re.sub(r'\.detail-subnav-bar\s*\{[^}]*\}', '', c)
c = re.sub(r'body\.dark-mode\s*\.detail-subnav-bar\s*\{[^}]*\}', '', c)
c = re.sub(r'\.d-tab\s*\{[^}]*\}', '', c)
c = re.sub(r'\.d-tab:hover\s*\{[^}]*\}', '', c)
c = re.sub(r'body\.dark-mode\s*\.d-tab:hover\s*\{[^}]*\}', '', c)
c = re.sub(r'\.d-tab\.active\s*\{[^}]*\}', '', c)
c = re.sub(r'body\.dark-mode\s*\.d-tab\.active\s*\{[^}]*\}', '', c)

new_subnav_css = """
/* Centered, Interactive Sub-Nav Bar with Dynamic Region Theme Support (Blue / Red) */
.detail-subnav-bar {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  gap: 8px !important;
  padding: 8px 12px !important;
  background: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  border-radius: 100px !important;
  margin: 0 auto 32px auto !important;
  max-width: fit-content !important;
  overflow-x: auto !important;
  position: sticky !important;
  top: 16px !important;
  z-index: 50 !important;
  box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.08) !important;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) !important;
}

body.dark-mode .detail-subnav-bar {
  background: rgba(18, 20, 24, 0.85) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.4) !important;
}

.d-tab {
  background: transparent !important;
  border: none !important;
  padding: 8px 18px !important;
  font-size: 13.5px !important;
  font-weight: 700 !important;
  color: var(--sub, #64748b) !important;
  border-radius: 100px !important;
  cursor: pointer !important;
  transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1) !important;
  white-space: nowrap !important;
  position: relative !important;
  user-select: none !important;
}

.d-tab:hover {
  transform: translateY(-1px) scale(1.02) !important;
}

/* Default US Theme (Blue Accent) */
body:not(.theme-ca) .d-tab:hover {
  background: rgba(37, 99, 235, 0.08) !important;
  color: #2563eb !important;
}

body:not(.theme-ca) .d-tab.active {
  background: #2563eb !important;
  color: #ffffff !important;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35) !important;
  transform: scale(1.03) !important;
}

/* Canada Region Theme (Red Accent) */
body.theme-ca .d-tab:hover {
  background: rgba(220, 38, 38, 0.08) !important;
  color: #dc2626 !important;
}

body.theme-ca .d-tab.active {
  background: #dc2626 !important;
  color: #ffffff !important;
  box-shadow: 0 4px 14px rgba(220, 38, 38, 0.35) !important;
  transform: scale(1.03) !important;
}
"""

c += new_subnav_css

with open('css/style.css', 'w', encoding='utf-8') as f:
    f.write(c)

print("Sub-nav theme and centering CSS applied!")
