with open('js/app.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if '<div class="detail-main-grid">' in line:
        start = i
        break

print("Grid starts at line", start)
for i in range(start, start + 300):
    if i < len(lines):
        print(f"{i}: {lines[i].rstrip()}")
