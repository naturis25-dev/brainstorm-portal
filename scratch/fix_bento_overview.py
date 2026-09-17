css_path = 'frontend/css/style.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# Replace justify-content: space-between in .bento-overview-card
old_overview = '''.bento-overview-card {
  grid-column: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}'''

new_overview = '''.bento-overview-card {
  grid-column: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 12px;
}'''

if old_overview in css:
    css = css.replace(old_overview, new_overview)
    print('Updated .bento-overview-card CSS!')
else:
    print('Target old_overview not found.')

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)
