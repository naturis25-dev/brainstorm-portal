css_path = 'frontend/css/style.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# Replace fixed max-width 1160px on .detail-wrap and .detail-hero-section
old_detail_wrap = '''.detail-wrap {
  max-width: 1160px !important;
  margin: 0 auto !important;
  padding: 24px 20px 80px !important;
}

/* Detail Hero Header Banner */
.detail-hero-section {
  position: relative;
  width: 100%;
  max-width: 1160px;
  margin: 0 auto 24px;'''

new_detail_wrap = '''.detail-wrap {
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
  padding: 24px 32px 80px !important;
  box-sizing: border-box !important;
}

/* Detail Hero Header Banner - Full Desktop Span */
.detail-hero-section {
  position: relative;
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 auto 24px;'''

if old_detail_wrap in css:
    css = css.replace(old_detail_wrap, new_detail_wrap)
    print('Replaced detail-wrap max-width with full screen width!')
else:
    print('Target old_detail_wrap not found, using regex/append override.')

# Add full-page desktop bento layout responsive overrides
desktop_bento_override = '''
/* ============================================================
   FULL-WIDTH RESPONSIVE BENTO GRID DESKTOP DASHBOARD
============================================================ */
@media (min-width: 769px) {
  .detail-overlay {
    padding: 0 !important;
  }

  .detail-wrap {
    width: 100% !important;
    max-width: 100% !important;
    padding: 28px 40px 90px !important;
    box-sizing: border-box !important;
  }

  .detail-hero-section {
    width: 100% !important;
    max-width: 100% !important;
    height: 320px !important;
    border-radius: 24px !important;
    margin-bottom: 28px !important;
  }

  .bento-dashboard-grid {
    display: grid !important;
    grid-template-columns: 1.4fr 0.6fr !important;
    gap: 24px !important;
    width: 100% !important;
  }

  .detail-card-block,
  .detail-full-block {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
}
'''

if 'FULL-WIDTH RESPONSIVE BENTO GRID DESKTOP DASHBOARD' not in css:
    css += '\n' + desktop_bento_override
    with open(css_path, 'w', encoding='utf-8') as f:
        f.write(css)
    print('Desktop bento full-width CSS applied!')
