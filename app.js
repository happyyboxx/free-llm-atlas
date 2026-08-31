// ===== Data Loading with Caching =====
let providersData = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

// ===== i18n System =====
let currentLang = localStorage.getItem('lang') || 'en';
let i18nData = null;

// ===== Cost Calculator State =====
let calculatorState = {
  monthlyInputTokens: 1000000,
  monthlyOutputTokens: 500000,
  inputOutputRatio: '10:1',
  selectedProviders: []
};

// ===== Share State =====
let shareState = {
  baseUrl: window.location.origin + window.location.pathname
};

// ===== Comparison State =====
let selectedProviders = new Set();

// ===== Theme System =====
let currentTheme = localStorage.getItem('theme') || 'dark';

function setTheme(theme) {
  currentTheme = theme;
  localStorage.setItem('theme', theme);
  document.documentElement.setAttribute('data-theme', theme);

  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });

  if (window.updateCanvasTheme) window.updateCanvasTheme();
}

// ===== I18n =====
async function loadI18n() {
  try {
    const res = await fetch('i18n.json');
    i18nData = await res.json();
  } catch (e) {
    console.error('Failed to load i18n:', e);
    i18nData = { en: {}, zh: {} };
  }
}

function t(key) {
  if (!key) return '';
  return i18nData?.[currentLang]?.[key] || i18nData?.en?.[key] || key;
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang;
  applyI18n();
  if (providersData) {
    renderProviders(providersData.providers);
    renderStatusGrid(providersData.providers);
    updateCompareSelects();
  }
}

function applyI18n() {
  document.title = t('site_title');

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = t(key);
    } else {
      el.textContent = t(key);
    }
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
  });

  // Language toggle button
  const langBtnText = document.getElementById('lang-btn-text');
  if (langBtnText) {
    langBtnText.textContent = currentLang === 'en' ? '🇨🇳 中文' : '🇺🇸 English';
  }

  // Theme toggle buttons
  document.querySelectorAll('.theme-btn').forEach(btn => {
    const theme = btn.dataset.theme;
    btn.title = t(theme === 'light' ? 'theme_light' : 'theme_dark');
  });

  // Update select options
  updateSelectOptions();
}

function updateSelectOptions() {
  const tierFilter = document.getElementById('tier-filter');
  if (tierFilter) {
    tierFilter.options[0].text = t('filter_tier_all');
    tierFilter.options[1].text = t('filter_tier_permanent');
    tierFilter.options[2].text = t('filter_tier_trial');
    tierFilter.options[3].text = t('filter_tier_local');
  }

  const statusFilter = document.getElementById('status-filter');
  if (statusFilter) {
    statusFilter.options[0].text = t('filter_status_all');
    statusFilter.options[1].text = t('filter_status_active');
    statusFilter.options[2].text = t('filter_status_degraded');
    statusFilter.options[3].text = t('filter_status_offline');
    statusFilter.options[4].text = t('filter_status_unknown');
  }

  // Status grid filters
  const statusTierFilter = document.getElementById('status-tier-filter');
  if (statusTierFilter) {
    statusTierFilter.options[0].text = t('filter_tier_all');
    statusTierFilter.options[1].text = t('filter_tier_permanent');
    statusTierFilter.options[2].text = t('filter_tier_trial');
    statusTierFilter.options[3].text = t('filter_tier_local');
  }

  const statusStatusFilter = document.getElementById('status-status-filter');
  if (statusStatusFilter) {
    statusStatusFilter.options[0].text = t('filter_status_all');
    statusStatusFilter.options[1].text = t('filter_status_active');
    statusStatusFilter.options[2].text = t('filter_status_degraded');
    statusStatusFilter.options[3].text = t('filter_status_offline');
    statusStatusFilter.options[4].text = t('filter_status_unknown');
  }
}

// ===== Data Loading =====
async function fetchProviders() {
  const now = Date.now();
  if (providersData && (now - lastFetchTime) < CACHE_DURATION) return providersData;

  try {
    const res = await fetch('data/providers.json?' + now, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    providersData = data;
    lastFetchTime = now;
    return data;
  } catch (e) {
    console.error('Fetch error:', e);
    showToast(t('toast_error'), 'error');
    return null;
  }
}

// ===== Optimized Background Animation =====
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animationFrameId = null;
let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let lastTime = 0;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.radius = Math.random() * 2.5 + 1.0;
    this.opacity = Math.random() * 0.5 + 0.5;
    this.color = currentTheme === 'dark'
      ? (Math.random() > 0.5 ? '#00ff88' : '#00d4ff')
      : (Math.random() > 0.5 ? '#00b368' : '#0090cc');
    this.originalY = this.y;
    this.amplitude = Math.random() * 30 + 15;
    this.frequency = Math.random() * 0.02 + 0.01;
    this.phase = Math.random() * Math.PI * 2;
    this.pulsePhase = Math.random() * Math.PI * 2;
  }
  update(deltaTime) {
    this.y = this.originalY + Math.sin(this.x * this.frequency + lastTime * 0.001 + this.phase) * this.amplitude;
    this.x += this.vx * deltaTime * 0.001;
    this.pulsePhase += deltaTime * 0.001;
    if (this.x < -30) this.x = canvas.width + 30;
    if (this.x > canvas.width + 30) this.x = -30;
    if (this.y < -30) this.y = canvas.height + 30;
    if (this.y > canvas.height + 30) this.y = -30;
  }
  draw() {
    const pulseOpacity = this.opacity * (0.8 + 0.2 * Math.sin(this.pulsePhase));
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = pulseOpacity * 0.15;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = pulseOpacity;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function initParticles() {
  const density = Math.min(0.0008, Math.max(0.0004, window.innerWidth * window.innerHeight / 10000000));
  const count = Math.max(50, Math.min(150, Math.floor(canvas.width * canvas.height * density)));
  particles = Array.from({ length: count }, () => new Particle());
}

function animate(timestamp) {
  if (reducedMotion) return;

  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(p => {
    p.update(deltaTime);
    p.draw();
  });

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200) {
        const opacity = 0.15 * (1 - dist / 200);
        const pulseFactor = 0.5 + 0.5 * Math.sin(lastTime * 0.001 + dist * 0.02);
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = currentTheme === 'dark'
          ? `rgba(0, 255, 136, ${opacity * pulseFactor})`
          : `rgba(0, 179, 104, ${opacity * pulseFactor * 0.8})`;
        ctx.lineWidth = Math.max(0.5, 1.5 * (1 - dist / 200));
        ctx.stroke();
      }
    }
  }

  animationFrameId = requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
  resizeCanvas();
  initParticles();
});

