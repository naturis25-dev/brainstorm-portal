css_path = 'frontend/css/style.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# Add clean borderless logo box CSS overrides
logo_override_css = '''
/* Clean Borderless Logo - Full Box Size Image */
.brand .logo-box {
  width: 44px !important;
  height: 44px !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  overflow: visible !important;
}

body.dark-mode .brand .logo-box {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.brand .logo-box img {
  width: 100% !important;
  height: 100% !important;
  object-fit: contain !important;
  padding: 0 !important;
  transition: transform 0.3s cubic-bezier(.2,.9,.25,1) !important;
}

.brand:hover .logo-box {
  transform: none !important;
  border: none !important;
}

.brand:hover .logo-box img {
  transform: scale(1.08) !important;
}

@media (max-width: 768px) {
  .brand .logo-box {
    width: 38px !important;
    height: 38px !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
  }
}
'''

if 'Clean Borderless Logo - Full Box Size Image' not in css:
    css += '\n' + logo_override_css
    with open(css_path, 'w', encoding='utf-8') as f:
        f.write(css)
    print('Borderless logo CSS applied successfully!')
else:
    print('Borderless logo CSS already present!')
