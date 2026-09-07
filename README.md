# Brainstorm Portal — IT Team Handover & Technical Specification

> **Document Purpose**: This technical handover document is prepared for the IT & Infrastructure Engineering Team. It details the system architecture, technology stack, backend database design, required environment configurations, deployment setup, and CI/CD automated deployment workflow for hosting on private/on-premise cloud servers.

---

## 1. Executive System Overview

The **Brainstorm Portal** is a high-performance, full-stack web application for interactive 3D structural steel project visualization, regional map filtering, drawing portfolio management, and administrative control.

### Architecture Highlights:
- **Unified Node.js / Express Server**: Serves both high-throughput REST APIs and static single-page frontend assets.
- **Dual Database Architecture (SQLite & PostgreSQL)**: Supports both zero-dependency local SQLite file storage and enterprise PostgreSQL databases.
- **High-Performance 3D Asset Handling**: Supports interactive `.gltf` / `.glb` structural models with Draco compression, chunked large file uploads, and S3 / local filesystem storage options.
- **Responsive Frontend**: Vanilla JS, CSS3 (Custom Properties & Glassmorphism), and D3.js / TopoJSON for geographical map visualization.

---

## 2. Technology Stack & Dependencies

| Component | Technology / Library | Description |
| :--- | :--- | :--- |
| **Backend Runtime** | Node.js (v20.x LTS) | Event-driven server runtime |
| **Web Server Framework**| Express.js (`v4.19.2`) | REST API routing and middleware execution |
| **Database (Primary)** | SQLite via `better-sqlite3` (`v11.1.2`) | High-speed file-based SQLite database with WAL journal mode |
| **Database (Enterprise)**| PostgreSQL via `pg` (`v8.23.0`) | Pluggable PostgreSQL client for multi-node on-premise cloud deployments |
| **Security & Headers** | `helmet`, `express-rate-limit`, `cors` | Anti-brute-force rate limiting & HTTP header hardening |
| **Performance** | `compression` | Gzip compression for API payloads and static assets |
| **3D Rendering** | `<model-viewer>` & Draco 3D | WebGL-based interactive 3D model engine |
| **Mapping Engine** | D3.js (`v7`), TopoJSON (`v3`) | Vector map renderer for US States & Canadian Provinces |
| **Media Uploads** | `multer`, `@aws-sdk/client-s3` | Chunked file uploads (local disk or S3 bucket) |

---

## 3. Directory Structure

```
brainstorm-portal/
├── backend/
│   ├── data/                 # SQLite database storage (projects.db)
│   ├── routes/               # Express API endpoints (projects, auth, metadata, media)
│   ├── scripts/              # Migration, backup, and health-check utilities
│   ├── uploads/              # Local storage for uploaded project images & 3D models
│   ├── database.js           # SQLite driver & schema migration handler
│   ├── database.pg.js        # PostgreSQL driver & connection pool
│   ├── db.js                 # Database selector facade (SQLite vs PostgreSQL switch)
│   ├── server.js             # Main server entry point
│   ├── .env.example          # Environment configuration template
│   └── package.json          # Backend dependencies & npm scripts
├── frontend/
│   ├── assets/               # Branding logos, fonts, static PDFs
│   ├── css/                  # Custom UI stylesheets (style.css, design system)
│   ├── js/                   # Frontend modules (app.js, map.js, config.js)
│   ├── index.html            # Main SPA entry HTML
│   └── drawings_data.json    # Drawings gallery metadata database
├── Dockerfile                # Production Docker container definition
├── docker-compose.yml        # Multi-container orchestrator configuration
├── package.json              # Root build script runner
└── README.md                 # Brief quickstart guide & IT Handover documentation
```

---

## 4. Backend & Database Design

### 4.1 Database Configuration (`backend/db.js`)
The backend uses a dynamic DB factory strategy. The active database driver is determined by the `DB_CLIENT` environment variable:
- **`DB_CLIENT=sqlite`** (Default): Uses `better-sqlite3` storing data in `backend/data/projects.db`.
- **`DB_CLIENT=pg`**: Uses `pg.Pool` connecting to PostgreSQL via `DATABASE_URL`.

### 4.2 Database Schema (`projects` table)
```sql
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,             -- Unique project ID (timestamp or string)
  title TEXT NOT NULL,             -- Project name
  country TEXT NOT NULL,           -- Country code ('US' or 'CA')
  state TEXT NOT NULL,             -- State or province abbreviation (e.g. 'TX', 'ON')
  category TEXT NOT NULL,          -- Primary category (Industrial, Commercial, etc.)
  type TEXT,                       -- Sub-type tags
  tons INTEGER DEFAULT 0,          -- Steel tonnage detailed
  status TEXT DEFAULT 'Active',    -- Project status
  images TEXT,                     -- JSON Array string of image file paths
  video TEXT,                      -- YouTube embed URL or uploaded MP4 path
  year INTEGER,                    -- Delivery / Completion year
  description TEXT,                -- Detailed description
  modelUrl TEXT,                   -- Path to .glb 3D structural model file
  isKeyProject INTEGER DEFAULT 0,  -- Key project highlight flag (0 or 1)
  is_deleted INTEGER DEFAULT 0,   -- Soft-delete flag (0 = active, 1 = deleted)
  created_by TEXT DEFAULT 'System',-- Admin username who created record
  updated_by TEXT,                 -- Admin username who updated record
  deleted_by TEXT,                 -- Admin username who deleted record
  deleted_at DATETIME,             -- Deletion timestamp
  version INTEGER DEFAULT 1,       -- Optimistic concurrency control version
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
  username TEXT PRIMARY KEY,
  passwordHash TEXT NOT NULL,
  salt TEXT NOT NULL,
  role TEXT DEFAULT 'MANAGER',    -- 'SUPER_ADMIN' or 'MANAGER'
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. API Routes Specification

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/projects` | No | Fetch filtered list of active projects |
| `GET` | `/api/projects/stats` | No | Get aggregated tonnage & project counts per region |
| `GET` | `/api/projects/:id` | No | Fetch single project details |
| `POST` | `/api/projects` | **Yes (JWT/Admin)** | Create a new project record |
| `PUT` | `/api/projects/:id` | **Yes (JWT/Admin)** | Update an existing project record |
| `DELETE`| `/api/projects/:id` | **Yes (JWT/Admin)** | Soft-delete a project record |
| `POST` | `/api/auth/login` | No | Authenticate admin user & issue session token |
| `GET` | `/api/auth/admins` | **Yes (Super Admin)**| List secondary admin accounts |
| `POST` | `/api/media/upload` | **Yes (JWT/Admin)** | Upload images or `.glb` 3D files (chunked) |

