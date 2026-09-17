# -*- coding: utf-8 -*-
with open('js/app.js', 'r', encoding='utf-8') as f:
    c = f.read()

start_marker = "const scopeBadges = [\n      'Structural Steel Detailing',"
end_marker = "setTimeout(() => {\n        const container = document.getElementById(`mv-container-${p.id}`);"

start_pos = c.find(start_marker)
if start_pos == -1:
    print("Could not find start_marker")
    exit(1)

end_pos = c.find(end_marker, start_pos)
if end_pos == -1:
    print("Could not find end_pos")
    exit(1)

new_unified_block = """const scopeBadges = [
      'Structural Steel Detailing',
      'Connection Design',
      'Miscellaneous Steel Detailing',
      'Steel Fabrication Drawings',
      '3D Modeling (BIM)',
      'Erection Drawings',
      'Shop Drawings',
      'Advance Steel Modeling',
      'Staircase & Railing Detailing'
    ];

    const gallerySectionHtml = (p.images && p.images.length > 0) ? `
      <div id="sec-gallery-${p.id}" style="margin-top: 24px; margin-bottom: 40px; text-align: center;">
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 32px; font-weight: 800; letter-spacing: -1px; margin-bottom: 8px; font-family: 'Playfair Display', serif;">Project Gallery</h2>
          <div style="color: var(--sub); font-size: 15px;">Explore ${p.images.length} high-resolution views of this structure.</div>
        </div>
        
        <div class="project-carousel-section full-bleed-carousel">
          <div class="project-carousel-wrapper" id="projCarouselWrap-${p.id}">
            <div class="project-carousel-track" id="projCarouselTrack-${p.id}">
              ${p.images.map((img, i) => `
                <div class="carousel-card ${i === 0 ? 'active' : ''}" data-idx="${i}" onclick="window.selectCarouselSlide('${p.id}', ${i})">
                  <div class="carousel-card-inner">
                    <img loading="lazy" decoding="async" src="${img}" alt="${p.title} - View ${i + 1}" onerror="this.src='assets/logo.png'">
                    <div class="carousel-card-badge">View ${i + 1} of ${p.images.length}</div>
                    <button class="carousel-zoom-btn" title="View Fullscreen" onclick="event.stopPropagation(); window.openLightbox('${img}')">
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Active Slide Caption & Sub-Metadata -->
            <div class="carousel-caption-box" id="carouselCaption-${p.id}">
              <div class="carousel-caption-title" id="carouselTitle-${p.id}">${p.title} &mdash; View 1</div>
              <div class="carousel-caption-meta" id="carouselMeta-${p.id}">
                <span class="carousel-meta-pill">View 1 of ${p.images.length}</span>
                <span class="carousel-meta-pill">${p.category || 'Industrial'}</span>
              </div>
            </div>

            ${p.images.length > 1 ? `
              <button class="carousel-nav-btn prev" onclick="window.stepCarouselSlide('${p.id}', -1)" aria-label="Previous image">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <button class="carousel-nav-btn next" onclick="window.stepCarouselSlide('${p.id}', 1)" aria-label="Next image">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>

              <!-- Bottom Dock Control Pill -->
              <div class="carousel-dock-pill" id="projCarouselDots-${p.id}">
                <div class="carousel-dots-group">
                  ${p.images.map((_, i) => `<span class="c-dot ${i === 0 ? 'active' : ''}" onclick="window.selectCarouselSlide('${p.id}', ${i})"></span>`).join('')}
                </div>
                <button class="carousel-play-btn" id="projCarouselPlay-${p.id}" onclick="window.toggleCarouselAutoplay('${p.id}')" title="Pause Slideshow" aria-label="Toggle slideshow">
                  <svg class="icon-pause" viewBox="0 0 24 24" width="13" height="13" fill="currentColor" style="display:block;"><rect x="6" y="4" width="4" height="16" rx="1"></rect><rect x="14" y="4" width="4" height="16" rx="1"></rect></svg>
                  <svg class="icon-play" viewBox="0 0 24 24" width="13" height="13" fill="currentColor" style="display:none;"><polygon points="6 4 18 12 6 20 6 4"></polygon></svg>
                </button>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    ` : '';

    const modelSectionHtml = p.modelUrl ? `
      <div class="detail-full-block" id="sec-3d-${p.id}" style="margin-top: 36px; margin-bottom: 40px;">
        <div class="dcard-header" style="margin-bottom: 16px;">
          <h3 class="dcard-title">Interactive 3D Structural View</h3>
        </div>
        <div class="model-container" id="mv-container-${p.id}" style="min-height: 520px; display: flex; align-items: center; justify-content: center; position: relative; background-color: #0d1117; background-image: radial-gradient(circle at 50% 50%, rgba(37,99,235,0.15) 0%, transparent 70%), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 100% 100%, 30px 30px, 30px 30px; background-position: center; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.15);">
          <div id="mv-trigger-${p.id}" style="position: absolute; inset: 0; z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center; background: radial-gradient(circle at center, #161b22 0%, #0d1117 100%); cursor: pointer; transition: opacity 0.3s;">
            <div style="width: 76px; height: 76px; border-radius: 50%; background: rgba(10, 107, 204, 0.15); display: flex; align-items: center; justify-content: center; margin-bottom: 20px; border: 1px solid rgba(10, 107, 204, 0.3); box-shadow: 0 0 30px rgba(10, 107, 204, 0.2);">
              <svg viewBox="0 0 24 24" width="30" height="30" stroke="var(--accent)" stroke-width="2" fill="none" style="margin-left: 4px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            </div>
            <div style="font-size: 14px; font-weight: 700; color: white; letter-spacing: 0.5px; text-transform: uppercase;">Load 3D Structural Model</div>
            <div style="font-size: 12.5px; color: #a1a1aa; margin-top: 4px;">(Interactive Tekla BIM Viewer)</div>
          </div>

          <div class="model-loading-bar" id="mv-bar-${p.id}" style="position: absolute; inset: 0; height: 100%; display: none; flex-direction: column; background-color: #0d1117; z-index: 9;">
            <div class="model-loading-text" id="mv-text-${p.id}" style="margin-bottom: 24px; font-size: 14px; color: white;">Loading 3D Structural Model...</div>
            <div style="width: 240px; height: 6px; background: rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden; position: relative;">
              <div class="model-loading-fill" id="mv-fill-${p.id}" style="position: absolute; left: 0; top: 0; height: 100%; width: 0%; background: var(--accent); transition: width 0.3s cubic-bezier(0.25, 1, 0.5, 1);"></div>
            </div>
          </div>
        </div>
      </div>
    ` : '';

    const bentoBoxHtml = `
      <div class="bento-dashboard-grid" style="margin-top: 36px; margin-bottom: 40px;">
        <!-- Left Column (Tall Card): Overview & Highlights -->
        <div class="bento-card bento-overview-card" id="sec-overview-${p.id}">
          <div>
            <h3 class="dcard-title" style="margin-bottom: 16px;">Project Overview</h3>
            <p style="white-space: pre-wrap; font-size: 15px; line-height: 1.7; color: var(--sub);">${p.description || 'No description provided.'}</p>
          </div>

          <div class="bento-highlights-row" style="margin-top: 32px; display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px;">
            <div style="background: rgba(0, 112, 243, 0.05); border: 1px solid rgba(0, 112, 243, 0.12); padding: 12px 14px; border-radius: 12px; display: flex; align-items: center; gap: 10px;">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="var(--accent)" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
              <span style="font-size: 12.5px; font-weight: 700; color: var(--ink);">High Precision</span>
            </div>
            <div style="background: rgba(0, 112, 243, 0.05); border: 1px solid rgba(0, 112, 243, 0.12); padding: 12px 14px; border-radius: 12px; display: flex; align-items: center; gap: 10px;">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="var(--accent)" stroke-width="2" fill="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              <span style="font-size: 12.5px; font-weight: 700; color: var(--ink);">Efficient Delivery</span>
            </div>
            <div style="background: rgba(0, 112, 243, 0.05); border: 1px solid rgba(0, 112, 243, 0.12); padding: 12px 14px; border-radius: 12px; display: flex; align-items: center; gap: 10px;">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="var(--accent)" stroke-width="2" fill="none"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              <span style="font-size: 12.5px; font-weight: 700; color: var(--ink);">Engineering Value</span>
            </div>
          </div>
        </div>

        <!-- Right Column Top Card: Specs Table -->
        <div class="bento-card bento-specs-card">
          <h3 class="dcard-title" style="margin-bottom: 16px;">Project Details</h3>
          <div class="p-specs-table">
            <div class="p-spec-row">
              <span class="p-spec-lbl">Timeline</span>
              <span class="p-spec-val">${p.year || '2026'} &bull; 8 Weeks</span>
            </div>
            <div class="p-spec-row">
              <span class="p-spec-lbl">Location</span>
              <span class="p-spec-val">${p.state}, ${p.country === 'US' ? 'USA' : 'Canada'}</span>
            </div>
            <div class="p-spec-row">
              <span class="p-spec-lbl">Steel Tonnage</span>
              <span class="p-spec-val">${(p.tons || 0).toLocaleString()} Tons</span>
            </div>
            <div class="p-spec-row">
              <span class="p-spec-lbl">Project Type</span>
              <span class="p-spec-val">${p.category || 'Industrial'}</span>
            </div>
          </div>
        </div>

        <!-- Right Column Bottom Card: Scope Badges -->
        <div class="bento-card bento-scope-card">
          <h3 class="dcard-title" style="margin-bottom: 16px;">Project Scope</h3>
          <div class="p-scope-badge-grid">
            ${scopeBadges.map(b => `<span class="p-scope-badge">${b}</span>`).join('')}
          </div>
        </div>
      </div>
    `;

    const videoSectionHtml = p.video ? `
      <div class="detail-full-block" id="sec-walkthrough-${p.id}" style="margin-top: 36px; margin-bottom: 40px;">
        <h3 class="dcard-title" style="margin-bottom: 6px;">Project Walkthrough Video</h3>
        <div style="font-size: 13px; color: var(--sub); margin-bottom: 16px;">Watch the walkthrough video for ${p.title}.</div>
        <div class="detail-video-wrap">${renderVideo(p.video)}</div>
      </div>
    ` : '';

    const similarProjectsHtml = similarHtml ? `
      <div class="detail-full-block" id="sec-similar-${p.id}">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
          <h3 class="dcard-title">Similar Projects</h3>
          <button class="btn-sec" onclick="document.getElementById('detailClose')?.click()" style="font-size: 13px;">View All Projects &rarr;</button>
        </div>
        <div class="similar-projects-row">
          ${similarHtml}
        </div>
      </div>
    ` : '';

    let tabsHtml = `
      ${p.images && p.images.length > 0 ? `<button class="d-tab active" onclick="document.getElementById('sec-gallery-${p.id}')?.scrollIntoView({behavior:'smooth'})">Project Views</button>` : ''}
      ${p.modelUrl ? `<button class="d-tab" onclick="document.getElementById('sec-3d-${p.id}')?.scrollIntoView({behavior:'smooth'})">3D Model</button>` : ''}
      <button class="d-tab" onclick="document.getElementById('sec-overview-${p.id}')?.scrollIntoView({behavior:'smooth'})">Overview</button>
      ${p.video ? `<button class="d-tab" onclick="document.getElementById('sec-walkthrough-${p.id}')?.scrollIntoView({behavior:'smooth'})">Walkthrough</button>` : ''}
      ${similarHtml ? `<button class="d-tab" onclick="document.getElementById('sec-similar-${p.id}')?.scrollIntoView({behavior:'smooth'})">Similar Projects</button>` : ''}
    `;

    wrap.innerHTML = `
      <div class="detail-subnav-bar">
        ${tabsHtml}
      </div>

      ${gallerySectionHtml}
      ${modelSectionHtml}
      ${bentoBoxHtml}
      ${videoSectionHtml}
      ${similarProjectsHtml}
    `;

    """

c = c[:start_pos] + new_unified_block + c[end_pos:]

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(c)

print("Unified layout applied to app.js!")
