# -*- coding: utf-8 -*-
with open('css/style.css', 'r', encoding='utf-8') as f:
    c = f.read()

css = """
/* Full Bleed Carousel for Project Gallery */
.full-bleed-carousel {
  width: 100vw !important;
  position: relative !important;
  left: 50% !important;
  right: 50% !important;
  margin-left: -50vw !important;
  margin-right: -50vw !important;
  padding: 24px 0 10px;
  overflow: hidden !important;
}
"""
c += css

with open('css/style.css', 'w', encoding='utf-8') as f:
    f.write(c)

print('Added full-bleed-carousel CSS')