---

## 6. Environment Variables (`.env`)

Create a `.env` file inside the `backend/` directory or pass these variables into your Cloud / Docker container runner:

```ini
# Application Configuration
PORT=5050
NODE_ENV=production
CORS_ORIGIN=*

# Database Switch ('sqlite' or 'pg')
DB_CLIENT=sqlite

# PostgreSQL Connection (Only required if DB_CLIENT=pg)
DATABASE_URL=postgresql://postgres:password@localhost:5432/brainstorm_atlas?sslmode=disable

# Authentication Secrets
JWT_SECRET=super_secret_enterprise_key_change_in_production
SUPER_ADMIN_USER=admin
SUPER_ADMIN_PASS=ChangeThisSecurePassword123!

# Storage Configuration ('local' or 's3')
STORAGE_DRIVER=local
# AWS S3 Settings (Optional - if STORAGE_DRIVER=s3)
# AWS_REGION=us-east-1
# AWS_S3_BUCKET=brainstorm-portal-assets
# AWS_ACCESS_KEY_ID=your_key
# AWS_SECRET_ACCESS_KEY=your_secret
```

---

## 7. How the Application Operates & Data Flow

1. **User Connection**: When a user navigates to the portal URL, Express serves `frontend/index.html` alongside bundled static scripts (`app.js`, `map.js`).
2. **Initial Data Load**:
   - `fetchAppInitialData()` fires an API call to `/api/projects`.
   - The backend queries the database (`projects.db` SQLite or PostgreSQL), applies filters, and returns lightweight JSON.
   - `map.js` renders the interactive D3 vector map with color-coded region activity bubbles.
3. **3D Asset Streaming**:
   - Selecting a project with a 3D model lazy-loads `<model-viewer>` only upon user interaction to preserve initial page load performance.
4. **Admin Management**:
   - Admins sign in via `/api/auth/login`. Successful login saves a session token.
   - Admins can add, edit, or delete projects and upload images or 3D files directly from the web interface.

---

## 8. On-Premise Cloud Deployment & CI/CD Pipeline (Git Push to Deployment)

To ensure that **making changes on your local PC and pushing to Git automatically builds and deploys to your Office Cloud**, set up the following deployment workflow:

### Option A: Docker Deployment (Recommended for Office Cloud)

1. **Build Container Image**:
   ```bash
   docker build -t brainstorm-portal:latest .
   ```
2. **Run Container**:
   ```bash
   docker run -d \
     --name brainstorm-portal-prod \
     -p 5050:5050 \
     -v /var/data/brainstorm/uploads:/app/backend/uploads \
     -v /var/data/brainstorm/data:/app/backend/data \
     --env-file backend/.env \
     --restart unless-stopped \
     brainstorm-portal:latest
   ```

---

### Option B: Automated Git Webhook / CI/CD Workflow (Auto-Deploy on Push)

Set up a Continuous Deployment (CD) pipeline on your Office Cloud server using a Git Webhook, GitHub Actions runner, GitLab CI, or Jenkins runner:

#### Auto-Deployment Shell Script (`deploy.sh` on Office Cloud Server):
```bash
#!/bin/bash
set -e

echo "=== Pulling Latest Changes from Git ==="
git pull origin main

echo "=== Installing Dependencies ==="
npm install
cd backend && npm install && cd ..

echo "=== Restarting Process Manager ==="
# If using PM2:
pm2 restart server || pm2 start backend/server.js --name "brainstorm-portal"

# OR if using Docker Compose:
# docker-compose down && docker-compose up -d --build

echo "=== Deployment Successfully Completed ==="
```

#### Recommended CI/CD Setup with GitHub Actions (or GitLab CI):
Create `.github/workflows/deploy.yml` in your repository:
```yaml
name: Office Cloud Auto-Deploy

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Office Cloud Deployment Webhook
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.OFFICE_CLOUD_HOST }}
          username: ${{ secrets.OFFICE_CLOUD_USER }}
          key: ${{ secrets.OFFICE_CLOUD_SSH_KEY }}
          script: |
            cd /var/www/brainstorm-portal
            ./deploy.sh
```

---

## 9. Verification & Health Checks

After deployment on your office cloud, verify the system status using the built-in diagnostic endpoints:

- **Frontend Interface**: `http://<your-cloud-ip>:5050/`
- **Database Diagnostic**: `http://<your-cloud-ip>:5050/api/debug-db`
- **Projects Endpoint**: `http://<your-cloud-ip>:5050/api/projects`
- **Metadata Endpoint**: `http://<your-cloud-ip>:5050/api/metadata`

