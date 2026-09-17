# -*- coding: utf-8 -*-
import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    c = f.read()

# Remove emojis from specs table
c = c.replace('📅 Completion Year', 'Completion Year')
c = c.replace('📍 Location', 'Location')
c = c.replace('⚖️ Steel Tonnage', 'Steel Tonnage')
c = c.replace('🏢 Project Type', 'Project Type')
c = c.replace('🏗️ Structural System', 'Structural System')
c = c.replace('💻 Modeling', 'Modeling')
c = c.replace('⏱️ Duration', 'Duration')

# Remove emojis from carousel caption
c = c.replace('📐 View 1 of', 'View 1 of')
c = c.replace('🏗️ ${p.category', '${p.category')

# The corrupted ones might be dY"? or similar
c = c.replace('dY"? View 1', 'View 1')
c = c.replace('dY?-,? ${p.category', '${p.category')
c = c.replace('dY"? ${s.state}', '${s.state}')

# Remove emojis from highlights
c = c.replace('<div class="dh-icon">🎯</div>', '<div class="dh-icon"><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg></div>')
c = c.replace('<div class="dh-icon">⚡</div>', '<div class="dh-icon"><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></div>')
c = c.replace('<div class="dh-icon">📈</div>', '<div class="dh-icon"><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg></div>')


with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(c)

print('Emojis removed')
