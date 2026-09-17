css_path = 'frontend/css/style.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# Replace previous mobile footer block
idx = css.find('/* ============================================================\n   MOBILE FOOTER BOX DESIGN')
if idx != -1:
    css = css[:idx]

new_footer_css = '''/* ============================================================
   MOBILE & DESKTOP BRAND FOOTER DESIGN (MATCHING REFERENCE IMAGE)
============================================================ */
.tagline-subtext {
  display: none;
}
.tagline-swoosh-line {
  display: none;
}

@media (max-width: 768px) {
  .tagline-subtext {
    display: block !important;
    font-family: 'Inter', -apple-system, sans-serif !important;
    font-size: 12px !important;
    color: #64748b !important;
    line-height: 1.45 !important;
    margin: 8px 0 0 0 !important;
    font-weight: 500 !important;
  }

  body.dark-mode .tagline-subtext {
    color: #94a3b8 !important;
  }

  .tagline-swoosh-line {
    display: block !important;
    margin: 4px 0 2px 0 !important;
    width: 160px !important;
    height: 8px !important;
  }

  .atlas-brand-footer {
    position: relative !important;
    background: #f8fafc !important;
    border: 1px solid rgba(226, 232, 240, 0.9) !important;
    border-radius: 20px !important;
    padding: 20px 18px !important;
    margin: 24px 12px 100px 12px !important;
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03) !important;
    overflow: hidden !important;
    display: block !important;
    width: calc(100% - 24px) !important;
    box-sizing: border-box !important;
  }

  .atlas-brand-footer::before,
  .atlas-brand-footer::after {
    display: none !important;
    content: none !important;
  }

  body.dark-mode .atlas-brand-footer {
    background: #0f172a !important;
    border-color: rgba(255, 255, 255, 0.1) !important;
  }

  .atlas-brand-footer .footer-card-content {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 14px !important;
    width: 100% !important;
    padding: 0 !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
  }

  .atlas-brand-footer .footer-brand-side {
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-start !important;
    justify-content: center !important;
    text-align: left !important;
    flex: 1 1 auto !important;
    gap: 0 !important;
    width: auto !important;
  }

  .atlas-brand-footer .tagline-headline-wrap {
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 2px !important;
  }

  .atlas-brand-footer .tagline-static {
    font-family: 'Dancing Script', 'Caveat', cursive !important;
    font-size: 24px !important;
    font-weight: 700 !important;
    color: #0f172a !important;
    line-height: 1.25 !important;
    text-transform: none !important;
    letter-spacing: normal !important;
  }

  body.dark-mode .atlas-brand-footer .tagline-static {
    color: #f8fafc !important;
  }

  .atlas-brand-footer .tagline-animated-words {
    display: inline-flex !important;
    position: relative !important;
    height: 30px !important;
    min-height: 30px !important;
    width: auto !important;
    min-width: 95px !important;
    align-items: center !important;
    vertical-align: middle !important;
    margin-top: 0 !important;
  }

  .atlas-brand-footer .tagline-word {
    font-family: 'Inter', -apple-system, sans-serif !important;
    font-size: 23px !important;
    font-weight: 800 !important;
    color: #2563eb !important;
    position: absolute !important;
    top: 50% !important;
    left: 0 !important;
    transform: translateY(-50%) !important;
    white-space: nowrap !important;
  }

  body.dark-mode .atlas-brand-footer .tagline-word {
    color: #3b82f6 !important;
  }

  .atlas-brand-footer .footer-right-side {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 12px !important;
    border-left: 1px solid rgba(226, 232, 240, 0.9) !important;
    padding-left: 16px !important;
    flex-shrink: 0 !important;
    margin: 0 !important;
    width: auto !important;
  }

  body.dark-mode .atlas-brand-footer .footer-right-side {
    border-left-color: rgba(255, 255, 255, 0.1) !important;
  }

  .atlas-brand-footer .footer-social-row {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    gap: 10px !important;
    width: auto !important;
  }

  .atlas-brand-footer .footer-social-btn {
    width: 38px !important;
    height: 38px !important;
    border-radius: 50% !important;
    background: #ffffff !important;
    color: #2563eb !important;
    border: 1px solid rgba(226, 232, 240, 0.8) !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  body.dark-mode .atlas-brand-footer .footer-social-btn {
    background: #1e293b !important;
    color: #60a5fa !important;
    border-color: rgba(255, 255, 255, 0.1) !important;
  }

  .atlas-brand-footer .footer-social-btn svg {
    fill: #2563eb !important;
    width: 16px !important;
    height: 16px !important;
  }

  body.dark-mode .atlas-brand-footer .footer-social-btn svg {
    fill: #60a5fa !important;
  }

  .atlas-brand-footer .footer-info-text {
    display: none !important;
  }
}
'''

css += '\n' + new_footer_css
with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)

print('Updated mobile footer to exact reference image!')
