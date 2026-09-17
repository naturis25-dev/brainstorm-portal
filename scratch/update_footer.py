with open('frontend/css/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

target = '/* Tagline centered inside box with top line cutout */'
addition = '''  .atlas-brand-footer::before {
    content: "Brainstorm Infotech" !important;
    display: block !important;
    position: absolute !important;
    top: -11px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    background: #ffffff !important;
    padding: 0 12px !important;
    color: #2563eb !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    letter-spacing: 0.5px !important;
    text-transform: uppercase !important;
    white-space: nowrap !important;
    z-index: 10 !important;
  }

  body.dark-mode .atlas-brand-footer::before {
    background: #0f172a !important;
    color: #3b82f6 !important;
  }

  /* Tagline centered inside box with top line cutout */'''

if target in css and 'Brainstorm Infotech' not in css:
    css = css.replace(target, addition)
    with open('frontend/css/style.css', 'w', encoding='utf-8') as f:
        f.write(css)
    print('Updated CSS with top badge cutout!')
else:
    print('Already present or target missing.')
