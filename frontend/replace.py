# -*- coding: utf-8 -*-
import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    c = f.read()

# Remove Structural System
c = re.sub(r'\s*<div class="p-spec-row">\s*<span class="p-spec-lbl">Structural System</span>\s*<span class="p-spec-val">[^<]*</span>\s*</div>', '', c)

# Mix Completion Year and duration
# 1. First remove Duration row
c = re.sub(r'\s*<div class="p-spec-row">\s*<span class="p-spec-lbl">Duration</span>\s*<span class="p-spec-val">[^<]*</span>\s*</div>', '', c)

# 2. Modify Completion Year row
def replace_timeline(match):
    val = match.group(1) # e.g. ${p.year || '2026'}
    return f"""
                <div class="p-spec-row">
                  <span class="p-spec-lbl">Timeline</span>
                  <span class="p-spec-val">{val} &bull; 8 Weeks</span>
                </div>"""

c = re.sub(r'\s*<div class="p-spec-row">\s*<span class="p-spec-lbl">Completion Year</span>\s*<span class="p-spec-val">([^<]*)</span>\s*</div>', replace_timeline, c)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(c)
print("Done")
