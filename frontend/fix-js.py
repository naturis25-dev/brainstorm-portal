# -*- coding: utf-8 -*-
with open('js/app.js', 'r', encoding='utf-8') as f:
    c = f.read()

import re
c = re.sub(r"const diff = idx - targetIdx;", r"let diff = idx - targetIdx;\n      if (cards.length > 3) {\n        if (diff < -Math.floor(cards.length/2)) diff += cards.length;\n        if (diff > Math.floor(cards.length/2)) diff -= cards.length;\n      }", c)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(c)

print('JS updated via regex')
