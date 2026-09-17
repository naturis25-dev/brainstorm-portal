# -*- coding: utf-8 -*-
with open('css/style.css', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    "transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);",
    "transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease-out, filter 0.5s ease-out, box-shadow 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);"
)

with open('css/style.css', 'w', encoding='utf-8') as f:
    f.write(c)

print('CSS animation bouncy updated')
