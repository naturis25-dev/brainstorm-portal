with open('js/app.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'id="sec-gallery-' in line:
        start = i
        break

print("Gallery starts at line", start)
for i in range(start - 5, start + 35):
    if i < len(lines):
        print(f"{i}: {lines[i].rstrip()}")
