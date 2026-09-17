css_path = 'frontend/css/style.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# Replace mobile footer CSS with compact text sizing + interactive micro-animations
idx = css.find('/* ============================================================\n   MOBILE & DESKTOP BRAND FOOTER DESIGN')
if idx != -1:
    css = css[:idx]

interactive_footer_css = '''/* ============================================================
   MOBILE & DESKTOP BRAND FOOTER DESIGN (INTERACTIVE & COMPACT)
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
    font-size: 11px !important;
    color: #64748b !important;
    line-height: 1.4 !important;
    margin: 6px 0 0 0 !important;
    font-weight: 500 !important;
    transition: color 0.2s ease !important;
  }

  body.dark-mode .tagline-subtext {
    color: #94a3b8 !important;
  }

  .tagline-swoosh-line {
    display: block !important;
    margin: 3px 0 1px 0 !important;
    width: 140px !important;
    height: 7px !important;
  }

  .tagline-swoosh-line path {
    stroke-dasharray: 200;
    stroke-dashoffset: 0;
    animation: swooshPulse 4s ease-in-out infinite;
  }

  @keyframes swooshPulse {
    0%, 100% { stroke: #93c5fd; opacity: 0.8; }
    50% { stroke: #2563eb; opacity: 1; }
  }

  .atlas-brand-footer {
    position: relative !important;
    background: #f8fafc !important;
    border: 1px solid rgba(226, 232, 240, 0.9) !important;
    border-radius: 18px !important;
    padding: 16px 14px !important;
    margin: 20px 10px 95px 10px !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03) !important;
    overflow: hidden !important;
    display: block !important;
    width: calc(100% - 20px) !important;
    box-sizing: border-box !important;
    transition: transform 0.25s ease, box-shadow 0.25s ease !important;
  }

  .atlas-brand-footer:active {
    transform: scale(0.99) !important;
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
    gap: 12px !important;
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
    font-size: 20px !important;
    font-weight: 700 !important;
    color: #0f172a !important;
    line-height: 1.2 !important;
    text-transform: none !important;
    letter-spacing: normal !important;
  }

  body.dark-mode .atlas-brand-footer .tagline-static {
    color: #f8fafc !important;
  }

  .atlas-brand-footer .tagline-animated-words {
    display: inline-flex !important;
    position: relative !important;
    height: 24px !important;
    min-height: 24px !important;
    width: auto !important;
    min-width: 80px !important;
    align-items: center !important;
    vertical-align: middle !important;
    margin-top: 0 !important;
    cursor: pointer !important;
    user-select: none !important;
  }

  .atlas-brand-footer .tagline-word {
    font-family: 'Inter', -apple-system, sans-serif !important;
    font-size: 19px !important;
    font-weight: 800 !important;
    color: #2563eb !important;
    position: absolute !important;
    top: 50% !important;
    left: 0 !important;
    transform: translateY(-50%) !important;
    white-space: nowrap !important;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
  }

  body.dark-mode .atlas-brand-footer .tagline-word {
    color: #3b82f6 !important;
  }

  /* Right Side: Social Column with Spring Hover Animations */
  .atlas-brand-footer .footer-right-side {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 8px !important;
    border-left: 1px solid rgba(226, 232, 240, 0.9) !important;
    padding-left: 12px !important;
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
    gap: 8px !important;
    width: auto !important;
  }

  .atlas-brand-footer .footer-social-btn {
    width: 34px !important;
    height: 34px !important;
    border-radius: 50% !important;
    background: #ffffff !important;
    color: #2563eb !important;
    border: 1px solid rgba(226, 232, 240, 0.8) !important;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease, background 0.25s ease !important;
  }

  .atlas-brand-footer .footer-social-btn:active,
  .atlas-brand-footer .footer-social-btn:hover {
    transform: scale(1.12) translateY(-1px) !important;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2) !important;
    background: #ffffff !important;
  }

  body.dark-mode .atlas-brand-footer .footer-social-btn {
    background: #1e293b !important;
    color: #60a5fa !important;
    border-color: rgba(255, 255, 255, 0.1) !important;
  }

  .atlas-brand-footer .footer-social-btn svg {
    fill: #2563eb !important;
    width: 14px !important;
    height: 14px !important;
  }

  body.dark-mode .atlas-brand-footer .footer-social-btn svg {
    fill: #60a5fa !important;
  }

  .atlas-brand-footer .footer-info-text {
    display: none !important;
  }
}
'''

css += '\n' + interactive_footer_css
with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)

print('Updated interactive mobile footer CSS!')
