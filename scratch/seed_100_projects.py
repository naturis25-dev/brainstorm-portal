import sqlite3
import json
import random

# Categories
CATEGORIES = [
    'Industrial', 'Commercial', 'Healthcare', 'Airport', 'Warehouse', 
    'Stadium', 'Institutional', 'Manufacturing', 'Data Center', 'Oil & Gas', 
    'Power Plant', 'Bridge', 'Misc Steel'
]

# US States
US_STATES = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
]

# CA Provinces
CA_PROVINCES = [
    'Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 'Saskatchewan',
    'Nova Scotia', 'New Brunswick', 'Newfoundland and Labrador', 'Prince Edward Island'
]

# Image Pool (High resolution structural steel, industrial & architectural images)
IMAGE_POOL = [
    "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80"
]

# Project Naming Templates per Category
NAME_TEMPLATES = {
    'Industrial': ['Apex Industrial Complex', 'Titan Heavy Steel Plant', 'Vanguard Mill & Smelter', 'Pinnacle Refinery Hub', 'Atlas Processing Plant'],
    'Commercial': ['Horizon Financial Tower', 'Skyline Plaza Center', 'Metro Corporate Hub', 'Empire Square Complex', 'Omni Gateway Tower'],
    'Healthcare': ['St. Jude Memorial Pavilion', 'Valley Health Research Tower', 'Centennial Surgical Center', 'Mercy Bio-Tech Campus', 'Summit Care Facility'],
    'Airport': ['Terminal 4 Expansion', 'Skyway Concourse B', 'Airside Logistics Facility', 'International Hangar Depot', 'North Runway Terminal'],
    'Warehouse': ['Pinnacle Logistics Depot', 'Omni Fulfillment Center', 'Global Express Hub', 'Highland Supply Storage', 'Pacific Distribution Facility'],
    'Stadium': ['Centennial Arena Complex', 'Olympic Coliseum Arena', 'Metropolitan Sports Dome', 'Vanguard Performance Center', 'Apex Athletic Arena'],
    'Institutional': ['State University STEM Tower', 'Civic Science Center', 'Polytechnic Engineering Wing', 'National Research Pavilion', 'Metro Academy Hall'],
    'Manufacturing': ['Precision Tool Assembly Plant', 'AutoTech Production Facility', 'Robotics Assembly Factory', 'Advanced Alloy Smelter', 'Semiconductor Fab Plant'],
    'Data Center': ['Hyperscale Data Vault 1', 'Quantum Cloud Center', 'CyberShield Data Campus', 'TeraByte Server Depot', 'Nexus Computing Facility'],
    'Oil & Gas': ['Offshore Riser Facility', 'Petrochem Cracker Unit', 'Coastal LNG Terminal', 'Pipeline Processing Station', 'Energy Transmission Hub'],
    'Power Plant': ['Thermal Energy Generator', 'Solar Substation Grid', 'Hydroelectric Power Station', 'Nuclear Core Structure', 'Biomass Power Facility'],
    'Bridge': ['Riverside Cable Stayed Bridge', 'Grand Overpass Truss', 'Metro Viaduct Span', 'Cross-Harbor Steel Bridge', 'Highland Truss Viaduct'],
    'Misc Steel': ['Curved Monumental Stairs', 'Architectural Steel Canopy', 'Mezzanine & Platform Assembly', 'Heavy Equipment Skid Support', 'Facade Support Framing']
}

random.seed(2026)

projects = []
# Create 100 projects (75 US, 25 Canada)
for i in range(1, 101):
    is_ca = (i % 4 == 0) # 25 CA projects, 75 US projects
    country = 'CA' if is_ca else 'US'
    state_list = CA_PROVINCES if is_ca else US_STATES
    state = state_list[i % len(state_list)]
    cat = CATEGORIES[i % len(CATEGORIES)]
    base_name = NAME_TEMPLATES[cat][i % len(NAME_TEMPLATES[cat])]
    title = f"{base_name} - {state}"
    
    tons = random.choice([450, 780, 1250, 2400, 3600, 5200, 8900, 11400])
    year = random.choice([2022, 2023, 2024, 2025, 2026])
    status = 'Active' if year >= 2025 else 'Completed'
    
    # 2 to 3 images per project
    img_sample = random.sample(IMAGE_POOL, k=random.choice([2, 3]))
    images_json = json.dumps(img_sample)
    
    desc = (
        f"The {title} is a premier {cat.lower()} structural steel detailing project located in {state}, {country}. "
        f"Delivered with high-precision Tekla Structures 3D modeling and Advance Steel BIM workflows, "
        f"this project encompasses over {tons:,} tons of fabricated structural steel. "
        f"Our engineering team produced comprehensive 3D clash detection, shop erection drawings, connection schematics, "
        f"and anchor bolt plans to ensure flawless site assembly and strict AISC/CISC compliance on schedule in {year}."
    )
    
    proj_id = str(1789000000000 + i)
    
    projects.append({
        'id': proj_id,
        'title': title,
        'country': country,
        'state': state,
        'category': cat,
        'type': 'Structural Steel Detailing, Connection Design, BIM 3D Modeling (Tekla), Steel Fabrication Drawings, Erection Drawings, Shop Drawings, Miscellaneous Steel',
        'tons': tons,
        'status': status,
        'images': images_json,
        'video': '',
        'createdAt': f"{year}-0{random.randint(1,9)}-15 10:00:00",
        'year': year,
        'description': desc,
        'modelUrl': '',
        'isKeyProject': 1 if i <= 10 else 0,
        'is_deleted': 0,
        'created_by': 'admin@brainstorminfotech.co.in',
        'updated_by': 'admin@brainstorminfotech.co.in',
        'deleted_by': None,
        'deleted_at': None,
        'version': 1
    })

# Insert into SQLite database backend/data/projects.db
db_path = 'backend/data/projects.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Clear existing test projects and insert 100 projects
cursor.execute('DELETE FROM projects')

insert_sql = '''
INSERT INTO projects (
    id, title, country, state, category, type, tons, status, images, video, 
    createdAt, year, description, modelUrl, isKeyProject, is_deleted, created_by, updated_by, deleted_by, deleted_at, version
) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
)
'''

for p in projects:
    cursor.execute(insert_sql, (
        p['id'], p['title'], p['country'], p['state'], p['category'], p['type'],
        p['tons'], p['status'], p['images'], p['video'], p['createdAt'], p['year'],
        p['description'], p['modelUrl'], p['isKeyProject'], p['is_deleted'],
        p['created_by'], p['updated_by'], p['deleted_by'], p['deleted_at'], p['version']
    ))

conn.commit()

cursor.execute('SELECT COUNT(*) FROM projects')
count = cursor.fetchone()[0]
print(f'Successfully inserted {count} projects into SQLite projects.db!')
conn.close()

# Also write to frontend fallback JSON file
with open('frontend/assets/data/projects_100.json', 'w', encoding='utf-8') as f:
    json.dump(projects, f, indent=2)

print('Saved frontend/assets/data/projects_100.json fallback!')
