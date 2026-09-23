import sqlite3, json, os

db_path = 'backend/data/projects.db'
json_path = 'frontend/assets/data/projects_100.json'

if os.path.exists(json_path):
    with open(json_path, 'r', encoding='utf-8') as f:
        projects = json.load(f)

    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute('DELETE FROM projects')
    
    for p in projects:
        img_val = p.get('images', [])
        if isinstance(img_val, (list, dict)):
            img_val = json.dumps(img_val)
        elif not isinstance(img_val, str):
            img_val = '[]'
            
        c.execute('''
            INSERT OR REPLACE INTO projects 
            (id, title, country, state, category, type, tons, status, images, video, year, description, modelUrl, isKeyProject, is_deleted)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
        ''', (
            p.get('id'),
            p.get('title', 'Untitled'),
            (p.get('country') or 'US').upper(),
            p.get('state', ''),
            p.get('category', 'Commercial'),
            p.get('type', ''),
            p.get('tons', 0),
            p.get('status', 'Active'),
            img_val,
            p.get('video', ''),
            p.get('year'),
            p.get('description', ''),
            p.get('modelUrl', ''),
            1 if p.get('isKeyProject') else 0
        ))
    conn.commit()
    print(fSuccessfully restored {len(projects)} projects!)
    conn.close()
