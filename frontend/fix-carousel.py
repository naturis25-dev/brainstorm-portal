# -*- coding: utf-8 -*-
with open('css/style.css', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('max-width: 100%;\n  margin: 0 auto;\n  padding: 40px 28px 90px;', 'max-width: 1280px;\n  margin: 0 auto;\n  padding: 40px 28px 90px;')

if '.carousel-card {\n  position: absolute;\n  width: 220px;\n  height: 220px;\n  border-radius: 18px;' in c:
    c = c.replace('.carousel-card {\n  position: absolute;\n  width: 220px;\n  height: 220px;\n  border-radius: 18px;', 
                  '.carousel-card {\n  position: absolute;\n  left: 50%;\n  margin-left: -110px;\n  width: 220px;\n  height: 220px;\n  border-radius: 18px;')

c += "\n/* Fix margins for carousel sizes */\n@media (max-width: 768px) { .carousel-card { margin-left: -38vw !important; } }\n@media (min-width: 1200px) { .carousel-card, .featured-card { margin-left: -117.5px !important; } }\n"

with open('css/style.css', 'w', encoding='utf-8') as f:
    f.write(c)

print('done')
