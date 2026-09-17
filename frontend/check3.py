with open('js/app.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if '<div class="detail-grid-right">' in line:
        start = i
        break

print("Right grid starts at line", start)
for i in range(start - 5, start + 25):
    if i < len(lines):
        print(f"{i}: {lines[i].rstrip()}")
