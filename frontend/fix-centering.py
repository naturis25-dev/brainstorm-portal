# -*- coding: utf-8 -*-
with open('css/style.css', 'r', encoding='utf-8') as f:
    c = f.read()

import re

# Update full-bleed-carousel CSS for perfect mathematical screen centering
bad_fbc = """/* Full Bleed Carousel for Project Gallery */
.full-bleed-carousel {
  width: 100vw !important;
  position: relative !important;
  left: 50% !important;
  right: 50% !important;
  margin-left: -50vw !important;
  margin-right: -50vw !important;
  padding: 24px 0 10px;
  overflow: hidden !important;
}"""

good_fbc = """/* Full Bleed Carousel for Project Gallery */
.full-bleed-carousel {
  width: 100vw !important;
  position: relative !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  padding: 24px 0 10px;
  overflow: hidden !important;
}"""

if bad_fbc in c:
    c = c.replace(bad_fbc, good_fbc)
else:
    c = re.sub(r'\.full-bleed-carousel\s*\{[^}]*\}', good_fbc, c)

# Replace the oversized translateX offsets in min-width 1200px query
c = re.sub(r'\.carousel-card\.prev-1,\s*\.featured-card\.prev-1\s*\{\s*transform:\s*translateX\(-260px\)[^}]*\}', '.carousel-card.prev-1, .featured-card.prev-1 { transform: translateX(-190px) scale(0.92) !important; }', c)
c = re.sub(r'\.carousel-card\.next-1,\s*\.featured-card\.next-1\s*\{\s*transform:\s*translateX\(260px\)[^}]*\}', '.carousel-card.next-1, .featured-card.next-1 { transform: translateX(190px) scale(0.92) !important; }', c)
c = re.sub(r'\.carousel-card\.prev-2,\s*\.featured-card\.prev-2\s*\{\s*transform:\s*translateX\(-490px\)[^}]*\}', '.carousel-card.prev-2, .featured-card.prev-2 { transform: translateX(-360px) scale(0.82) !important; }', c)
c = re.sub(r'\.carousel-card\.next-2,\s*\.featured-card\.next-2\s*\{\s*transform:\s*translateX\(490px\)[^}]*\}', '.carousel-card.next-2, .featured-card.next-2 { transform: translateX(360px) scale(0.82) !important; }', c)
c = re.sub(r'\.carousel-card\.prev-3,\s*\.featured-card\.prev-3\s*\{\s*transform:\s*translateX\(-710px\)[^}]*\}', '.carousel-card.prev-3, .featured-card.prev-3 { transform: translateX(-510px) scale(0.72) !important; }', c)
c = re.sub(r'\.carousel-card\.next-3,\s*\.featured-card\.next-3\s*\{\s*transform:\s*translateX\(710px\)[^}]*\}', '.carousel-card.next-3, .featured-card.next-3 { transform: translateX(510px) scale(0.72) !important; }', c)

# Also update base default rules
c = c.replace('transform: translateX(-240px) scale(0.92);', 'transform: translateX(-190px) scale(0.92);')
c = c.replace('transform: translateX(240px) scale(0.92);', 'transform: translateX(190px) scale(0.92);')
c = c.replace('transform: translateX(-460px) scale(0.82);', 'transform: translateX(-360px) scale(0.82);')
c = c.replace('transform: translateX(460px) scale(0.82);', 'transform: translateX(360px) scale(0.82);')
c = c.replace('transform: translateX(-670px) scale(0.72);', 'transform: translateX(-510px) scale(0.72);')
c = c.replace('transform: translateX(670px) scale(0.72);', 'transform: translateX(510px) scale(0.72);')

with open('css/style.css', 'w', encoding='utf-8') as f:
    f.write(c)

print("Carousel positioning and transform offsets updated!")
