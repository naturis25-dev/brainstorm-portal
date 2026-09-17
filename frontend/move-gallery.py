# -*- coding: utf-8 -*-
with open('js/app.js', 'r', encoding='utf-8') as f:
    c = f.read()

import re

# Find the gallery section
gallery_match = re.search(r'(          <!-- Project Views Image 2 Horizontal Slider Section -->\s*\$\{p\.images && p\.images\.length > 0 \? `\s*<div class="detail-card-block" id="sec-gallery-\$\{p\.id\}">[\s\S]*?` : \'\'\}\s*)        </div>\s*<!-- Right Column', c)

if gallery_match:
    gallery_code = gallery_match.group(1)
    # Remove it from its current position
    c = c.replace(gallery_code, '')
    
    # Modify the gallery code to remove the card block wrapper and center the title
    modified_gallery = gallery_code.replace('<div class="detail-card-block" id="sec-gallery-${p.id}">', '<div id="sec-gallery-${p.id}" style="margin-top: 48px; margin-bottom: 48px; text-align: center;">')
    modified_gallery = modified_gallery.replace('<div class="dcard-header" style="margin-bottom: 16px;">', '<div style="margin-bottom: 32px;">')
    modified_gallery = modified_gallery.replace('<h3 class="dcard-title">Project Views</h3>', '<h2 style="font-size: 32px; font-weight: 800; letter-spacing: -1px; margin-bottom: 8px; font-family: \'Playfair Display\', serif;">Project Gallery</h2>')
    modified_gallery = modified_gallery.replace('<span class="dcard-badge-count">${p.images.length} Views</span>', '<div style="color: var(--sub); font-size: 15px;">Explore ${p.images.length} high-resolution views of this structure.</div>')
    
    # Also remove the inline styles that break 100vw
    modified_gallery = modified_gallery.replace('style="margin: 0; width: 100% !important; max-width: 100% !important; left: auto !important; margin-left: 0 !important; margin-right: 0 !important;"', 'class="full-bleed-carousel"')
    
    # Find where to insert it: after the detail-main-grid closes
    insert_point = c.find('      <div class="detail-full-block" id="sec-overview-${p.id}">')
    if insert_point != -1:
        c = c[:insert_point] + modified_gallery + '\n' + c[insert_point:]
        print("Gallery moved and reformatted.")
    else:
        print("Could not find insert point")
else:
    print("Could not find gallery code")

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(c)

