# -*- coding: utf-8 -*-
with open('js/app.js', 'r', encoding='utf-8') as f:
    c = f.read()

target = "if (container && trigger && p.modelUrl)"
replacement = """setTimeout(() => {
    const container = document.getElementById(`mv-container-${p.id}`);
    const trigger = document.getElementById(`mv-trigger-${p.id}`);
    if (container && trigger && p.modelUrl)"""

c = c.replace(target, replacement)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(c)

print("Fixed setTimeout wrapper in app.js")
