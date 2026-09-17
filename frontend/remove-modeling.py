# -*- coding: utf-8 -*-
import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    c = f.read()

# Remove Modeling row from p-specs-table
c = re.sub(r'\s*<div class="p-spec-row">\s*<span class="p-spec-lbl">Modeling</span>\s*<span class="p-spec-val">[^<]*</span>\s*</div>', '', c)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(c)

print("Modeling row removed")
