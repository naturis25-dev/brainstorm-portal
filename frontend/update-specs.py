# -*- coding: utf-8 -*-
with open('js/app.js', 'r', encoding='utf-8') as f:
    c = f.read()

import re

# Remove Structural System
old_structural = """                <div class="p-spec-row">
                  <span class="p-spec-lbl">Structural System</span>
                  <span class="p-spec-val">Steel Structure</span>
                </div>"""
c = c.replace(old_structural, '')

# Mix Completion Year and Duration
old_year = """                <div class="p-spec-row">
                  <span class="p-spec-lbl">Completion Year</span>
                  <span class="p-spec-val">${p.year || '2026'}</span>
                </div>"""
new_timeline = """                <div class="p-spec-row">
                  <span class="p-spec-lbl">Timeline</span>
                  <span class="p-spec-val">${p.year || '2026'} (8 Weeks)</span>
                </div>"""
c = c.replace(old_year, new_timeline)

old_duration = """                <div class="p-spec-row">
                  <span class="p-spec-lbl">Duration</span>
                  <span class="p-spec-val">8 Weeks</span>
                </div>"""
c = c.replace(old_duration, '')


with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(c)

print('Updated specs table')
