import os

css_path = 'frontend/css/style.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# Locate MOBILE FOOTER BOX DESIGN block and replace with exact reference implementation
target_start = '/* ============================================================\n   MOBILE FOOTER BOX DESIGN (MATCHING REFERENCE IMAGE)\n============================================================ */'

idx = css.find('/* ============================================================\n   MOBILE FOOTER BOX DESIGN')
if idx != -1:
    css = css[:idx]

exact_reference_css = '''/* ============================================================
   MOBILE FOOTER BOX DESIGN (EXACT MATCH FOR REFERENCE IMAGE)
============================================================ */
@media (max-width: 768px) {
  .atlas-brand-footer {
    position: relative !important;
    background: #ffffff !important;
    border: none !important;
    border-radius: 0 !important;
    padding: 28px 20px 22px 20px !important;
    margin: 32px 12px 100px 12px !important;
    box-shadow: none !important;
    overflow: visible !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    box-sizing: border-box !important;
    width: calc(100% - 24px) !important;
  }

  /* Inset Notched Corner Frame SVG pseudo element background */
  .atlas-brand-footer::after {
    content: "" !important;
    display: block !important;
    position: absolute !important;
    inset: 0 !important;
    border: 2px solid #2563eb !important;
    border-radius: 22px !important;
    pointer-events: none !important;
    z-index: 1 !important;
    /* Inset notched corners using radial-gradient masks */
    mask: radial-gradient(circle 14px at 0 0, #0000 98%, #000) 0 0,
          radial-gradient(circle 14px at 100% 0, #0000 98%, #000) 100% 0,
          radial-gradient(circle 14px at 100% 100%, #0000 98%, #000) 100% 100%,
          radial-gradient(circle 14px at 0 100%, #0000 98%, #000) 0 100%;
    mask-size: 51% 51% !important;
    mask-repeat: no-repeat !important;
    -webkit-mask: radial-gradient(circle 14px at 0 0, #0000 98%, #000) 0 0,
                  radial-gradient(circle 14px at 100% 0, #0000 98%, #000) 100% 0,
                  radial-gradient(circle 14px at 100% 100%, #0000 98%, #000) 100% 100%,
                  radial-gradient(circle 14px at 0 100%, #0000 98%, #000) 0 100%;
    -webkit-mask-size: 51% 51% !important;
    -webkit-mask-repeat: no-repeat !important;
  }

  body.dark-mode .atlas-brand-footer {
    background: #0f172a !important;
  }

  body.dark-mode .atlas-brand-footer::after {
    border-color: #3b82f6 !important;
  }

  /* Top Cursive Header "Brainstorm" interrupting top border line */
  .atlas-brand-footer::before {
    content: "Brainstorm" !important;
    display: block !important;
    position: absolute !important;
    top: -14px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    background: #ffffff !important;
    padding: 0 14px !important;
    color: #2563eb !important;
    font-family: 'Dancing Script', 'Caveat', cursive !important;
    font-size: 23px !important;
    font-weight: 700 !important;
    white-space: nowrap !important;
    z-index: 10 !important;
    line-height: 1 !important;
  }

  body.dark-mode .atlas-brand-footer::before {
    background: #0f172a !important;
    color: #3b82f6 !important;
  }

  .atlas-brand-footer .footer-shimmer-line {
    display: none !important;
  }

  .atlas-brand-footer .footer-card-content {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 14px !important;
    align-items: center !important;
    width: 100% !important;
    position: relative !important;
    z-index: 2 !important;
  }

  /* Center Tagline Layout */
  .atlas-brand-footer .footer-brand-side {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 8px !important;
    text-align: center !important;
    width: 100% !important;
  }

  .atlas-brand-footer .tagline-static {
    font-family: 'Inter', sans-serif !important;
    font-size: 12.5px !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.6px !important;
    color: #2563eb !important;
    line-height: 1.4 !important;
    text-align: center !important;
  }

  body.dark-mode .atlas-brand-footer .tagline-static {
    color: #3b82f6 !important;
  }

  /* Animated Word in Cursive Script Font matching reference */
  .atlas-brand-footer .tagline-animated-words {
    display: flex !important;
    position: relative !important;
    height: 32px !important;
    min-height: 32px !important;
    width: 100% !important;
    align-items: center !important;
    justify-content: center !important;
    margin-top: 2px !important;
  }

  .atlas-brand-footer .tagline-word {
    font-family: 'Dancing Script', 'Caveat', cursive !important;
    font-size: 28px !important;
    font-weight: 700 !important;
    color: #2563eb !important;
    position: absolute !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    white-space: nowrap !important;
  }

  body.dark-mode .atlas-brand-footer .tagline-word {
    color: #60a5fa !important;
  }

  /* Right Side layout: Social icons + copyright centered */
  .atlas-brand-footer .footer-right-side {
    width: 100% !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 12px !important;
    margin-top: 6px !important;
  }

  .atlas-brand-footer .footer-social-row {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 14px !important;
  }

  .atlas-brand-footer .footer-social-btn {
    width: 32px !important;
    height: 32px !important;
    border-radius: 50% !important;
    background: rgba(37, 99, 235, 0.08) !important;
    color: #2563eb !important;
    border: 1px solid rgba(37, 99, 235, 0.2) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  .atlas-brand-footer .footer-social-btn svg {
    fill: #2563eb !important;
    stroke: none !important;
    width: 15px !important;
    height: 15px !important;
  }

  body.dark-mode .atlas-brand-footer .footer-social-btn {
    background: rgba(59, 130, 246, 0.15) !important;
    color: #60a5fa !important;
    border-color: rgba(59, 130, 246, 0.3) !important;
  }

  body.dark-mode .atlas-brand-footer .footer-social-btn svg {
    fill: #60a5fa !important;
  }

  .atlas-brand-footer .footer-info-text {
    width: 100% !important;
    text-align: center !important;
  }

  .atlas-brand-footer .footer-copyright {
    font-family: 'Dancing Script', 'Caveat', cursive !important;
    font-size: 16px !important;
    color: #2563eb !important;
    font-weight: 700 !important;
    text-align: center !important;
  }

  body.dark-mode .atlas-brand-footer .footer-copyright {
    color: #93c5fd !important;
  }
}
'''

css += '\n' + exact_reference_css
with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)

print('Applied exact reference CSS successfully!')
