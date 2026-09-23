# 🌐 Brainstorm Atlas: Comprehensive Documentary & Technical Showcase Blueprint

---

## 📑 Table of Contents
1. [Executive Summary & Purpose](#1-executive-summary--purpose)
   - [Git Repository & Download Links](#git-repository--download-links)
   - [🖥️ New PC Setup & Software Prerequisites](#️-new-pc-setup--software-prerequisites)
   - [🚀 Step-by-Step Guide to Run on Any New Machine](#-step-by-step-guide-to-run-on-any-new-machine)
   - [⚠️ STRICT MANDATE: UI/UX & Brand Design Preservation](#️-strict-mandate-uiux--brand-design-preservation)
2. [Interactive Functions & Core Public Features](#2-interactive-functions--core-public-features)
   - [2.1 Interactive North America Geographic Map (D3 & TopoJSON)](#21-interactive-north-america-geographic-map-d3--topojson)
   - [2.2 Proportional Edge-to-Edge Filter System](#22-proportional-edge-to-edge-filter-system)
   - [2.3 Apple Spotlight / Raycast Interactive Search](#23-apple-spotlight--raycast-interactive-search)
   - [2.4 Built-In Drawing PDF Viewer & Navigation Dock](#24-built-in-drawing-pdf-viewer--navigation-dock)
   - [2.5 3D BIM & Tekla Structural Model Viewer](#25-3d-bim--tekla-structural-model-viewer)
   - [2.6 Bento-Grid Project Detail Modal](#26-bento-grid-project-detail-modal)
   - [2.7 Brochure Viewer & Instant Download Flow](#27-brochure-viewer--instant-download-flow)
   - [2.8 Dark-Ink Progressive Loader Experience](#28-dark-ink-progressive-loader-experience)
   - [2.9 Mobile Responsive Experience & Floating Dock](#29-mobile-responsive-experience--floating-dock)
3. [Mobile vs. Desktop Version: Features & Architecture Differences](#3-mobile-vs-desktop-version-features--architecture-differences)
   - [3.1 Comprehensive Desktop vs. Mobile Feature Comparison Matrix](#31-comprehensive-desktop-vs-mobile-feature-comparison-matrix)
   - [3.2 Navigation & Dismissal Architecture (Desktop Top Close vs. Mobile Slanted Back Dock)](#32-navigation--dismissal-architecture-desktop-top-close-vs-mobile-slanted-back-dock)
   - [3.3 Smart Content-Aware Collision Detection (Side Arrow Auto-Hiding)](#33-smart-content-aware-collision-detection-side-arrow-auto-hiding)
   - [3.4 Bento Grid Layout & Justified Mobile Typography](#34-bento-grid-layout--justified-mobile-typography)
   - [3.5 iOS & Android Bottom Floating Glass Dock](#35-ios--android-bottom-floating-glass-dock)
   - [3.6 Adaptive Responsive Breakpoints & Performance Throttling](#36-adaptive-responsive-breakpoints--performance-throttling)
4. [Atlas Admin Dashboard & Management System](#4-atlas-admin-dashboard--management-system)
   - [4.1 Discreet Access Mechanisms](#41-discreet-access-mechanisms)
   - [4.2 Enterprise Authentication & Google SSO](#42-enterprise-authentication--google-sso)
   - [4.3 Real-Time Portfolio Analytics & KPI Row](#43-real-time-portfolio-analytics--kpi-row)
   - [4.4 Live Search & Multi-Column Project Table](#44-live-search--multi-column-project-table)
   - [4.5 Project Creator & Editor Modal (CRUD)](#45-project-creator--editor-modal-crud)
   - [4.6 Drag-and-Drop Media & 3D Draco Pipeline](#46-drag-and-drop-media--3d-draco-pipeline)
   - [4.7 Sample Drawings Manager](#47-sample-drawings-manager)
   - [4.8 Secondary Admin Access Management](#48-secondary-admin-access-management)
   - [4.9 Security Audit Logging & Compliance](#49-security-audit-logging--compliance)
5. [Technology Stack & Code Architecture](#5-technology-stack--code-architecture)
   - [Why Vanilla JavaScript & D3.js for Frontend](#why-vanilla-javascript--d3js-for-frontend)
   - [Why Node.js & Express for Backend](#why-nodejs--express-for-backend)
   - [Dual-Engine Database Architecture (SQLite & PostgreSQL)](#dual-engine-database-architecture-sqlite--postgresql)
   - [Cloud Storage Engine (AWS S3 & Cloudflare R2)](#cloud-storage-engine-aws-s3--cloudflare-r2)
   - [Complete Environment Variables Reference (.env)](#complete-environment-variables-reference-env)
6. [Enterprise Security Architecture](#6-enterprise-security-architecture)
   - [Security Features Breakdown](#security-features-breakdown)
   - [Defending Against Major Threat Vectors](#defending-against-major-threat-vectors)
7. [Client Showcase & Pitching Guide](#7-client-showcase--pitching-guide)
   - [Step-by-Step Live Demo Walkthrough](#step-by-step-live-demo-walkthrough)
   - [Tailored Pitching Points for Stakeholders](#tailored-pitching-points-for-stakeholders)

---

## 1. Executive Summary & Purpose

**Brainstorm Atlas** is an enterprise-grade, interactive digital intelligence portal developed for **Brainstorm Infotech** to showcase its extensive structural and architectural steel detailing portfolio across North America and global markets.

### 📦 Git Repository & Download Links

| Resource | Link / URL |
| :--- | :--- |
| **GitHub Repository** | [https://github.com/naturis25-dev/brainstorm-portal](https://github.com/naturis25-dev/brainstorm-portal) |
| **Direct ZIP Archive Download** | [Download main.zip](https://github.com/naturis25-dev/brainstorm-portal/archive/refs/heads/main.zip) |
| **HTTPS Clone Command** | `git clone https://github.com/naturis25-dev/brainstorm-portal.git` |
| **SSH Clone Command** | `git clone git@github.com:naturis25-dev/brainstorm-portal.git` |

---

### 🖥️ New PC Setup & Software Prerequisites

To run the Brainstorm Atlas application on any new computer (Windows, macOS, or Linux), the following software prerequisites must be downloaded and installed:

| Software | Minimum Version | Download Link | Purpose |
| :--- | :--- | :--- | :--- |
| **Node.js (LTS)** | `v18.x` or `v20.x+` | [https://nodejs.org/](https://nodejs.org/) | Runtime required to execute the backend Express server & APIs. |
| **Git** | Latest | [https://git-scm.com/](https://git-scm.com/) | Version control tool required to clone the codebase. |
| **Web Browser** | Latest | Chrome, Edge, Firefox, Safari | Modern browser with WebGL enabled for 3D model & map rendering. |
| **VS Code / IDE** *(Optional)* | Latest | [https://code.visualstudio.com/](https://code.visualstudio.com/) | Recommended editor for viewing code and terminal commands. |

---

### 🚀 Step-by-Step Guide to Run on Any New Machine

Follow these exact steps to set up and launch the site on a fresh PC:

#### Method A: Using Git (Recommended)

1. **Open your Terminal / PowerShell / Command Prompt**:
   ```bash
   # Navigate to the folder where you want to store the project (e.g. Desktop or Projects)
   cd "C:\Projects"
   ```

2. **Clone the Repository**:
   ```bash
   git clone https://github.com/naturis25-dev/brainstorm-portal.git
   cd brainstorm-portal/backend
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Start the Application Server**:
   ```bash
   node server.js
   ```

5. **Open in Browser**:
   Open your browser and navigate to:
   ```
   http://localhost:5050
   ```
   *(The server serves both the frontend interactive portal and all backend REST APIs simultaneously on port 5050).*

---

#### Method B: Using Direct ZIP Download (Without Git CLI)

1. Download the ZIP file from: [https://github.com/naturis25-dev/brainstorm-portal/archive/refs/heads/main.zip](https://github.com/naturis25-dev/brainstorm-portal/archive/refs/heads/main.zip).
2. Right-click and **Extract All** to a folder on your computer.
3. Open the extracted `brainstorm-portal-main` folder.
4. Open the `backend` folder in Terminal / Command Prompt:
   - On Windows: Open the `backend` folder in File Explorer, type `cmd` or `powershell` in the address bar, and press **Enter**.
5. Run the installation and start commands:
   ```bash
   npm install
   node server.js
   ```
6. Open your web browser and go to `http://localhost:5050`.

---

### ⚠️ STRICT MANDATE: UI/UX & Brand Design Preservation

> [!CAUTION]
> **CRITICAL DIRECTIVE FOR ALL DEVELOPERS & IT ENGINEERS**:
> The User Interface (UI), User Experience (UX), interactive physics, visual layout, and exact branding color scheme of Brainstorm Atlas are **100% FINALIZED, APPROVED, AND FROZEN**.
> 
> **NO MODIFICATIONS TO THE UI/UX ARE PERMITTED**:
> 1. **DO NOT Redesign or Replace Layouts**: Under no circumstances should custom pages, responsive modals, or bento grids be replaced with generic frameworks (e.g., Bootstrap, generic Tailwind templates, or Material UI).
> 2. **Strict Color Palette Preservation**: The following exact brand hexadecimal color codes must remain strictly preserved throughout all components:
>    - **Dark Ink (`--ink`)**: `#151a1b` / `#0f172a` (Primary dark background and typography)
>    - **Warm Paper (`--paper`)**: `#f5f2ea` / `#f8fafc` (Primary light canvas)
>    - **Neon Lime (`--lime`)**: `#d9ff48` (Progressive loader glow and live accent highlights)
>    - **Action Slate Grey**: `#64748b` & `#475569` (Slanted mobile BACK buttons, footer social pills, and drawing tags)
>    - **US Royal Blue Accent (`--accent`)**: `#2563eb` (Primary interactive highlights, map hovers, and CTA badges)
>    - **Canada Crimson Accent (`--accent-ca`)**: `#dc2626` (Canadian theme toggle, brochure headers, and close button hovers)
>    - **Dark Mode Surfaces**: `#0a0d14` (Deep viewport), `#111827` (Card containers), `#1e293b` (Bento modules)
> 3. **Preserve Responsive Interaction Physics**:
>    - The mobile bottom floating dock (`.detail-floating-actions` with slanted 10-degree skewed buttons).
>    - The desktop top-right circular frosted close button (`#detailClose`).
>    - The D3 TopoJSON choropleth vector map transitions and state tooltip floating sheets.
>    - The Apple Spotlight / Raycast fuzzy search window (`Ctrl/Cmd + K`).
>    - The dark-ink 6-stage progressive loader curtain reveal.
> 
> *All backend maintenance, database switches (SQLite ↔ PostgreSQL), server deployments, and cloud storage configurations must operate seamlessly beneath this exact frontend UI/UX.*

---

```mermaid
graph TD
    A[Client / General Contractor / Fabricator] -->|Browses| B(Brainstorm Atlas Portal)
    B --> C[Interactive Geographic Map: US & Canada]
    B --> D[Built-in PDF Drawings & Erection Sheets]
    B --> E[Interactive 3D Tekla BIM Models]
    B --> F[Bento-Grid Project Case Studies]
    B --> G[Spotlight Intelligent Search & Filtering]
    H[Admin / Detailing Lead] -->|Secured Google SSO| I[Atlas Admin Dashboard & CMS]
    I -->|Manages Projects, 3D Models & Drawings| B
```

### Strategic Purpose
* **Demonstrate Detailing Scale & Geographic Reach**: Visually prove Brainstorm Infotech’s presence across 50 US States and Canadian Provinces with verified tonnage, steel categories, and project counts.
* **Instant Technical Credibility**: Enable General Contractors, Engineering Design Firms, and Steel Fabricators to inspect actual sample erection sheets, shop drawings, 3D BIM clash-detection models, and fabrication deliverables directly in their browser without downloading external software.
* **Streamline Business Development**: Empower sales engineers and leadership to deliver fluid, high-impact interactive presentations during meetings and client pitches.

---

## 2. Interactive Functions & Core Public Features

### 2.1 Interactive North America Geographic Map (D3 & TopoJSON)
* **What it does**: Renders a vector-accurate, high-performance choropleth map of the United States and Canada.
* **Interactive Capabilities**:
  * **Dynamic State Shading**: States are color-coded based on detailing project density.
  * **Interactive Hover Tooltips**: Moving over any state reveals the exact project count, total tonnage detailed, and key featured projects.
  * **State Filtering**: Clicking a state instantly filters the project grid to show only works delivered in that jurisdiction.
  * **Country Toggle**: Switch seamlessly between **United States** and **Canada** with smooth animated geographic transitions.
  * **High-Contrast Dark & Light Mode Boundary Lines**: Custom stroke rules ensure state borders remain crisp and distinct in both themes.

### 2.2 Proportional Edge-to-Edge Filter System
* **What it does**: A two-row filter bar aligned with the outer edges of the map card.
* **Layout Design**:
  * Row 1 houses the search trigger, status buttons, and category chips.
  * Row 2 displays secondary categories distributed with equal width proportions (`desktop-grid-chip`) and matching gaps.
  * Active chips show bright accent indicators and live counter badges.

### 2.3 Apple Spotlight / Raycast Interactive Search
* **What it does**: Provides a keyboard-first, ultra-fast search experience (`Cmd/Ctrl + K` or search bar click).
* **Key Features**:
  * **Spotlight Modal**: Opens with an Apple-style backdrop blur and scale-in animation.
  * **Instant Live Fuzzy Matching**: Searches across project titles, client names, state/province, steel tonnage, category, and detailing steel type simultaneously.
  * **Direct Keyboard Navigation**: Supports `Arrow Up/Down` selection, `Enter` to open project details, and `Esc` to dismiss.

### 2.4 Built-In Drawing PDF Viewer & Navigation Dock
* **What it does**: An embedded, multi-document PDF drawing viewer enabling instant inspection of actual engineering deliverables without requiring Acrobat or third-party apps.
* **Features**:
  * **Multi-Category Drawing Library**: Covers Erection Drawings, Anchor Bolt Plans, Framing Plans, Section Sheets, Curved Stairs, Dumpster Gates, Ladders, Monumental Stairs, Shop Sheets, and 3D Snaps across US, Canada, Quebec, and UAE.
  * **Floating Navigation Dock**: Bottom-docked glassmorphism controls (`Prev (←)` and `Next (→)`) with tabular sheet counters (`1 of 11`).
  * **Direct Download**: Single-click high-resolution PDF download with download notification toast.

### 2.5 3D BIM & Tekla Structural Model Viewer
* **What it does**: Employs WebGL-accelerated 3D rendering via `<model-viewer>` for real-time 3D steel model exploration.
* **Capabilities**:
  * Rotate, pan, zoom, and inspect structural steel connections, trusses, columns, and embeds in full 3D.
  * Supports compressed, Draco-optimized GLB models with smooth 60fps orbiting.

### 2.6 Bento-Grid Project Detail Modal
* **What it does**: Opens an immersive, Apple/Linear-inspired bento grid showcasing comprehensive project specifications.
* **Sections Included**:
  * Detailing specifications (Tonnage, Steel Codes, Detailing Scope, Erection deliverables).
  * High-definition photo gallery with lightboxes and zoom.
  * Embedded video walk-throughs.
  * AISC / CISC compliance standards and year of delivery.

### 2.7 Brochure Viewer & Instant Download Flow
* **What it does**: Enables clients to view the complete corporate Brainstorm Infotech brochure inline or trigger an instant download with an animated toast status banner.

### 2.8 Dark-Ink Progressive Loader Experience
* **What it does**: Displays a dark-ink (`#151a1b`) loader with neon-lime glowing progress tracking.
* **Progression Stages**:
  $$\text{00\% Initializing} \longrightarrow \text{24\% Map} \longrightarrow \text{48\% Data} \longrightarrow \text{72\% Drawings} \longrightarrow \text{90\% Polish} \longrightarrow \text{100\% Ready}$$
* **Reveal Animation**: Once ready, the loader executes an upward curtain reveal (`clip-path: inset(0 0 100% 0)`), smoothly unveiling the map and user interface.

### 2.9 Mobile Responsive Experience & Floating Dock
* **What it does**: Automatically detects handheld devices and reflows all desktop panels, SVG maps, and bento grids into a fluid, app-like mobile experience.

---

## 3. Mobile vs. Desktop Version: Features & Architecture Differences

Brainstorm Atlas utilizes a custom adaptive architecture engineered to deliver optimal ergonomics on both high-resolution multi-monitor desktop workstations and touch-first mobile smartphones.

```mermaid
graph LR
    Screen[Viewport Breakpoint Engine] --> Desktop[Desktop > 768px]
    Screen --> Mobile[Mobile <= 768px]

    Desktop --> D_Close[Top-Right Frosted Close Button]
    Desktop --> D_Arrows[Fixed Center Side Nav Arrows]
    Desktop --> D_Grid[Multi-Column Bento Grid]
    Desktop --> D_Chips[Proportional Equal-Width Chip Grid]
    Desktop --> D_Nav[Full Glassmorphic Top Navbar]

    Mobile --> M_Back[Bottom Slanted Floating BACK Dock]
    Mobile --> M_SmartArrow[Collision-Aware Auto-Hiding Arrows]
    Mobile --> M_Stack[Single-Column Stack + Justified Text]
    Mobile --> M_Scroll[Kinetic Momentum Scrollbar]
    Mobile --> M_Dock[Persistent iOS/Android Glass Dock]
```

---

### 3.1 Comprehensive Desktop vs. Mobile Feature Comparison Matrix

| Feature / Component | 🖥️ Desktop Version (`> 768px`) | 📱 Mobile Version (`≤ 768px`) |
| :--- | :--- | :--- |
| **Top Navigation Bar** | Full horizontal glass bar with text labels, category dropdowns, jump-and-land website button, and secret admin proximity button. | Minimalist compact header; navigation shifts to the persistent iOS/Android bottom floating glass dock. |
| **Project Detail Dismissal** | **Top-Right Frosted Close (`X`)**: Fixed `44x44px` circular frosted button with 90° rotation hover effect. Bottom back button is **hidden**. | **Bottom Slanted `BACK` Dock**: Floating `42px` slanted (10° skew) button docked in the bottom-right for instant one-thumb navigation. Top close button is **hidden**. |
| **Side Navigation Arrows** | Vertically fixed at 50% screen height for continuous one-click jumping between projects. | **Smart Content-Aware Collision**: Arrows automatically fade out (`opacity: 0`) when scrolling over project descriptions to ensure 100% text readability. |
| **Floating Action Dock** | Displays the scroll-activated **Back-to-Top FAB** when browsing deep down project pages. | Combined floating action dock housing both the **Slanted `BACK` Button** and scroll-activated **Back-to-Top FAB**. |
| **Category & Status Filters** | Two-row proportional edge-to-edge grid chips (`desktop-grid-chip`) with matching mathematical gap distribution. | Horizontal kinetic swipe bar with momentum scrolling (`-webkit-overflow-scrolling: touch`) and compact badge chips. |
| **Project Bento Grid Layout** | Multi-column Bento Grid (2 to 4 responsive columns) with expanded scope tags and large photo lightboxes. | Single-column stacked vertical cards with auto-adjusting aspect ratios. |
| **Project Overview Description** | Standard left-aligned paragraphs with spacious line-height. | **Full Justification & Hyphenation** (`text-align: justify; hyphens: auto;`) for clean magazine-style readability on narrow screens. |
| **Sub-Navigation Tabs** | Full verbose tab labels (`.d-tab-full`, e.g. "Similar Projects", "Specifications"). | Compact abbreviated tab labels (`.d-tab-short`, e.g. "Similar", "Specs") to prevent horizontal line wrapping. |
| **Geographic Map Experience** | Interactive side-by-side D3.js vector map with hover tooltip balloons and right-hand side drawer panel (`540px`). | Responsive vector map; tapping any state triggers an animated bottom-sheet card with project counts and tonnage. |
| **PDF Drawing Viewer** | Full-width PDF sheet canvas with header zoom buttons and bottom pagination dock (`1 of 11`). | Touch-centered pagination dock (`← Prev` / `Next →`), pinch-to-zoom enabled, desktop zoom buttons suppressed for maximum view space. |
| **Spotlight / Quick Search** | Centered floating modal with `Ctrl/Cmd + K` keyboard shortcut and arrow navigation. | Fullscreen edge-to-edge touch search sheet with instant tap-to-clear and optimized software keyboard layout. |
| **Footer Social Bar** | Full branding row with large `42px` slate-gray rounded icon buttons. | Compact `26px` touch-friendly icon buttons arranged in an elegant horizontal strip. |

---

### 3.2 Navigation & Dismissal Architecture (Desktop Top Close vs. Mobile Slanted Back Dock)

* **Desktop Workstation Mode (`> 768px`)**:
  * Users expect top-corner dismissal conforming to desktop UI standards (macOS / Windows modal conventions).
  * `#detailClose` is fixed at `top: 24px; right: 28px;` with high z-index (`99999`) and frosted blur background (`backdrop-filter: blur(12px)`).
  * Hovering executes a smooth 90-degree clockwise spin with transition physics (`cubic-bezier(0.16, 1, 0.3, 1)`).
  * The bottom slanted `BACK` button is forcefully hidden (`display: none !important;`) to keep desktop presentation pristine.

* **Mobile Smartphone Mode (`≤ 768px`)**:
  * Reaching top corners on tall mobile displays causes thumb strain. Navigation is moved to the **bottom-right thumb zone**.
  * `.detail-floating-back-btn` renders as a custom slanted pill (`transform: skewX(-10deg)` with counter-skewed text `transform: skewX(10deg)`), styled in slate gray (`#64748b`).
  * Tapping instantly executes `window.closeDetail()` and restores the previous scroll position and history hash.
  * The top close button is forcefully hidden (`display: none !important;`) to prevent viewport clutter.

---

### 3.3 Smart Content-Aware Collision Detection (Side Arrow Auto-Hiding)

On mobile screens, fixed side navigation arrows (`prev` and `next`) can visually overlap reading paragraphs. Brainstorm Atlas incorporates an **Intersection / Bounding Collision Engine**:
1. During scroll, the client monitors bounding coordinates of `.bento-overview-card` and overview descriptions relative to the viewport center (`window.innerHeight * 0.38` to `0.62`).
2. When text scrolls into the arrow zone, `nav-arrows-hidden` is attached, smoothly fading the arrows out (`opacity: 0; pointer-events: none`).
3. As the user reaches media or the similar projects section, the arrows seamlessly fade back in for project switching.

---

### 3.4 Bento Grid Layout & Justified Mobile Typography

* **Mobile Typographic Polish**:
  * Description paragraphs on mobile activate hyphenation rules:
    ```css
    .bento-overview-card p,
    [id^="sec-overview-"] p {
      text-align: justify !important;
      text-justify: inter-word !important;
      hyphens: auto !important;
      -webkit-hyphens: auto !important;
    }
    ```
  * Subnav bars automatically swap text nodes (`.d-tab-full` hidden, `.d-tab-short` visible), keeping the active section tabs on a single sleek line without horizontal wrapping.

---

### 3.5 iOS & Android Bottom Floating Glass Dock

* **Persistent Glassmorphism Tab Bar**:
  * Fixed at bottom (`bottom: 20px; right: 16px;`) with `backdrop-filter: blur(20px)` and safe-area inset support (`env(safe-area-inset-bottom)`).
  * Houses quick-switch actions for:
    1. 🗺️ **Map & Projects**: Immediate return to the geographic explorer.
    2. 📐 **Sample Drawings**: Direct access to PDF erection sheets and fabrication plans.
    3. 📄 **Brochure**: Instant corporate capability deck viewer.
    4. 🌓 **Theme Toggle**: One-tap Dark/Light mode switcher with tactile haptic-style micro-bounce animation (`scale(0.96)` on press).

---

### 3.6 Adaptive Responsive Breakpoints & Performance Throttling

* **Breakpoints**:
  * **`< 560px` (Compact Mobile)**: Hero stats reflow into high-density 2x2 grid tiles; loader counter scales to `76px`; header actions collapse into simplified icons.
  * **`560px – 768px` (Standard Handheld)**: Search bar switches into an edge-to-edge touch trigger; filter pills enable kinetic swiping.
  * **`768px – 1024px` (Tablets / iPad)**: Map and project listing switch from side-by-side to a stacked master-detail layout with preserved map aspect ratios.
* **Mobile WebGL Optimization**:
  * `<model-viewer>` dynamically lowers shadow fidelity and polygon sample rates on mobile GPUs to ensure constant 60fps orbiting without battery drain.

---

## 4. Atlas Admin Dashboard & Management System

The **Atlas Admin Dashboard** is a built-in content management system that gives project managers and detailing directors full control over the portfolio.

```mermaid
flowchart TD
    User([Admin User]) --> AccessChoice{Access Method}
    AccessChoice -->|Mouse Proximity Trigger| SecretBtn[Top-Left Secret Corner Hover]
    AccessChoice -->|Direct Navigation| LoginView[In-App #view-login]
    
    LoginView --> AuthType{Authentication}
    AuthType -->|Google SSO| GoogleSSO[Google Identity Services]
    AuthType -->|Fallback Pass| DirectAuth[Constant-Time Cryptographic Auth]
    
    GoogleSSO --> DomainVerify{Domain == @brainstorminfotech.co.in?}
    DomainVerify -->|Yes| GrantToken[Issue 24-hr Bearer Token]
    DomainVerify -->|No| Reject401[401 Unauthorized]
    DirectAuth --> GrantToken
    
    GrantToken --> AdminDashboard[#view-admin Dashboard]
    AdminDashboard --> ProjectCRUD[Create, Edit, Delete Projects]
    AdminDashboard --> MediaPipeline[Upload Photos, Videos & 3D GLB Models]
    AdminDashboard --> DrawingsManager[Manage PDF Sample Drawings]
    AdminDashboard --> AdminManage[Manage Secondary Admins]
    AdminDashboard --> AuditLogs[Inspect Security Audit Trail]
```

### 4.1 Discreet Access Mechanisms
* **Top-Left Invisible Proximity Trigger**: Moving the mouse within 150px of the screen's top-left corner smoothly fades in a subtle administrative sign-in shield.
* **Direct Single-Page Switch**: Invoking `window.showView('login')` switches the view immediately to the login container.

### 4.2 Enterprise Authentication & Google SSO
* **Google Identity Services (GSI)**: Integrated with OAuth2 client-side and server-side token verification (`client.verifyIdToken`).
* **Domain Whitelisting**: Login is strictly guarded to corporate `@brainstorminfotech.co.in` Google Workspace accounts.
* **Ephemeral Session Tokens**: Authenticated sessions receive a 256-bit cryptographic token (`crypto.randomBytes(32)`), which expires automatically after 24 hours.

### 4.3 Real-Time Portfolio Analytics & KPI Row
* Dashboard displays live metric cards:
  * **Total Active Projects**: Count of all curated portfolio entries.
  * **US Detailing Projects**: Number of projects in the United States.
  * **Canada Detailing Projects**: Number of projects in Canadian provinces.
  * **Cumulative Steel Tonnage**: Total tonnage fabricated and detailed across all entries.

### 4.4 Live Search & Multi-Column Project Table
* **Instant Filtering**: Real-time keystroke filtering across project titles, states, and categories.
* **Multi-Column Sorting**: Clickable table headers (`TITLE`, `STATE`, `COUNTRY`, `TONS`, `YEAR`) with ascending/descending sort toggles.

### 4.5 Project Creator & Editor Modal (CRUD)
Clicking **"+ Add Project"** or **"Edit"** opens `#projectModal` equipped with:
* **Basic Metadata**: Title, Country selector (`US` / `CA`), State/Province selector, Year of Delivery, Steel Tonnage (Tons).
* **Key Project Flag**: Checkbox to spotlight the project on the home hero banner.
* **Steel Detailing Service Checklist**:
  * *Structural Steel Detailing*
  * *Connection Design*
  * *3D BIM Modeling (Tekla)*
  * *Steel Fabrication Drawings*
  * *Erection Drawings*
  * *Shop Drawings*
  * *Advance Steel Modeling*
  * *Rebar Detailing*
  * *Stairs & Railing Detailing*
* **Detailed Scope**: Rich text area for structural specifications and engineering notes.

### 4.6 Drag-and-Drop Media & 3D Draco Pipeline
* **High-Res Photo Gallery**: Drag-and-drop zone supporting up to 20 images with thumbnail previews and one-click removal.
* **3D Tekla Model Processing**: Uploading a `.glb` structural model triggers the background Node Draco optimizer (`optimizer.mjs`) to compress geometry for fast WebGL loading.
* **Video & Documents**: Drag-and-drop upload for walkthrough videos (`.mp4`, `.webm`) and specification sheets (`.pdf`).
* **Automatic Cloud Storage Push**: When AWS S3 or Cloudflare R2 is enabled, media files stream directly to CDN storage.

### 4.7 Sample Drawings Manager
* Admin interface to upload new PDF engineering drawings, automatically assigning category tags:
  * *Erection Sheets*
  * *Anchor Bolt Plans & Details*
  * *Framing Plans*
  * *Section Sheets*
  * *Miscellaneous Steel (Stairs, Handrails, Ladders)*
  * *Shop Fabrication Drawings*

### 4.8 Secondary Admin Access Management
* Allows Super Admins to invite and authorize secondary project managers (`MANAGER` role).
* Automatically validates that newly created admin accounts belong to the `@brainstorminfotech.co.in` corporate domain.

### 4.9 Security Audit Logging & Compliance
* The backend logs every administrative action (`CREATE_PROJECT`, `UPDATE_PROJECT`, `DELETE_PROJECT`, `LOGIN`).
* Records **Admin Username/Email**, **Action Type**, **Target Project ID**, and **Timestamp** to satisfy IT governance audits.

---

## 5. Technology Stack & Code Architecture

```
brainstorm-portal/
├── backend/
│   ├── routes/
│   │   ├── auth.js          # Google OAuth2 verification, session token auth
│   │   ├── projects.js      # Parameterized project CRUD & filtering
│   │   ├── metadata.js      # State, province & steel categories metadata
│   │   └── media.js         # Multer disk upload & S3/R2 cloud storage pipeline
│   ├── database.js          # SQLite driver (better-sqlite3 for local dev)
│   ├── database.pg.js       # PostgreSQL driver (pg for cloud production)
│   ├── db.js                # Dynamic DB switch (SQLite <-> Postgres)
│   ├── optimizer.mjs        # 3D Draco GLB mesh compression engine
│   └── server.js            # Express server, Helmet, Rate-limiting, Compression
│
└── frontend/
    ├── index.html           # Main SPA markup, loader, views & modals
    ├── css/style.css        # Enterprise design system & responsive styling
    ├── js/
    │   ├── config.js        # Global environment endpoints & categories
    │   ├── map.js           # D3.js vector map renderer
    │   ├── map-data.js      # TopoJSON geo-data for US & Canada
    │   ├── atlas-intro.js   # Contextual intro modal onboarding
    │   └── app.js           # Core state manager, modals, PDF viewer, search, admin
    └── assets/              # Images, PDFs, 3D models, vendor libraries
```

### Why Vanilla JavaScript & D3.js for Frontend
1. **Zero Framework Overhead**: No React/Angular/Vue hydration lag; renders immediately with sub-50ms First Contentful Paint.
2. **Deterministic D3 Vector Rendering**: Direct SVG path manipulation delivers smooth zooming and state boundary hover effects without virtual DOM diffing bottlenecks.
3. **Long-Term Maintainability**: Plain HTML5/CSS3/JS runs natively in all modern browsers for decades with zero breaking package deprecations.

### Why Node.js & Express for Backend
1. **Non-Blocking Asynchronous I/O**: Efficiently handles concurrent API requests and large multi-megabyte PDF and 3D model streams.
2. **Universal JavaScript**: Unified data structures between frontend and backend.

### Dual-Engine Database Architecture (SQLite & PostgreSQL)
* **Local Mode**: Uses `better-sqlite3`—a zero-configuration, synchronous file database ideal for local development.
* **Cloud Mode**: Seamlessly switches to `pg` (PostgreSQL) when `DB_CLIENT=pg` is set in production, connecting to AWS RDS, Supabase, Neon, or Railway with identical parameterized query APIs.

### Cloud Storage Engine (AWS S3 & Cloudflare R2)
* Local uploads are stored in `/uploads`, but with `S3_BUCKET` configured, the backend automatically pipes uploads to **AWS S3 / Cloudflare R2** and serves assets over high-speed CDNs.

### Complete Environment Variables Reference (.env)

The application configuration is managed via standard environment variables loaded at startup via `dotenv`. Create a `.env` file inside the `/backend` directory:

| Variable | Type | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Number | `5050` | The network port the Express application server listens on. |
| `NODE_ENV` | String | `development` | Deployment environment mode (`development` or `production`). |
| `CORS_ORIGIN` | String | `*` (true) | Allowed CORS origin(s) for API security. |
| `DATA_DIR` | Path | `./uploads` | Persistent directory path for media uploads and local database files. |
| `DB_CLIENT` | String | `sqlite` | Database engine selector (`sqlite` for local dev file DB or `pg` for PostgreSQL). |
| `DATABASE_URL` | URI String | *None* | PostgreSQL connection string (e.g., `postgres://user:pass@host:5432/dbname`). Required when `DB_CLIENT=pg`. |
| `GOOGLE_CLIENT_ID` | String | *None* | Google OAuth 2.0 Web Client ID for Google Identity Services SSO. |
| `ADMIN_EMAIL_DOMAIN` | String | `@brainstorminfotech.co.in` | Restricted email domain for administrative CMS logins. |
| `S3_ENDPOINT` | URL | *None* | S3-compatible API endpoint URL (AWS S3 or Cloudflare R2). |
| `S3_ACCESS_KEY` | String | *None* | Cloud storage access key ID. |
| `S3_SECRET_KEY` | String | *None* | Cloud storage secret access key. |
| `S3_BUCKET` | String | *None* | Target cloud storage bucket name. |
| `S3_PUBLIC_URL` | URL | *None* | Public CDN/subdomain URL for serving media assets. |

#### Production `.env.example` Template

```ini
# ==============================================================================
# Brainstorm Atlas - Environment Configuration Template
# ==============================================================================

# Server & Network Configuration
PORT=5050
NODE_ENV=production
CORS_ORIGIN=https://atlas.brainstorminfotech.co.in

# Database Configuration (sqlite | pg)
DB_CLIENT=sqlite
# If using PostgreSQL in production, set DB_CLIENT=pg and uncomment DATABASE_URL:
# DB_CLIENT=pg
# DATABASE_URL=postgres://postgres:password@rds-host.amazonaws.com:5432/brainstorm_atlas

# Google Single Sign-On (SSO) Authentication
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
ADMIN_EMAIL_DOMAIN=@brainstorminfotech.co.in

# Cloud Storage Engine - AWS S3 / Cloudflare R2 (Optional)
# Leave blank to store media files in the local ./uploads directory
# S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
# S3_ACCESS_KEY=your_access_key_id
# S3_SECRET_KEY=your_secret_access_key
# S3_BUCKET=brainstorm-atlas-media
# S3_PUBLIC_URL=https://media.brainstorminfotech.co.in
```

---

## 6. Enterprise Security Architecture

```mermaid
flowchart LR
    User[Client / Browser] -->|Cloudflare WAF / DDoS| Cloudflare[Cloudflare Edge CDN]
    Cloudflare -->|HTTPS / TLS 1.3| Server[Node.js Express Server]
    subgraph Security Layer
        Server --> Helmet[Helmet Security Headers]
        Server --> RateLimit[Express Rate Limiter]
        Server --> AuthGuard[Google OAuth2 ID Token Verification]
        Server --> SafeExec[Safe execFile Process Isolation]
    end
    AuthGuard --> DB[(PostgreSQL / SQLite Parameterized DB)]
```

### Security Features Breakdown

| Vector / Requirement | Implementation | Security Benefit |
| :--- | :--- | :--- |
| **Authentication** | Google OAuth2 ID Token verification (`client.verifyIdToken`) + domain whitelist (`@brainstorminfotech.co.in`) | Prevents unauthenticated access; only verified company emails can manage projects. |
| **SQL Injection (SQLi)** | 100% Parameterized queries (`$1, $2, ...` in Postgres, `?` in SQLite) | Completely neutralizes SQL injection attacks. |
| **Command Injection (RCE)** | `child_process.execFile` with argument arrays | Prevents arbitrary shell command execution. |
| **Anti-Brute Force** | `express-rate-limit` (30 attempts / 15 min per IP on `/api/auth`) | Mitigates credential stuffing and DDoS attempts. |
| **Timing Attacks** | `crypto.timingSafeEqual` constant-time password comparison | Defends against side-channel timing attacks. |
| **Clickjacking & Sniffing** | `helmet` (`X-Frame-Options`, `X-Content-Type-Options: nosniff`) | Protects against UI redressing and MIME confusion attacks. |
| **Denial-of-Service** | 50MB strict body parser limit | Protects backend memory from buffer overflow payloads. |

---

## 7. Client Showcase & Pitching Guide

When presenting Brainstorm Atlas to prospective clients (Steel Fabricators, General Contractors, Structural Engineering Firms), follow this **5-minute winning demonstration flow**:

### Step-by-Step Live Demo Walkthrough

1. **The Entrance (0:00 - 0:30)**:
   - Refresh the page to showcase the **dark-ink progressive loader**. Point out the real-time initialization steps, highlighting attention to precision and technology.
2. **The Geographic Scope (0:30 - 1:45)**:
   - Open on the **Interactive Map**. Hover over major steel hub states (e.g., Texas, California, Arizona, Ontario, Alberta).
   - *Key Talking Point*: *"We have detailed over 100,000+ tons of structural steel across North America. Our detailing teams are fully versed in both US (AISC/NISD) and Canadian (CISC) building standards."*
   - Toggle between **United States** and **Canada** to show bilateral coverage.
3. **Category & Spotlight Search (1:45 - 2:30)**:
   - Click category filters like **Industrial**, **Data Center**, or **Stadium**.
   - Press `Cmd/Ctrl + K` to open the **Spotlight Search**. Type *"Hospital"* or *"Stairs"* to demonstrate instant millisecond filtering.
4. **Engineering Deliverables: PDF Drawing Viewer (2:30 - 3:45)**:
   - Click the **Drawings** tab in the top navigation or bottom dock.
   - Open a set of **Erection Sheets**, **Anchor Bolt Plans**, or **Curved Stairs & Railings**.
   - Use the bottom floating dock to flip between sheets (`Next →`).
   - *Key Talking Point*: *"Clients can review our exact shop drawings, framing plans, and erection sheets directly in the browser with full clarity."*
5. **Interactive 3D BIM & Bento Showcase (3:45 - 5:00)**:
   - Click into a flagship project card (e.g., *Centennial Surgical Center* or *Thermal Energy Generator*).
   - Show the bento grid: steel tonnage, AISC specs, photo gallery, and rotate the **3D Tekla BIM model**.
   - Conclude by clicking **Download Brochure** to provide the client with the offline collateral package.

---

### Tailored Pitching Points for Stakeholders

* **For Steel Fabricators**: Emphasize zero clash rates on site, accurate shop drawings, and erection sequence clarity.
* **For General Contractors & EPCs**: Highlight scheduling reliability, large-tonnage capacity (10,000+ tons per project), and BIM coordination.
* **For BIM / VDC Managers**: Point out Tekla Structures, Advance Steel, and automated clash-detection workflows.
