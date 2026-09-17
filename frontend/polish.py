with open('css/style.css', 'r', encoding='utf-8') as f:
    c = f.read()

# Make the detail-card-block shadows softer and more luxurious
c = c.replace('box-shadow: 0 4px 12px rgba(0,0,0,0.05);', 'box-shadow: 0 10px 40px -10px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.04);')

# Enhance the floating KPI cards
c = c.replace('margin-top: -30px;', 'margin-top: -60px; z-index: 30;')
c = c.replace('.dkpi-card {\n  flex: 1;', '.dkpi-card {\n  flex: 1;\n  backdrop-filter: blur(20px);\n  background: rgba(255, 255, 255, 0.85);')

# Make the subnav sticky bar look like glass
c = c.replace('.detail-subnav-bar {\n  display: flex;', '.detail-subnav-bar {\n  display: flex;\n  backdrop-filter: blur(20px);\n  background: rgba(255, 255, 255, 0.7);')

# Update fonts for headers to make it look premium
c = c.replace('.detail-title-hero {', '.detail-title-hero {\n  font-family: \'Playfair Display\', serif;\n  letter-spacing: -1px;')
c = c.replace('.dcard-title {', '.dcard-title {\n  font-family: \'Playfair Display\', serif;\n  letter-spacing: -0.5px;')

with open('css/style.css', 'w', encoding='utf-8') as f:
    f.write(c)

print('CSS polished')
