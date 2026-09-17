css_path = 'frontend/css/style.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# Remove theme-ca overrides on footer card elements
targets_to_remove = [
    '''body.theme-ca .tagline-swoosh-line path {
    animation: swooshPulseCa 4s ease-in-out infinite;
  }''',
    '''@keyframes swooshPulseCa {
    0%, 100% { stroke: #fca5a5; opacity: 0.8; }
    50% { stroke: #dc2626; opacity: 1; }
  }''',
    '''body.theme-ca .atlas-brand-footer .tagline-word {
    color: #dc2626 !important;
  }''',
    '''body.theme-ca .atlas-brand-footer .footer-social-btn {
    color: #dc2626 !important;
  }''',
    '''body.theme-ca .atlas-brand-footer .footer-social-btn svg {
    fill: #dc2626 !important;
  }'''
]

for t in targets_to_remove:
    if t in css:
        css = css.replace(t, '')

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)

print('Removed theme-ca overrides on footer card! Footer colors will remain identical to USA toggle.')
