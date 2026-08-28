// ===== Data Loading with Caching =====
let providersData = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

// ===== i18n System =====
let currentLang = localStorage.getItem('lang') || 'en';
let i18nData = null;

// ===== Cost Calculator State =====
let calculatorState = {
  monthlyInputTokens: 100000,
  monthlyOutputTokens: 50000,
  inputOutputRatio: '10:1',
  selectedProviders: []
};

// ===== Share State =====
let shareState = {
  baseUrl: window.location.origin + window.location.pathname
};

async function loadI18n() {
  try {
    const res = await fetch('i18n.json');
    i18nData = await res.json();
  } catch (e) {
    console.error('Failed to load i18n:', e);
    // Fallback to embedded English
    i18nData = { en: {}, zh: {} };
  }
}

function t(key) {
  return i18nData?.[currentLang]?.[key] || i18nData?.en?.[key] || key;
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang;
  applyI18n();
  if (providersData) renderProviders(providersData.providers);
}

function applyI18n() {
  document.title = t('site_title');
  
  // Generic data-i18n attributes
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
  });
  
  // Hero section
  const heroBadge = document.querySelector('.hero-badge');
  if (heroBadge) heroBadge.innerHTML = t('hero_badge');
  
  const heroTitle = document.querySelector('.hero h1');
  if (heroTitle) heroTitle.textContent = t('hero_title');
  
  const heroSubtitle = document.querySelector('.hero .subtitle');
  if (heroSubtitle) heroSubtitle.textContent = t('hero_subtitle');
  
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) scrollIndicator.textContent = t('scroll_indicator');
  
  // Stats labels
  const statLabels = document.querySelectorAll('.stat-label');
  const statKeys = ['stat_providers', 'stat_models', 'stat_free', 'stat_health'];
  statLabels.forEach((el, i) => {
    if (statKeys[i]) el.textContent = t(statKeys[i]);
  });
  
  // Section headers
  const providersTag = document.querySelector('#providers .section-tag');
  if (providersTag) providersTag.textContent = t('section_providers_tag');
  
  const providersTitle = document.querySelector('#providers .section-title');
  if (providersTitle) providersTitle.textContent = t('section_providers_title');
  
  const providersDesc = document.querySelector('#providers .section-desc');
  if (providersDesc) providersDesc.textContent = t('section_providers_desc');
  
  // Filter placeholders
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.placeholder = t('search_placeholder');
  
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
  }
  
  // Monitor section
  const monitorTag = document.querySelector('#monitor .section-tag');
  if (monitorTag) monitorTag.textContent = t('monitor_tag');
  
  const monitorTitle = document.querySelector('#monitor .section-title');
  if (monitorTitle) monitorTitle.textContent = t('monitor_title');
  
  const monitorDesc = document.querySelector('#monitor .section-desc');
  if (monitorDesc) monitorDesc.textContent = t('monitor_desc');
  
  // Monitor cards
  const monitorCards = document.querySelectorAll('.monitor-card');
  const monitorKeys = ['monitor_health', 'monitor_active', 'monitor_models', 'monitor_free', 'monitor_probe', 'monitor_version'];
  monitorCards.forEach((card, i) => {
    if (monitorKeys[i]) {
      const title = card.querySelector('.monitor-title');
      if (title) title.textContent = t(monitorKeys[i]);
      const label = card.querySelector('.monitor-label');
      if (label) label.textContent = t(monitorKeys[i] + '_label');
    }
  });
  
  // Footer
  const footerLinks = document.querySelectorAll('.footer-links a');
  const footerKeys = ['footer_github', 'footer_json', 'footer_docs', 'footer_powered'];
  footerLinks.forEach((link, i) => {
    if (footerKeys[i]) link.textContent = t(footerKeys[i]);
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
}

// ===== Theme System =====
let currentTheme = localStorage.getItem('theme') || 'dark';

function setTheme(theme) {
  currentTheme = theme;
  localStorage.setItem('theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
  
  // Update theme buttons
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
  
  // Update canvas colors if needed
  if (window.updateCanvasTheme) window.updateCanvasTheme();
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
    this.radius = Math.random() * 2.5 + 1.0; // Much larger for visibility
    this.opacity = Math.random() * 0.5 + 0.5; // 0.5-1.0 high visibility
    this.color = currentTheme === 'dark' 
      ? (Math.random() > 0.5 ? '#00ff88' : '#00ffff')
      : (Math.random() > 0.5 ? '#00b368' : '#0099cc');
    this.originalY = this.y;
    this.amplitude = Math.random() * 30 + 15;
    this.frequency = Math.random() * 0.02 + 0.01;
    this.phase = Math.random() * Math.PI * 2;
    this.pulsePhase = Math.random() * Math.PI * 2;
  }
  update(deltaTime) {
    // Vertical floating motion
    this.y = this.originalY + Math.sin(this.x * this.frequency + lastTime * 0.001 + this.phase) * this.amplitude;
    
    // Horizontal drift
    this.x += this.vx * deltaTime * 0.001;
    
    // Pulse animation
    this.pulsePhase += deltaTime * 0.001;
    
    // Wrap around
    if (this.x < -30) this.x = canvas.width + 30;
    if (this.x > canvas.width + 30) this.x = -30;
    if (this.y < -30) this.y = canvas.height + 30;
    if (this.y > canvas.height + 30) this.y = -30;
  }
  draw() {
    // Draw outer glow
    const pulseOpacity = this.opacity * (0.8 + 0.2 * Math.sin(this.pulsePhase));
    const glowRadius = this.radius * 2.5;
    
    // Outer glow
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowRadius);
    gradient.addColorStop(0, this.color.replace(/rgba?\([^)]+\)/, '').replace('#', '').replace(/^/, '#') + '00');
    gradient.addColorStop(1, this.color);
    // Simpler: just draw with alpha
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = pulseOpacity * 0.15;
    ctx.fill();
    ctx.globalAlpha = 1;
    
    // Core particle
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = pulseOpacity;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function initParticles() {
  // Dynamic particle count based on screen size
  const density = Math.min(0.0008, Math.max(0.0004, window.innerWidth * window.innerHeight / 10000000));
  const count = Math.max(50, Math.min(150, Math.floor(canvas.width * canvas.height * density)));
  particles = Array.from({ length: count }, () => new Particle());
}

function animate(timestamp) {
  if (reducedMotion) return;
  
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Update and draw particles
  particles.forEach(p => {
    p.update(deltaTime);
    p.draw();
  });
  
  // Draw connections
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 200) { // Increased connection distance
        const opacity = 0.15 * (1 - dist / 200); // Higher base opacity
        const pulseFactor = 0.5 + 0.5 * Math.sin(lastTime * 0.001 + dist * 0.02);
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = currentTheme === 'dark' 
          ? `rgba(0, 255, 136, ${opacity * pulseFactor})`
          : `rgba(0, 179, 104, ${opacity * pulseFactor * 0.8})`;
        ctx.lineWidth = Math.max(0.5, 1.5 * (1 - dist / 200)); // Thicker lines for closer particles
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

// ===== Provider Rendering =====
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
    const open = () => openModal(card.dataset.slug);
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

function updateStats(providers) {
  let totalModels = 0;
  let totalFree = 0;
  let totalHealth = 0;
  let activeCount = 0;
  
  for (const p of providers) {
    totalModels += p.models_count || p.models?.length || 0;
    totalFree += p.free_models?.length || 0;
    totalHealth += p.health_score || 0;
    if (p.status === 'active') activeCount++;
  }
  
  const avgHealth = providers.length ? Math.round(totalHealth / providers.length) : 0;
  const activePercentage = providers.length ? Math.round(activeCount / providers.length * 100) : 0;
  
  document.getElementById('stat-providers').textContent = providers.length;
  document.getElementById('stat-models').textContent = totalModels.toLocaleString();
  document.getElementById('stat-free').textContent = totalFree.toLocaleString();
  document.getElementById('stat-health').textContent = avgHealth;
  document.getElementById('health-score').textContent = avgHealth;
  document.getElementById('active-count').textContent = activeCount;
  document.getElementById('total-models').textContent = totalModels.toLocaleString();
  document.getElementById('free-models').textContent = totalFree.toLocaleString();
  document.getElementById('health-progress').style.width = `${avgHealth}%`;
  document.getElementById('active-progress').style.width = `${activePercentage}%`;
}

// ===== Modal =====
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const modalTitle = document.getElementById('modal-title');

function openModal(slug) {
  const p = providersData?.providers?.find(x => x.slug === slug);
  if (!p) return;

  modalTitle.textContent = p.name;
  modalBody.innerHTML = `
    <div class="modal-detail">
      <span class="detail-label">${t('modal_status')}</span>
      <span class="detail-value"><span class="provider-status status-${p.status || 'offline'}" 
             style="width:10px;height:10px;display:inline-block;margin-right:0.4rem;"></span>
        ${t(p.status || 'unknown')}</span>
      <span class="detail-label">${t('modal_tier')}</span>
      <span class="detail-value">${p.tier.replace('_', ' ')}</span>
      <span class="detail-label">${t('modal_models')}</span>
      <span class="detail-value">${p.models_count || p.models?.length || 0}</span>
      <span class="detail-label">${t('modal_free_models')}</span>
      <span class="detail-value">${p.free_models?.length || 0}</span>
      <span class="detail-label">${t('modal_context')}</span>
      <span class="detail-value mono">${p.context_window?.toLocaleString() || '—'}</span>
      <span class="detail-label">${t('modal_max_output')}</span>
      <span class="detail-value mono">${p.max_output_tokens?.toLocaleString() || '—'}</span>
      <span class="detail-label">${t('modal_health')}</span>
      <span class="detail-value">${p.health_score || '—'}/100</span>
      <span class="detail-label">${t('modal_function')}</span>
      <span class="detail-value">${p.function_calling ? '✓' : '✗'}</span>
      <span class="detail-label">${t('modal_requires_key')}</span>
      <span class="detail-value">${p.requires_key ? t('yes') : t('no')}</span>
      <span class="detail-label">${t('modal_requires_card')}</span>
      <span class="detail-value">${p.requires_card ? t('yes') : t('no')}</span>
      <span class="detail-label">${t('modal_region')}</span>
      <span class="detail-value">${p.region || 'global'}</span>
      <span class="detail-label">${t('modal_last_probed')}</span>
      <span class="detail-value mono">${p.last_probed ? new Date(p.last_probed).toLocaleString() : '—'}</span>
    </div>
    <div style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border);">
      <strong style="display:block;margin-bottom:0.5rem;color:var(--accent);">${t('modal_features')}</strong>
      <div class="feature-list">
        ${(p.features || []).map(f => `<span class="feature-tag-modal">${escapeHtml(f)}</span>`).join('')}
      </div>
    </div>
    ${p.rate_limit ? `
    <div style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border);">
      <strong style="display:block;margin-bottom:0.5rem;color:var(--accent);">${t('modal_rate_limits')}</strong>
      <div style="font-size:0.85rem;color:var(--muted);font-family:'JetBrains Mono',monospace;">
        ${Object.entries(p.rate_limit).map(([k, v]) => `<div>${escapeHtml(k)}: ${escapeHtml(String(v))}</div>`).join('')}
      </div>
    </div>
    ` : ''}
    ${p.notes ? `
    <div style="margin-top:1rem;padding:1rem;background:var(--bg);border-radius:12px;border:1px solid var(--border);color:var(--muted);font-size:0.85rem;">
      ${escapeHtml(p.notes)}
    </div>
    ` : ''}
    <div class="modal-actions">
      <a href="${escapeHtml(p.website)}" target="_blank" rel="noopener" class="btn btn-secondary">${t('modal_website')}</a>
      <a href="${escapeHtml(p.api_base)}${escapeHtml(p.models_endpoint)}" target="_blank" rel="noopener" class="btn btn-primary">${t('modal_models_api')}</a>
    </div>
  `;
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
    if (e.key === 'Escape') {
      closeModal();
    }
  });
}

