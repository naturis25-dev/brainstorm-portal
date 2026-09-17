css_path = 'frontend/css/style.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# Replace border-color in .atlas-brand-footer::after with mild grey
old_border = 'border: 2px solid #2563eb !important;'
new_border = 'border: 1.5px solid #cbd5e1 !important;'

old_dark_border = 'border-color: #3b82f6 !important;'
new_dark_border = 'border-color: rgba(255, 255, 255, 0.15) !important;'

if old_border in css:
    css = css.replace(old_border, new_border)

if old_dark_border in css:
    css = css.replace(old_dark_border, new_dark_border)

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)

print('Updated border to mild grey successfully!')
