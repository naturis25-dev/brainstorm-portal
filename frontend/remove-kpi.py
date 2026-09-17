# -*- coding: utf-8 -*-
import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    c = f.read()

# Remove detail-kpi-floating-row block
c = re.sub(r'\s*<!-- Top Floating KPI Metric Cards \(Image 1 Layout\) -->\s*<div class="detail-kpi-floating-row">[\s\S]*?</div>\s*</div>\s*</div>\s*</div>', '', c)

if 'detail-kpi-floating-row' in c:
    # Backup regex if the comment differed
    c = re.sub(r'\s*<div class="detail-kpi-floating-row">[\s\S]*?</div>\s*</div>\s*</div>\s*</div>', '', c)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(c)

print("KPI row removed check:", 'detail-kpi-floating-row' in c)