window.updateCanvasTheme = () => {
  particles.forEach(p => {
    p.color = currentTheme === 'dark'
      ? (Math.random() > 0.5 ? '#00ff88' : '#00d4ff')
      : (Math.random() > 0.5 ? '#00b368' : '#0090cc');
  });
};

// ===== Provider Rendering (Main Grid) =====
function renderProviders(providers) {
  const grid = document.getElementById('providers-grid');
  const search = document.getElementById('search-input').value.toLowerCase().trim();
  const tierFilter = document.getElementById('tier-filter').value;
  const statusFilter = document.getElementById('status-filter').value;

  const filtered = providers.filter(p => {
    if (search) {
      const searchable = [
        p.name,
        p.slug,
        p.models?.join(' ') || '',
        p.features?.join(' ') || '',
        p.notes || ''
      ].join(' ').toLowerCase();
      if (!searchable.includes(search)) return false;
    }
    if (tierFilter && p.tier !== tierFilter) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    return true;
  });

  const fragment = document.createDocumentFragment();

  filtered.forEach(p => {
    const card = document.createElement('article');
    card.className = 'provider-card';
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.dataset.slug = p.slug;
    card.dataset.name = p.name;

    card.innerHTML = `
      <span class="provider-status status-${p.status || 'offline'}"
            aria-label="Status: ${p.status || 'unknown'}"></span>
      <div class="card-header">
        <div class="provider-logo" aria-hidden="true">${escapeHtml(p.name.charAt(0))}</div>
        <span class="provider-tier tier-${p.tier}">${p.tier.replace('_', ' ')}</span>
      </div>
      <h3 class="provider-name">${escapeHtml(p.name)}</h3>
      <div class="provider-meta">
        <span class="meta-item"><span class="value">${p.models_count || p.models?.length || 0}</span> models</span>
        <span class="meta-item"><span class="value">${p.free_models?.length || 0}</span> free</span>
        <span class="meta-item"><span class="value">${p.context_window?.toLocaleString() || '—'}</span> ctx</span>
      </div>
      <div class="provider-features" aria-label="Features">
        ${(p.features || []).slice(0, 6).map(f => `<span class="feature-tag">${escapeHtml(f)}</span>`).join('')}
      </div>
    `;

    fragment.appendChild(card);
  });

  grid.textContent = '';
  grid.appendChild(fragment);

  grid.querySelectorAll('.provider-card').forEach(card => {
    const open = () => openModalBySlug(card.dataset.slug);
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  });

  updateStats(providers);
}

