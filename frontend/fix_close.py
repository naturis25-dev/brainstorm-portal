# -*- coding: utf-8 -*-
with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('>✕<', '>&times;<')
c = c.replace('>×<', '>&times;<')
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(c)
print('done')