function releaseFocus() {
  // Implementation would release trapped focus
}

document.getElementById('modal-close').addEventListener('click', closeModal);
modal.addEventListener('click', e => { 
  if (e.target === modal) closeModal(); 
});
document.addEventListener('keydown', e => { 
  if (e.key === 'Escape') closeModal(); 
});

// ===== Toast =====
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.2s ease';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 200);
  }, 3000);
}

// Add toast out animation
const style = document.createElement('style');
style.textContent = `
  @keyframes toastOut {
    to { opacity: 0; transform: translateX(100%); }
  }
`;
document.head.appendChild(style);

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ===== Build Time =====
document.getElementById('build-time').textContent = new Date().toISOString().split('T')[0];

// ===== Initialize =====
async function init() {
  // Load i18n first
  await loadI18n();
  
  // Apply saved theme
  setTheme(currentTheme);
  
  // Apply language
  document.documentElement.lang = currentLang;
    applyI18n();
  
    resizeCanvas();
    if (!reducedMotion) { 
      initParticles(); 
      animationFrameId = requestAnimationFrame(animate); 
    }

    const data = await fetchProviders();
        if (data) {
            renderProviders(data.providers);
            document.getElementById('last-probe').textContent = data.updated
                ? new Date(data.updated).toLocaleString()
                : '—';
            document.getElementById('data-version').textContent = data.version || '1.0';

            // Initialize comparison feature after providers are loaded
            updateCompareSelect();
            document.getElementById('compare-select').addEventListener('change', (e) => {
                const slug = e.target.value;
                if (slug && !selectedProviders.has(slug)) {
                    addToCompare(slug);
                    e.target.value = ''; // Reset select
                }
            });
        
            // Initialize all new features
            initAllFeatures();
        }

  // Filter listeners with debounce
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  };

  const updateView = debounce(() => {
    if (providersData) {
      renderProviders(providersData.providers);
    }
  }, 150);

  ['search-input', 'tier-filter', 'status-filter'].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('input', updateView);
    el.addEventListener('change', updateView);
  });
}

