with open('css/style.css', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('.detail-hero {\n  width: 100%;', '@keyframes slowZoom {\n  0% { transform: scale(1); }\n  100% { transform: scale(1.08); }\n}\n.detail-hero {\n  animation: slowZoom 30s ease-in-out infinite alternate;\n  width: 100%;')

with open('css/style.css', 'w', encoding='utf-8') as f:
    f.write(c)

print('Added hero animation')