// ===== Status Grid (Enhanced) =====
function renderStatusGrid(providers) {
  const grid = document.getElementById('provider-grid');
  const loadingGrid = document.getElementById('status-loading-grid');
  const noResults = document.getElementById('status-no-results');

  if (!grid) return;

  // Apply filters
  const search = document.getElementById('status-search-input')?.value.toLowerCase().trim() || '';
  const tierFilter = document.getElementById('status-tier-filter')?.value || '';
  const statusFilter = document.getElementById('status-status-filter')?.value || '';
  const featureFilter = document.getElementById('status-feature-filter')?.value || '';

  const filtered = providers.filter(p => {
    if (search) {
      const haystack = `${p.name} ${(p.features || []).join(' ')} ${(p.models || []).join(' ')}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (tierFilter && p.tier !== tierFilter) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    if (featureFilter && !(p.features || []).includes(featureFilter)) return false;
    return true;
  });

  // Update summary cards
  updateSummaryCards(providers);

  if (filtered.length === 0) {
    loadingGrid.style.display = 'none';
    grid.style.display = 'none';
    noResults.style.display = 'block';
    return;
  }

  loadingGrid.style.display = 'none';
  noResults.style.display = 'none';
  grid.style.display = 'grid';

  grid.innerHTML = filtered.map(provider => createStatusCard(provider)).join('');

  // Add click handlers for detail buttons
  grid.querySelectorAll('.btn-detail').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const slug = btn.dataset.slug;
      const provider = providers.find(p => p.slug === slug);
      if (provider) openProviderModal(provider);
    });
  });

  grid.querySelectorAll('.btn-website').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.open(btn.dataset.url, '_blank', 'noopener');
    });
  });

  // Update URL
  const params = new URLSearchParams();
  if (search) params.set('q', search);
  if (tierFilter) params.set('tier', tierFilter);
  if (statusFilter) params.set('status', statusFilter);
  if (featureFilter) params.set('feature', featureFilter);
  window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
}

function updateSummaryCards(providers) {
  const active = providers.filter(p => p.status === 'active').length;
  const degraded = providers.filter(p => p.status === 'degraded').length;
  const down = providers.filter(p => p.status === 'down' || p.status === 'unknown').length;
  const avgHealth = providers.length > 0
    ? Math.round(providers.reduce((sum, p) => sum + (p.health_score || 0), 0) / providers.length)
    : 0;
  const totalModels = providers.reduce((sum, p) => sum + (p.models_count || 0), 0);

  setText('total-providers', providers.length);
  setText('active-providers', active);
  setText('degraded-providers', degraded);
  setText('down-providers', down);
  setText('avg-health', avgHealth);
  setText('total-models-summary', totalModels);
}

function createStatusCard(p) {
  const statusClass = p.status || 'unknown';
  const tierClass = `tier-${p.tier || 'unknown'}`;
  const tierLabels = {
    permanent_free: 'Permanent Free',
    trial_credit: 'Trial Credit',
    local: 'Local'
  };

  const rateLimit = p.rate_limit || {};
  let rateLimitText = '';
  // Handle all rate limit keys, not just hardcoded ones
  for (const [key, value] of Object.entries(rateLimit)) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'object') continue; // Skip nested objects
    const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    rateLimitText += `${value} ${label} `;
  }
  if (!rateLimitText) rateLimitText = 'N/A';

  const features = (p.features || []).slice(0, 6);
  const featureTags = features.map(f =>
    `<span class="feature-tag">${f.replace(/_/g, ' ')}</span>`
  ).join('');

  const healthScore = p.health_score || 0;
  let healthColor = 'var(--danger)';
  if (healthScore >= 80) healthColor = 'var(--success)';
  else if (healthScore >= 60) healthColor = 'var(--warning)';

  return `
    <article class="provider-card ${statusClass}" data-slug="${p.slug}" data-tier="${p.tier}" data-status="${p.status}">
      <div class="provider-header">
        <div class="provider-icon">${getProviderIcon(p.name)}</div>
        <div class="provider-info">
          <div class="provider-name">${escapeHtml(p.name)}</div>
          <span class="provider-tier ${tierClass}">${tierLabels[p.tier] || p.tier}</span>
        </div>
        <span class="status-badge status-${statusClass}">${translateStatus(p.status)}</span>
      </div>

      <div class="provider-meta">
        <span class="meta-item" title="Models">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/></svg>
          <span>${p.models_count || 0}</span>
        </span>
        <span class="meta-item" title="Free Models">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          <span>${(p.free_models || []).length}</span>
        </span>
        <span class="meta-item" title="Context Window">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          <span>${p.context_window ? formatContext(p.context_window) : 'N/A'}</span>
        </span>
        <span class="meta-item" title="Function Calling">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          <span>${p.function_calling ? 'Yes' : 'No'}</span>
        </span>
      </div>

      <div class="provider-stats">
        <div class="stat-item">
          <div class="stat-value" style="color: ${healthColor};">${healthScore}</div>
          <div class="stat-label">Health</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${(p.free_models || []).length}</div>
          <div class="stat-label">Free Models</div>
        </div>
        <div class="stat-item">
          <div class="stat-value mono" style="font-size: 0.9rem;">${escapeHtml(rateLimitText.trim())}</div>
          <div class="stat-label">Rate Limit</div>
        </div>
      </div>

      <div class="provider-features">${featureTags}</div>

      <div class="provider-actions">
        <button class="btn btn-secondary btn-detail" data-slug="${p.slug}">Details</button>
        <button class="btn btn-primary btn-website" data-url="${escapeHtml(p.website)}">Website</button>
      </div>
    </article>
  `;
}

function getProviderIcon(name) {
  const icons = {
    'Groq': '⚡', 'Cerebras': '🧠', 'Google AI Studio': '💎',
    'NVIDIA NIM': '🟢', 'Cohere': '🔵', 'Mistral': '🟣',
    'DeepSeek': '🔍', 'HuggingFace': '🤗', 'Cloudflare': '☁️',
    'Kilo Code': '💻', 'LLM7.io': '7️⃣', 'Agnes AI': '🎨',
    'OpenRouter': '🔀', 'Together': '🤝', 'Fireworks': '🎆',
    'Anyscale': '∞', 'Perplexity': '🔎', 'Replicate': '🔄'
  };
  for (const [key, icon] of Object.entries(icons)) {
    if (name.includes(key)) return icon;
  }
  return '🔧';
}

function translateStatus(status) {
  const map = {
    active: t('active') || 'Active',
    degraded: t('degraded') || 'Degraded',
    down: t('down') || 'Down',
    unknown: t('unknown') || 'Unknown'
  };
  return map[status] || status;
}

// ===== Stats =====
function updateStats(providers) {
  let totalModels = 0, totalFree = 0, totalHealth = 0, activeCount = 0;
  for (const p of providers) {
    totalModels += p.models_count || p.models?.length || 0;
    totalFree += p.free_models?.length || 0;
    totalHealth += p.health_score || 0;
    if (p.status === 'active') activeCount++;
  }
  const avgHealth = providers.length ? Math.round(totalHealth / providers.length) : 0;
  const activePercentage = providers.length ? Math.round(activeCount / providers.length * 100) : 0;

  setText('stat-providers', providers.length);
  setText('stat-models', totalModels.toLocaleString());
  setText('stat-free', totalFree.toLocaleString());
  setText('stat-health', avgHealth);
  setText('health-score', avgHealth);
  setText('active-count', activeCount);
  setText('total-models', totalModels.toLocaleString());
  setText('free-models', totalFree.toLocaleString());
  setStyle('health-progress', 'width', `${avgHealth}%`);
  setStyle('active-progress', 'width', `${activePercentage}%`);
}

// ===== Modal =====
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const modalTitle = document.getElementById('modal-title');

function openModalBySlug(slug) {
  const p = providersData?.providers?.find(x => x.slug === slug);
  if (!p) {
    console.error('Provider not found:', slug);
    return;
  }
  openProviderModal(p);
}

function openProviderModal(p) {
  if (!p || typeof p !== 'object') {
    console.error('Invalid provider object:', p);
    openModal('Error', '<div style="padding:20px;color:var(--danger);">Invalid provider data</div>');
    return;
  }
  const rateLimit = p.rate_limit || {};
  let rateLimitHtml = '';
  for (const [key, value] of Object.entries(rateLimit)) {
    const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    // Handle nested objects/arrays
    let displayValue = value;
    if (typeof value === 'object' && value !== null) {
      displayValue = JSON.stringify(value);
    }
    if (displayValue === null || displayValue === undefined) displayValue = 'N/A';
    rateLimitHtml += `<li><strong>${escapeHtml(label)}:</strong> ${escapeHtml(String(displayValue))}</li>`;
  }
  if (!rateLimitHtml) rateLimitHtml = '<li>Not specified</li>';

  const features = (p.features || []).map(f =>
    `<span class="feature-tag">${escapeHtml(f.replace(/_/g, ' '))}</span>`
  ).join('');

  const models = (p.models || []).slice(0, 10).map(m =>
    `<code style="background: var(--bg-raised); padding: 2px 6px; border-radius: 4px; font-size: 0.85rem;">${escapeHtml(m)}</code>`
  ).join(' ');

  const freeModels = (p.free_models || []).slice(0, 10).map(m =>
    `<code style="background: var(--success-bg); padding: 2px 6px; border-radius: 4px; font-size: 0.85rem; color: var(--success);">${escapeHtml(m)}</code>`
  ).join(' ');

  const content = `
    <div style="display: grid; gap: 20px;">
      <div>
        <h4 style="margin-bottom: 12px;">${t('modal_basic_info')}</h4>
        <dl style="display: grid; grid-template-columns: 140px 1fr; gap: 8px 16px; font-size: 0.9rem;">
          <dt style="color: var(--text-muted);">${t('modal_website')}</dt>
          <dd><a href="${escapeHtml(p.website || '')}" target="_blank" rel="noopener" style="color: var(--brand);">${escapeHtml(p.website || 'N/A')}</a></dd>
          <dt style="color: var(--text-muted);">${t('modal_api_base')}</dt>
          <dd><code style="font-size: 0.85rem;">${escapeHtml(p.api_base || 'N/A')}</code></dd>
          <dt style="color: var(--text-muted);">${t('modal_tier')}</dt>
          <dd><span class="provider-tier tier-${p.tier || 'unknown'}">${escapeHtml(p.tier || 'unknown')}</span></dd>
          <dt style="color: var(--text-muted);">${t('modal_region')}</dt>
          <dd>${escapeHtml(p.region || 'Global')}</dd>
          <dt style="color: var(--text-muted);">${t('modal_requires_key')}</dt>
          <dd>${p.requires_key ? t('yes') : t('no')}</dd>
          <dt style="color: var(--text-muted);">${t('modal_requires_card')}</dt>
          <dd>${p.requires_card ? t('yes') : t('no')}</dd>
          <dt style="color: var(--text-muted);">${t('modal_status')}</dt>
          <dd><span class="status-badge status-${p.status || 'unknown'}">${translateStatus(p.status)}</span></dd>
          <dt style="color: var(--text-muted);">${t('modal_health')}</dt>
          <dd style="color: ${(p.health_score || 0) >= 80 ? 'var(--success)' : (p.health_score || 0) >= 60 ? 'var(--warning)' : 'var(--danger)'}; font-weight: 600;">${p.health_score !== undefined ? p.health_score : '—'}/100</dd>
          <dt style="color: var(--text-muted);">${t('modal_last_probed')}</dt>
          <dd>${formatDate(p.last_probed)}</dd>
        </dl>
      </div>

      <div>
        <h4 style="margin-bottom: 12px;">${t('modal_rate_limits')}</h4>
        <ul style="list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; font-size: 0.85rem;">${rateLimitHtml}</ul>
      </div>

      <div>
        <h4 style="margin-bottom: 12px;">${t('modal_capabilities')}</h4>
        <div>
          <strong style="color: var(--text-muted); font-size: 0.85rem;">${t('modal_context')}: </strong>
          <span style="margin-left: 8px;">${p.context_window && p.context_window > 0 ? formatContext(p.context_window) : t('unknown')}</span>
        </div>
        <div style="margin-bottom: 16px;">
          <strong style="color: var(--text-muted); font-size: 0.85rem;">${t('modal_max_output')}: </strong>
          <span style="margin-left: 8px;">${p.max_output_tokens && p.max_output_tokens > 0 ? p.max_output_tokens.toLocaleString() : t('unknown')}</span>
        </div>
        <div style="margin-bottom: 16px;">
          <strong style="color: var(--text-muted); font-size: 0.85rem;">${t('modal_function')}: </strong>
          <span style="margin-left: 8px;">${p.function_calling ? t('yes') : t('no')}</span>
        </div>
        <div>
          <strong style="color: var(--text-muted); font-size: 0.85rem;">${t('modal_features')}: </strong>
          <div style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 8px;">${features || t('unknown')}</div>
        </div>
      </div>

      <div>
        <h4 style="margin-bottom: 12px;">${t('modal_models_title')} (${(p.models || []).length} ${t('modal_total')}, ${(p.free_models || []).length} ${t('modal_free')})</h4>
        <div style="margin-bottom: 16px;">
          <strong style="color: var(--text-muted); font-size: 0.85rem;">${t('modal_free_models')}: </strong>
          <div style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 6px;">${freeModels || t('none')}</div>
        </div>
        <div>
          <strong style="color: var(--text-muted); font-size: 0.85rem;">${t('modal_all_models')}: </strong>
          <div style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 6px;">${models}${p.models && p.models.length > 10 ? ' <span style="color: var(--text-dim);">' + t('modal_and_more') + ' ' + (p.models.length - 10) + '</span>' : ''}</div>
        </div>
      </div>

      <div style="padding-top: 16px; border-top: 1px solid var(--border); color: var(--text-dim); font-size: 0.8rem;">
        ${escapeHtml(p.notes || t('modal_no_notes'))}
        <br><br>
        <strong>${t('modal_source')}: </strong> <a href="${escapeHtml(p.source || '')}" target="_blank" rel="noopener" style="color: var(--brand);">${escapeHtml(p.source || 'N/A')}</a>
      </div>
      <div class="modal-actions" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); display: flex; gap: 12px; justify-content: flex-end;">
        <a href="${escapeHtml(p.website || '#')}" target="_blank" rel="noopener" class="btn btn-secondary">${t('modal_website')}</a>
        <a href="${escapeHtml(p.api_base || '')}${escapeHtml(p.models_endpoint || '')}" target="_blank" rel="noopener" class="btn btn-primary">${t('modal_models_api') || 'Models API'}</a>
      </div>
    </div>
  `;

  openModal(p.name || 'Provider', content);
}

function openModal(title, content) {
  modalTitle.textContent = title;
  modalBody.innerHTML = content;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  trapFocus(modal);
}

function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
  releaseFocus();
}

function trapFocus(element) {
  const focusableElements = element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  element.addEventListener('keydown', function e(e) {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    }
    if (e.key === 'Escape') closeModal();
  });
}

function releaseFocus() {}

document.getElementById('modal-close').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ===== Toast =====
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastOut 0.2s ease';
    setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 200);
  }, 3000);
}

const toastStyle = document.createElement('style');
toastStyle.textContent = `
  @keyframes toastOut { to { opacity: 0; transform: translateX(100%); } }
`;
document.head.appendChild(toastStyle);

// ===== Helpers =====
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setStyle(id, prop, value) {
  const el = document.getElementById(id);
  if (el) el.style[prop] = value;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatContext(ctx) {
  if (ctx >= 1000000) return (ctx / 1000000).toFixed(1) + 'M';
  if (ctx >= 1000) return (ctx / 1000).toFixed(0) + 'K';
  return ctx.toString();
}

function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// ===== Comparison (3 selectors) =====
function updateCompareSelects() {
  if (!providersData) return;
  for (let i = 1; i <= 3; i++) {
    const select = document.getElementById(`compare-select-${i}`);
    if (!select) continue;
    const currentValue = select.value;
    select.innerHTML = `<option value="" disabled ${currentValue ? '' : 'selected'}>${t(`compare_select_${i}`) || 'Select provider'}</option>`;
    providersData.providers.forEach(p => {
      if (!selectedProviders.has(p.slug) || p.slug === currentValue) {
        const option = document.createElement('option');
        option.value = p.slug;
        option.textContent = p.name;
        if (p.slug === currentValue) option.selected = true;
        select.appendChild(option);
      }
    });
  }
  renderComparison();
}

function renderComparison() {
  const grid = document.getElementById('compare-grid');
  const selectedDiv = document.getElementById('compare-selected');

  // Update selected tags
  selectedDiv.innerHTML = '';
  selectedProviders.forEach(slug => {
    const p = providersData.providers.find(x => x.slug === slug);
    if (!p) return;
    const tag = document.createElement('span');
    tag.className = 'compare-tag';
    tag.innerHTML = `${escapeHtml(p.name)} <button type="button" data-remove="${p.slug}">&times;</button>`;
    selectedDiv.appendChild(tag);
  });
  selectedDiv.querySelectorAll('button[data-remove]').forEach(btn => {
    btn.addEventListener('click', (e) => removeFromCompare(e.target.dataset.remove));
  });

  if (selectedProviders.size === 0) {
    grid.innerHTML = '';
    return;
  }

  grid.innerHTML = '';
  selectedProviders.forEach(slug => {
    const p = providersData.providers.find(x => x.slug === slug);
    if (!p) return;

    const card = document.createElement('div');
    card.className = 'compare-card';

    card.innerHTML = `
      <div class="compare-card-header">
        <div class="compare-card-logo">${escapeHtml(p.name.charAt(0))}</div>
        <div>
          <h3 class="compare-card-name">${escapeHtml(p.name)}</h3>
          <div class="compare-card-tier">${p.tier.replace('_', ' ')}</div>
        </div>
      </div>
      <div class="compare-metrics">
        <div class="compare-metric">
          <span class="compare-metric-label">Status</span>
          <span class="compare-metric-value">${translateStatus(p.status)}</span>
        </div>
        <div class="compare-metric">
          <span class="compare-metric-label">Health Score</span>
          <span class="compare-metric-value">${p.health_score || '—'}/100</span>
        </div>
        <div class="compare-metric">
          <span class="compare-metric-label">Models</span>
          <span class="compare-metric-value">${p.models_count || p.models?.length || 0}</span>
        </div>
        <div class="compare-metric">
          <span class="compare-metric-label">Free Models</span>
          <span class="compare-metric-value">${p.free_models?.length || 0}</span>
        </div>
        <div class="compare-metric">
          <span class="compare-metric-label">Context Window</span>
          <span class="compare-metric-value">${p.context_window?.toLocaleString() || '—'}</span>
        </div>
        <div class="compare-metric">
          <span class="compare-metric-label">Max Output</span>
          <span class="compare-metric-value">${p.max_output_tokens?.toLocaleString() || '—'}</span>
        </div>
        <div class="compare-metric">
          <span class="compare-metric-label">Features</span>
          <span class="compare-metric-value">${(p.features || []).join(', ') || '—'}</span>
        </div>
      </div>
      <div style="margin-top:1rem; text-align:right;">
        <button class="btn btn-secondary" style="padding:0.5rem 1rem; font-size:0.8rem;" data-remove="${p.slug}">Remove</button>
      </div>
    `;

    grid.appendChild(card);
  });

  grid.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', (e) => removeFromCompare(e.target.dataset.remove));
  });
}

function addToCompare(slug) {
  if (selectedProviders.size >= 3) {
    showToast(t('compare_limit') || 'Max 3 providers', 'error');
    return;
  }
  selectedProviders.add(slug);
  updateCompareSelects();
  showToast(t('toast_added') || 'Added to comparison', 'success');
}

function removeFromCompare(slug) {
  selectedProviders.delete(slug);
  updateCompareSelects();
}

// ===== Cost Calculator =====
function calculateCosts() {
  if (!providersData) return;

  const inputTokens = parseInt(document.getElementById('monthly-input-tokens')?.value) || 0;
  const outputTokens = parseInt(document.getElementById('monthly-output-tokens')?.value) || 0;
  const resultsContainer = document.getElementById('calculator-results');

  resultsContainer.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'calc-result-card';
  header.style.fontWeight = '600';
  header.style.borderBottom = '2px solid var(--accent)';
  header.innerHTML = `
    <div>${t('calc_provider') || 'Provider'}</div>
    <div style="text-align:right;">${t('calc_estimate') || 'Est. Cost'}</div>
    <div style="text-align:right;">Model</div>
    <div style="text-align:right;">Per 1M Tokens</div>
  `;
  resultsContainer.appendChild(header);

  const sortedProviders = [...providersData.providers].sort((a, b) => {
    if (a.tier === 'permanent_free' && b.tier !== 'permanent_free') return -1;
    if (a.tier !== 'permanent_free' && b.tier === 'permanent_free') return 1;
    return (b.health_score || 0) - (a.health_score || 0);
  });

  sortedProviders.forEach(p => {
    const card = document.createElement('div');
    card.className = 'calc-result-card ' + p.tier;

    let cost = 0, costType = 'unknown', costText = '—', perMText = '—';

    if (p.tier === 'permanent_free') {
      cost = 0; costType = 'free'; costText = '$0'; perMText = 'Free';
    } else if (p.tier === 'trial_credit') {
      const inputCost = (inputTokens / 1000000) * 0.5;
      const outputCost = (outputTokens / 1000000) * 1.5;
      cost = (inputCost + outputCost).toFixed(2);
      costType = 'trial'; costText = `~$${cost}`;
      perMText = `$${((inputTokens + outputTokens) / 1000000).toFixed(2)}/M`;
    }

    const modelName = p.models?.[0] || 'default';

    card.innerHTML = `
      <div class="calc-provider-info">
        <div class="calc-provider-name">${escapeHtml(p.name)}</div>
        <div class="calc-provider-tier">${p.tier.replace('_', ' ')}</div>
      </div>
      <div class="calc-cost ${costType}">${costText}</div>
      <div class="calc-model-name">${escapeHtml(modelName)}</div>
      <div class="calc-cost-per-m">${perMText}</div>
    `;

    resultsContainer.appendChild(card);
  });
}

// ===== Zero-Cost Stack Generator =====
function generateStack() {
  if (!providersData) return;

  const concurrentUsers = parseInt(document.getElementById('concurrent-users')?.value) || 10;
  const tokensPerRequest = parseInt(document.getElementById('tokens-per-request')?.value) || 200;
  const dailyRequests = parseInt(document.getElementById('daily-requests')?.value) || 100;
  const budget = parseFloat(document.getElementById('budget')?.value) || 0;
  const languagePref = document.getElementById('language-pref')?.value || 'en';
  const functionCalling = document.getElementById('function-calling')?.value === 'yes';
  const contextNeed = document.getElementById('context-need')?.value || 'medium';
  const latencyPref = document.getElementById('latency-pref')?.value || 'balanced';

  // Calculate daily tokens
  const dailyTokens = dailyRequests * tokensPerRequest;
  const monthlyTokens = dailyTokens * 30;

  // Score providers based on requirements
  const scored = providersData.providers
    .filter(p => p.status === 'active' && p.health_score >= 60)
    .map(p => {
      let score = p.health_score || 0;
      const freeModels = p.free_models?.length || 0;

      // Budget: prefer free
      if (budget === 0 && p.tier === 'permanent_free') score += 30;
      else if (budget > 0 && p.tier === 'trial_credit') score += 20;

      // Function calling
      if (functionCalling && p.function_calling) score += 25;
      else if (functionCalling && !p.function_calling) score -= 50;

      // Context window
      const ctx = p.context_window || 0;
      if (contextNeed === 'small' && ctx <= 4000) score += 10;
      else if (contextNeed === 'medium' && ctx > 4000 && ctx <= 32000) score += 15;
      else if (contextNeed === 'large' && ctx > 32000 && ctx <= 128000) score += 20;
      else if (contextNeed === 'xl' && ctx > 128000) score += 25;

      // Language preference - boost providers known for multilingual
      if (languagePref !== 'en' && (p.features || []).some(f => f.includes('multilingual') || f.includes('chinese'))) {
        score += 15;
      }

      // Latency preference
      if (latencyPref === 'low' && (p.features || []).some(f => f.includes('fast') || f.includes('low-latency'))) {
        score += 10;
      }

      // Estimate capacity
      const rpm = p.rate_limit?.rpm || 0;
      const estimatedCapacity = rpm * 60 * 24; // rough daily capacity
      if (estimatedCapacity >= dailyRequests) score += 15;

      return { provider: p, score, freeModels };
    })
    .sort((a, b) => b.score - a.score);

  const resultDiv = document.getElementById('stack-result');
  if (scored.length === 0) {
    resultDiv.innerHTML = `<div class="stack-result empty"><p>${t('stack_no_match') || 'No suitable providers found for your requirements.'}</p></div>`;
    return;
  }

  // Primary + fallback
  const primary = scored[0].provider;
  const fallback = scored[1]?.provider;
  const tertiary = scored[2]?.provider;

  let html = `
    <div class="stack-result">
      <h3 style="margin-bottom: 1rem; color: var(--accent);">${t('stack_recommended') || 'Recommended Stack'}</h3>
      <div class="stack-cards" style="display: grid; gap: 16px; margin-bottom: 24px;">
  `;

  const roles = ['Primary', 'Fallback', 'Tertiary'];
  [primary, fallback, tertiary].forEach((p, i) => {
    if (!p) return;
    const role = roles[i];
    const isFree = p.tier === 'permanent_free';
    html += `
      <div class="stack-card" style="background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; ${isFree ? 'border-left: 4px solid var(--accent);' : ''}">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <strong>${role}: ${escapeHtml(p.name)}</strong>
          <span class="provider-tier tier-${p.tier}">${p.tier.replace('_', ' ')}</span>
        </div>
        <div style="font-size: 0.9rem; color: var(--muted); margin-bottom: 8px;">
          ${p.models?.[0] || 'default'} • ${p.context_window ? formatContext(p.context_window) : 'N/A'} context • ${p.free_models?.length || 0} free models
        </div>
        <div style="font-size: 0.85rem; color: var(--text-muted);">
          Health: ${p.health_score}/100 • RPM: ${p.rate_limit?.rpm || 'N/A'} • Function Calling: ${p.function_calling ? 'Yes' : 'No'}
        </div>
      </div>
    `;
  });

  // Reasoning
  html += `
      </div>
      <div class="stack-reasoning" style="background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 12px; padding: 20px;">
        <strong style="color: var(--accent);">${t('stack_reasoning') || 'Why this stack:'}</strong>
        <ul style="margin-top: 12px; padding-left: 20px; color: var(--muted); font-size: 0.9rem; line-height: 1.8;">
  `;

  const reasons = [];
  if (budget === 0) reasons.push(t('stack_reason_free') || 'Zero-cost: all providers offer permanent free tiers');
  if (functionCalling) reasons.push(t('stack_reason_function') || 'Function calling support for tool use');
  if (languagePref !== 'en') reasons.push(t('stack_reason_lang') || `Optimized for ${languagePref === 'zh' ? 'Chinese' : 'multi-language'}`);
  reasons.push(t('stack_reason_health') || `High health scores (${primary.health_score}+)`);
  if (fallback) reasons.push(t('stack_reason_fallback') || `Fallback: ${fallback.name} for redundancy`);
  if (tertiary) reasons.push(t('stack_reason_tertiary') || `Tertiary: ${tertiary.name} for overflow`);

  reasons.forEach(r => { html += `<li>${r}</li>`; });

  html += `
        </ul>
      </div>
      <div style="margin-top: 16px; padding: 16px; background: var(--bg); border-radius: 8px; font-size: 0.85rem; color: var(--muted);">
        <strong>${t('stack_estimate') || 'Estimated monthly usage:'}</strong><br>
        ${(monthlyTokens / 1000000).toFixed(1)}M tokens • ${dailyRequests} req/day • ${concurrentUsers} concurrent users
      </div>
    </div>
  `;

  resultDiv.innerHTML = html;
}

// ===== Share/Export =====
function generateShareLink() {
  if (!providersData) return '';
  const selectedSlugs = Array.from(selectedProviders);
  const params = new URLSearchParams();
  params.set('providers', selectedSlugs.join(','));
  params.set('lang', currentLang);
  params.set('theme', currentTheme);
  return `${shareState.baseUrl}?${params.toString()}`;
}

function exportToJSON() {
  const data = {
    providers: Array.from(selectedProviders).map(slug => {
      const p = providersData.providers.find(x => x.slug === slug);
      if (!p) return null;
      return { name: p.name, slug: p.slug, tier: p.tier, status: p.status, health_score: p.health_score, models: p.models, features: p.features };
    }).filter(Boolean),
    exported_at: new Date().toISOString(),
    language: currentLang
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'free-llm-atlas-comparison.json';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(t('toast_copied') || 'Exported', 'success');
}

function exportToMarkdown() {
  let md = '# Free LLM Atlas Comparison\n\n';
  md += `| Provider | Tier | Status | Health | Models | Features |\n|---------|------|--------|--------|--------|----------|\n`;
  selectedProviders.forEach(slug => {
    const p = providersData.providers.find(x => x.slug === slug);
    if (!p) return;
    md += `| ${escapeHtml(p.name)} | ${p.tier.replace('_', ' ')} | ${translateStatus(p.status)} | ${p.health_score || '—'}/100 | ${p.models_count || 0} | ${(p.features || []).join(', ') || '—'} |\n`;
  });
  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'free-llm-atlas-comparison.md';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(t('toast_copied') || 'Exported', 'success');
}

// ===== Speed Test =====
function runSpeedTest() {
  if (!providersData) return;
  const grid = document.getElementById('speed-grid');
  const runBtn = document.getElementById('run-speed-test');
  const clearBtn = document.getElementById('clear-speed-test');

  runBtn.style.display = 'none';
  clearBtn.style.display = 'inline-flex';
  grid.innerHTML = '';

  providersData.providers.forEach(p => {
    const card = document.createElement('div');
    card.className = 'speed-card';
    card.id = `speed-${p.slug}`;
    card.innerHTML = `
      <div class="speed-provider">
        <h4 class="speed-name">${escapeHtml(p.name)}</h4>
        <span class="speed-status pending">Testing</span>
      </div>
      <div class="speed-latency pending">—</div>
    `;
    grid.appendChild(card);
  });

  const batchSize = 5;
  const providers = providersData.providers.slice(0, 15);
  let currentIndex = 0;

  function testNext() {
    if (currentIndex >= providers.length) return;
    const endIndex = Math.min(currentIndex + batchSize, providers.length);
    for (let i = currentIndex; i < endIndex; i++) {
      const p = providers[i];
      const card = document.getElementById(`speed-${p.slug}`);
      checkEndpoint(p).then(latency => {
        const statusEl = card.querySelector('.speed-status');
        const latencyEl = card.querySelector('.speed-latency');
        if (latency !== null) {
          card.className = 'speed-card success';
          statusEl.textContent = 'OK';
          statusEl.className = 'speed-status success';
          latencyEl.textContent = `${latency}ms`;
          latencyEl.className = 'speed-latency';
        } else {
          card.className = 'speed-card error';
          statusEl.textContent = 'Error';
          statusEl.className = 'speed-status error';
          latencyEl.textContent = 'Failed';
        }
      }).catch(() => {
        card.className = 'speed-card error';
        const statusEl = card.querySelector('.speed-status');
        const latencyEl = card.querySelector('.speed-latency');
        statusEl.textContent = 'Error';
        statusEl.className = 'speed-status error';
        latencyEl.textContent = 'Failed';
      });
    }
    currentIndex = endIndex;
    if (currentIndex < providers.length) setTimeout(testNext, 500);
  }
  testNext();
}

async function checkEndpoint(provider) {
  try {
    const start = performance.now();
    await fetch(provider.website, { mode: 'no-cors', cache: 'no-store' });
    return Math.round(performance.now() - start);
  } catch (e) { return null; }
}

// ===== Initialize =====
async function init() {
  await loadI18n();
  setTheme(currentTheme);
  document.documentElement.lang = currentLang;
  applyI18n();

  resizeCanvas();
  if (!reducedMotion) { initParticles(); animationFrameId = requestAnimationFrame(animate); }

  const data = await fetchProviders();
  if (data) {
    renderProviders(data.providers);
    renderStatusGrid(data.providers);

    document.getElementById('last-probe').textContent = data.updated
      ? new Date(data.updated).toLocaleString() : '—';
    document.getElementById('data-version').textContent = data.version || '1.0';

    updateCompareSelects();
    calculateCosts();

    // Status grid filters
    ['status-search-input', 'status-tier-filter', 'status-status-filter', 'status-feature-filter'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', debounce(() => renderStatusGrid(providersData.providers), 150));
    });

    // Main grid filters
    ['search-input', 'tier-filter', 'status-filter'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', debounce(() => renderProviders(providersData.providers), 150));
    });
  }
}

// ===== Event Listeners =====
document.getElementById('lang-btn').addEventListener('click', () => setLanguage(currentLang === 'en' ? 'zh' : 'en'));

document.querySelectorAll('.theme-btn').forEach(btn => {
  btn.addEventListener('click', () => setTheme(btn.dataset.theme));
});

// Comparison selectors
for (let i = 1; i <= 3; i++) {
  const select = document.getElementById(`compare-select-${i}`);
  if (select) {
    select.addEventListener('change', (e) => {
      const slug = e.target.value;
      if (slug && !selectedProviders.has(slug)) {
        addToCompare(slug);
        e.target.value = '';
      }
    });
  }
}

// Calculator inputs
['monthly-input-tokens', 'monthly-output-tokens', 'input-output-ratio'].forEach(id => {
  const el = document.getElementById(id);
  if (el) { el.addEventListener('input', calculateCosts); el.addEventListener('change', calculateCosts); }
});

// Stack generator
const generateStackBtn = document.getElementById('generate-stack');
if (generateStackBtn) generateStackBtn.addEventListener('click', generateStack);

// Speed test
const runSpeedBtn = document.getElementById('run-speed-test');
const clearSpeedBtn = document.getElementById('clear-speed-test');
if (runSpeedBtn) runSpeedBtn.addEventListener('click', runSpeedTest);
if (clearSpeedBtn) clearSpeedBtn.addEventListener('click', () => {
  document.getElementById('speed-grid').innerHTML = '';
  runSpeedBtn.style.display = 'inline-flex';
  clearSpeedBtn.style.display = 'none';
});

// Share/Export
const copyLinkBtn = document.getElementById('copy-link');
if (copyLinkBtn) copyLinkBtn.addEventListener('click', () => {
  const link = generateShareLink();
  if (!link) { showToast(t('toast_error'), 'error'); return; }
  const urlInput = document.getElementById('share-url-input');
  urlInput.value = link;
  navigator.clipboard.writeText(link).then(() => showToast(t('share_copied') || 'Copied!', 'success'));
});

const exportJsonBtn = document.getElementById('export-json');
if (exportJsonBtn) exportJsonBtn.addEventListener('click', exportToJSON);

const exportMdBtn = document.getElementById('export-md');
if (exportMdBtn) exportMdBtn.addEventListener('click', exportToMarkdown);

// Build time
document.getElementById('build-time').textContent = new Date().toISOString().split('T')[0];

// Load URL params for status grid
function loadUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const searchInput = document.getElementById('status-search-input');
  const tierFilter = document.getElementById('status-tier-filter');
  const statusFilter = document.getElementById('status-status-filter');
  const featureFilter = document.getElementById('status-feature-filter');

  if (searchInput && params.get('q')) searchInput.value = params.get('q');
  if (tierFilter && params.get('tier')) tierFilter.value = params.get('tier');
  if (statusFilter && params.get('status')) statusFilter.value = params.get('status');
  if (featureFilter && params.get('feature')) featureFilter.value = params.get('feature');
  setTimeout(() => { if (providersData) renderStatusGrid(providersData.providers); }, 100);
}

document.addEventListener('DOMContentLoaded', () => {
  loadUrlParams();
  init().catch(console.error);
});