// Start initialization
        init().catch(console.error);
        
        // ===== Event Listeners =====
        // Language toggle
        document.getElementById('lang-btn').addEventListener('click', () => {
          setLanguage(currentLang === 'en' ? 'zh' : 'en');
        });
        
        // Theme toggle
        document.querySelectorAll('.theme-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            setTheme(btn.dataset.theme);
          });
        });
        
        // ===== Comparison Logic =====
        let selectedProviders = new Set();
        let bookmarks = new Set(JSON.parse(localStorage.getItem('bookmarks') || '[]'));
        
        function updateCompareSelect() {
          if (!providersData) return;
          
          const compareSelect = document.getElementById('compare-select');
          // Clear and repopulate options
          compareSelect.innerHTML = '<option value="">Select a provider to compare...</option>';
          providersData.providers.forEach(p => {
            if (!selectedProviders.has(p.slug)) {
              const option = document.createElement('option');
              option.value = p.slug;
              option.textContent = p.name;
              compareSelect.appendChild(option);
            }
          });
        }
        
        function renderComparison() {
          const compareGrid = document.getElementById('compare-grid');
          if (selectedProviders.size === 0) {
            compareGrid.innerHTML = '';
            return;
          }
          
          compareGrid.innerHTML = '';
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
                  <span class="compare-metric-value">${t(p.status || 'unknown')}</span>
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
            
            compareGrid.appendChild(card);
          });
          
          // Add event listeners for remove buttons (event delegation)
          compareGrid.querySelectorAll('[data-remove]').forEach(btn => {
            btn.addEventListener('click', (e) => {
              const slug = e.target.getAttribute('data-remove');
              removeFromCompare(slug);
            });
          });
        }
        
        function addToCompare(slug) {
          if (selectedProviders.size >= 3) {
            showToast(t('compare_limit'), 'error');
            return;
          }
          selectedProviders.add(slug);
          updateCompareSelect();
          renderComparison();
          showToast(t('toast_added'), 'success');
        }
        
        function removeFromCompare(slug) {
          selectedProviders.delete(slug);
          updateCompareSelect();
          renderComparison();
        }
        
        // Make removeFromCompare globally accessible
        window.removeFromCompare = removeFromCompare;
        
        // ===== Cost Calculator =====
        function calculateCosts() {
          if (!providersData) return;
          
          const inputTokens = parseInt(document.getElementById('calc-input-tokens').value) || 0;
          const outputTokens = parseInt(document.getElementById('calc-output-tokens').value) || 0;
          const resultsContainer = document.getElementById('calculator-results');
          
          resultsContainer.innerHTML = '';
          
          // Add header
          const header = document.createElement('div');
          header.className = 'calc-result-card';
          header.style.fontWeight = '600';
          header.style.borderBottom = '2px solid var(--accent)';
          header.innerHTML = `
            <div>${t('calc_provider')}</div>
            <div style="text-align:right;">${t('calc_estimate')}</div>
            <div style="text-align:right;">Model</div>
            <div style="text-align:right;">Per 1M Tokens</div>
          `;
          resultsContainer.appendChild(header);
          
          // Sort providers: permanent_free first, then by health
          const sortedProviders = [...providersData.providers].sort((a, b) => {
            if (a.tier === 'permanent_free' && b.tier !== 'permanent_free') return -1;
            if (a.tier !== 'permanent_free' && b.tier === 'permanent_free') return 1;
            return (b.health_score || 0) - (a.health_score || 0);
          });
          
          sortedProviders.forEach(p => {
            const card = document.createElement('div');
            card.className = 'calc-result-card ' + p.tier;
            
            let cost = 0;
            let costType = 'unknown';
            let costText = '—';
            let perMText = '—';
            
            if (p.tier === 'permanent_free') {
              cost = 0;
              costType = 'free';
              costText = '$0';
              perMText = 'Free';
            } else if (p.tier === 'trial_credit') {
              // Estimate based on typical trial limits
              const inputCost = (inputTokens / 1000000) * 0.5; // Estimated $0.5 per 1M input
              const outputCost = (outputTokens / 1000000) * 1.5; // Estimated $1.5 per 1M output
              cost = (inputCost + outputCost).toFixed(2);
              costType = 'trial';
              costText = `~$${cost}`;
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
        
        // Calculator event listeners
        ['calc-input-tokens', 'calc-output-tokens', 'calc-ratio-preset'].forEach(id => {
          const el = document.getElementById(id);
          if (el) {
            el.addEventListener('input', calculateCosts);
            el.addEventListener('change', calculateCosts);
          }
        });
        
        // Ratio preset handling
        const ratioSelect = document.getElementById('calc-ratio-preset');
        if (ratioSelect) {
          ratioSelect.addEventListener('change', (e) => {
            const value = e.target.value;
            if (value !== 'custom') {
              const [inRatio, outRatio] = value.split(':').map(Number);
              document.getElementById('calc-input-tokens').value = inRatio * 10000; // Base unit
              document.getElementById('calc-output-tokens').value = outRatio * 10000;
              calculateCosts();
            }
          });
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
              return {
                name: p.name,
                slug: p.slug,
                tier: p.tier,
                status: p.status,
                health_score: p.health_score,
                models: p.models,
                features: p.features
              };
            }).filter(Boolean),
            exported_at: new Date().toISOString(),
            language: currentLang
          };
          
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'free-llm-atlas-comparison.json';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          showToast(t('toast_copied'), 'success');
        }
        
        function exportToMarkdown() {
          let md = '# Free LLM Atlas Comparison\n\n';
          md += `| ${t('modal_provider')} | ${t('modal_tier')} | ${t('modal_status')} | ${t('modal_health')} | ${t('modal_models')} | ${t('modal_features')} |\n`;
          md += '|---------|------|--------|--------|--------|----------|\n';
          
          selectedProviders.forEach(slug => {
            const p = providersData.providers.find(x => x.slug === slug);
            if (!p) return;
            md += `| ${escapeHtml(p.name)} | ${p.tier.replace('_', ' ')} | ${t(p.status || 'unknown')} | ${p.health_score || '—'}/100 | ${p.models_count || 0} | ${(p.features || []).join(', ') || '—'} |\n`;
          });
          
          const blob = new Blob([md], { type: 'text/markdown' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'free-llm-atlas-comparison.md';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          showToast(t('toast_copied'), 'success');
        }
        
        // Share button event listeners
        document.getElementById('share-copy-link').addEventListener('click', () => {
          const link = generateShareLink();
          if (!link) {
            showToast(t('toast_error'), 'error');
            return;
          }
          
          const urlInput = document.getElementById('share-url-input');
          urlInput.value = link;
          document.getElementById('share-url').style.display = 'flex';
          
          navigator.clipboard.writeText(link).then(() => {
            showToast(t('share_copied'), 'success');
          });
        });
        
        document.getElementById('share-export-json').addEventListener('click', exportToJSON);
        document.getElementById('share-export-md').addEventListener('click', exportToMarkdown);
        
        // ===== Bookmarks =====
        function toggleBookmark(slug) {
          if (bookmarks.has(slug)) {
            bookmarks.delete(slug);
          } else {
            bookmarks.add(slug);
          }
          localStorage.setItem('bookmarks', JSON.stringify([...bookmarks]));
          renderBookmarks();
          showToast(bookmarks.has(slug) ? t('toast_added') : t('toast_removed'), 'success');
        }
        
        function renderBookmarks() {
          const grid = document.getElementById('bookmark-grid');
          grid.innerHTML = '';
          
          if (bookmarks.size === 0) {
            grid.innerHTML = `<p style="color:var(--muted);text-align:center;grid-column:1/-1;padding:2rem;">${t('bookmark_empty')}</p>`;
            return;
          }
          
          bookmarks.forEach(slug => {
            const p = providersData.providers.find(x => x.slug === slug);
            if (!p) return;
            
            const card = document.createElement('div');
            card.className = 'bookmark-card';
            card.innerHTML = `
              <div class="bookmark-info">
                <div class="bookmark-name">${escapeHtml(p.name)}</div>
                <div class="bookmark-meta">
                  <span>${p.models_count || 0} models</span>
                  <span>${p.health_score || '—'}/100 health</span>
                  <span>${p.status || 'unknown'}</span>
                </div>
              </div>
              <button class="bookmark-remove" data-slug="${p.slug}" title="Remove bookmark">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            `;
            
            grid.appendChild(card);
          });
          
          // Add remove listeners
          grid.querySelectorAll('.bookmark-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
              const slug = e.currentTarget.getAttribute('data-slug');
              toggleBookmark(slug);
            });
          });
        }
        
        // Add bookmark button to provider cards
        function addBookmarkButtons() {
          document.querySelectorAll('.provider-card').forEach(card => {
            const slug = card.dataset.slug;
            const existing = card.querySelector('.provider-bookmark');
            if (!existing) {
              const btn = document.createElement('button');
              btn.className = 'provider-bookmark' + (bookmarks.has(slug) ? ' saved' : '');
              btn.innerHTML = bookmarks.has(slug) ? '★' : '☆';
              btn.title = bookmarks.has(slug) ? 'Remove bookmark' : 'Add to bookmarks';
              btn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleBookmark(slug);
              });
              card.appendChild(btn);
            }
          });
        }
        
        // ===== Speed Test =====
        function runSpeedTest() {
          if (!providersData) return;
          
          const grid = document.getElementById('speed-grid');
          const runBtn = document.getElementById('speed-run-all');
          const clearBtn = document.getElementById('speed-clear');
          
          runBtn.style.display = 'none';
          clearBtn.style.display = 'inline-flex';
          grid.innerHTML = '';
          
          // Create cards for all providers
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
          
          // Run tests with batching (max 5 concurrent)
          const batchSize = 5;
          const providers = providersData.providers.slice(0, 15); // Limit to first 15 for performance
          
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
            if (currentIndex < providers.length) {
              setTimeout(testNext, 500); // Small delay between batches
            }
          }
          
          testNext();
        }
        
        async function checkEndpoint(provider) {
          try {
            const start = performance.now();
            await fetch(provider.website, { mode: 'no-cors', cache: 'no-store' });
            const end = performance.now();
            return Math.round(end - start);
          } catch (e) {
            return null;
          }
        }
        
        // Speed test button listener
        document.getElementById('speed-run-all').addEventListener('click', runSpeedTest);
        document.getElementById('speed-clear').addEventListener('click', () => {
          document.getElementById('speed-grid').innerHTML = '';
          document.getElementById('speed-run-all').style.display = 'inline-flex';
          document.getElementById('speed-clear').style.display = 'none';
        });
        
        // ===== Feature Filters =====
        function setupFeatureFilters() {
          // This would be populated based on available features in providersData
          // For now, we'll add it after data loads
        }
        
        // ===== Initialize all features after data load =====
        async function initAllFeatures() {
          if (!providersData) return;
          
          // Add bookmark buttons to provider cards
          addBookmarkButtons();
          
          // Render bookmarks
          renderBookmarks();
          
          // Initialize calculator
          calculateCosts();
          
          // Setup feature filters (placeholder for now)
          setupFeatureFilters();
          
          // Update share link if comparison has selections
          if (selectedProviders.size > 0) {
            document.getElementById('share-url').style.display = 'none'; // Hide until user clicks copy
          }
        }
        
        // ===== Cleanup =====
