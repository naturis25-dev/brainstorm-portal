with open('js/app.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'wrap.innerHTML =' in line:
        start = i
        break

for i in range(start, start + 30):
    if i < len(lines):
        print(f"{i}: {lines[i].rstrip()}")
