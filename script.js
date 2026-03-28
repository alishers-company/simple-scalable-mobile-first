'use strict';

/* ===================================================
   simple, scalable, mobile-first — script.js
   =================================================== */

// ── Mobile navigation toggle ──────────────────────────────────────────────────
const hamburger = document.getElementById('mobile-nav-toggle');
const navLinks  = document.getElementById('nav-links');

hamburger?.addEventListener('click', () => {
  const expanded = hamburger.getAttribute('aria-expanded') === 'true';
  hamburger.setAttribute('aria-expanded', String(!expanded));
  navLinks?.classList.toggle('open');
});

// Close mobile nav when any link is clicked
navLinks?.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger?.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('open');
  });
});

// ── Active nav link tracking via IntersectionObserver ────────────────────────
const sections  = document.querySelectorAll('section[id], div[id="hero-section"]');
const navItems  = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navItems.forEach(a => {
        const href = a.getAttribute('href');
        const matches =
          href === '#home'         && (entry.target.id === 'home' || entry.target.id === 'hero-section') ||
          href === '#driver-flow'  && entry.target.id === 'driver-flow' ||
          href === '#metrics'      && entry.target.id === 'metrics';
        a.classList.toggle('active', matches);
      });
    }
  });
}, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });

sections.forEach(s => sectionObserver.observe(s));

// ── Smooth scrolling for all internal anchor links ────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id     = link.getAttribute('href');
    const target = id === '#' ? null : document.querySelector(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── Scroll-triggered fade-in ──────────────────────────────────────────────────
const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card, .who-card').forEach(el => {
  el.classList.add('fade-in');
  fadeObserver.observe(el);
});

// ── Interactive Demo: Driver accepts request, gets client info, navigates ──────
const demoScreens = document.querySelectorAll('.demo-screen');
const stepBtns    = document.querySelectorAll('.step-btn');
const prevBtn     = document.getElementById('demo-prev');
const nextBtn     = document.getElementById('demo-next');
const stepNumEl   = document.getElementById('demo-step-num');
let currentStep   = 0;
const totalSteps  = demoScreens.length;

function goToStep(step) {
  const next = Math.max(0, Math.min(step, totalSteps - 1));

  // Update screens
  demoScreens[currentStep]?.classList.remove('active');
  demoScreens[next]?.classList.add('active');

  // Update step buttons (aria + active class)
  stepBtns[currentStep]?.classList.remove('active');
  stepBtns[currentStep]?.setAttribute('aria-selected', 'false');
  stepBtns[next]?.classList.add('active');
  stepBtns[next]?.setAttribute('aria-selected', 'true');

  currentStep = next;

  // Update step counter
  if (stepNumEl) stepNumEl.textContent = currentStep + 1;

  // Update prev/next buttons
  if (prevBtn) prevBtn.disabled = currentStep === 0;
  if (nextBtn) nextBtn.disabled = currentStep === totalSteps - 1;
}

prevBtn?.addEventListener('click', () => goToStep(currentStep - 1));
nextBtn?.addEventListener('click', () => goToStep(currentStep + 1));
stepBtns.forEach((btn, i) => {
  btn.addEventListener('click', () => goToStep(i));
});

// "Accept Job" / "Navigate to Pickup" inline buttons advance the demo
document.querySelectorAll('.demo-next-btn').forEach(btn => {
  btn.addEventListener('click', () => goToStep(currentStep + 1));
});

// "Mark as Arrived" button interaction
const arriveBtn = document.querySelector('.ds-btn-arrive');
arriveBtn?.addEventListener('click', () => {
  if (arriveBtn.disabled) return;
  arriveBtn.textContent  = 'Arrived ✓';
  arriveBtn.disabled     = true;
  arriveBtn.style.background = '#16a34a';
});

// ── Metrics: load from assets/metrics.json ────────────────────────────────────
function renderMetrics(data) {
  const grid = document.getElementById('metrics-grid');
  if (!grid || !Array.isArray(data)) return;

  grid.innerHTML = data
    .map(m => `<div class="metric-stat fade-in">
      <p class="metric-stat-value">${m.value}</p>
      <p class="metric-stat-label">${m.label}</p>
    </div>`)
    .join('');

  // Observe newly inserted metric cards
  grid.querySelectorAll('.metric-stat').forEach(el => fadeObserver.observe(el));
}

fetch('./assets/metrics.json')
  .then(r => { if (!r.ok) throw new Error('fetch failed'); return r.json(); })
  .then(data => renderMetrics(data))
  .catch(() => {
    // Fallback in case fetch is unavailable (e.g. local file:// open)
    renderMetrics([
      { label: 'Active Drivers',      value: '2,847' },
      { label: 'Match Rate',          value: '94%'   },
      { label: 'Active Workflows',    value: '18'    },
      { label: 'Weekly Conversions',  value: '42%'   }
    ]);
  });

// ── Primary CTA click feedback ────────────────────────────────────────────────
const primaryCta = document.getElementById('primary-cta');
primaryCta?.addEventListener('click', e => {
  e.preventDefault();
  const originalText = primaryCta.textContent;
  primaryCta.textContent = 'Getting you started…';
  primaryCta.style.pointerEvents = 'none';
  setTimeout(() => {
    primaryCta.textContent      = originalText;
    primaryCta.style.pointerEvents = '';
    const cta = document.getElementById('cta-section');
    cta?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 1000);
});
