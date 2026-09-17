# -*- coding: utf-8 -*-
with open('js/app.js', 'r', encoding='utf-8') as f:
    c = f.read()

# Restore the double setTimeout mistake
c = c.replace("""setTimeout(() => {
    const container = document.getElementById(`mv-container-${p.id}`);
    const trigger = document.getElementById(`mv-trigger-${p.id}`);
    if (container && trigger && p.modelUrl)""", """    const container = document.getElementById(`mv-container-${p.id}`);
    const trigger = document.getElementById(`mv-trigger-${p.id}`);
    if (container && trigger && p.modelUrl)""")

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(c)

print("Restored")
