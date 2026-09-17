# -*- coding: utf-8 -*-
import re

with open('css/style.css', 'r', encoding='utf-8') as f:
    c = f.read()

# Replace the breakout CSS for project-carousel-section
bad_css = """.project-carousel-section {
  position: relative;
  width: 100vw !important;
  max-width: 100vw !important;
  left: 50% !important;
  right: 50% !important;
  margin-left: -50vw !important;
  margin-right: -50vw !important;
  overflow: hidden !important;
  padding: 24px 0 10px;
  box-sizing: border-box !important;
}"""

good_css = """.project-carousel-section {
  position: relative;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  padding: 24px 0 10px;
  box-sizing: border-box;
}"""

if bad_css in c:
    c = c.replace(bad_css, good_css)
    print("Fixed breakout CSS")
else:
    # Try regex if exact string match fails due to spaces
    c = re.sub(r"\.project-carousel-section\s*\{[^}]*100vw[^}]*\}", good_css, c)
    print("Fixed breakout CSS via regex")

with open('css/style.css', 'w', encoding='utf-8') as f:
    f.write(c)
