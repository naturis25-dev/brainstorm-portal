# -*- coding: utf-8 -*-
with open('js/app.js', 'r', encoding='utf-8') as f:
    c = f.read()

target = "wrap.innerHTML = `\n        <!-- Sticky Sub-Nav Tabs Bar -->"
replacement = "wrap.innerHTML = `\n        <!-- Sticky Sub-Nav Tabs Bar -->"

# Let's find wrap.innerHTML = ` and add setTimeout after wrap.innerHTML = `...`;
target2 = "      `;\n\n      const container = document.getElementById"
replacement2 = "      `;\n\n      setTimeout(() => {\n        const container = document.getElementById"

if target2 in c:
    c = c.replace(target2, replacement2)
    print("Fixed opening setTimeout")
else:
    print("Could not find target2")

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(c)

