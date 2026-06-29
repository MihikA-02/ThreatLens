// script.js – ThreatLens Frontend Brain
// Bootstraps the app: sidebar, router, state, mobile menu

import { loadPersistedState } from './js/modules/state.js';
import { navigate, closeMobileSidebar } from './js/modules/router.js';
import { renderSidebar } from './components/sidebar.js';
import { ROUTES } from './js/config/app.config.js';

async function boot() {
  // 1. Load persisted prefs (theme, animations, history)
  loadPersistedState();

  // 2. Render sidebar
  const sidebarEl = document.getElementById('sidebar');
  if (sidebarEl) renderSidebar(sidebarEl);

  // 3. Mobile sidebar toggle button
  injectMobileToggle();

  // 4. Sidebar overlay (close on click)
  document.getElementById('sidebar-overlay')?.addEventListener('click', closeMobileSidebar);

  // 5. Navigate to default page
  navigate(ROUTES.DASHBOARD);
}

function injectMobileToggle() {
  const btn = document.createElement('button');
  btn.className = 'sidebar-toggle';
  btn.setAttribute('aria-label', 'Toggle sidebar');
  btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
  btn.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.toggle('open');
    document.getElementById('sidebar-overlay')?.classList.toggle('visible');
  });
  document.body.appendChild(btn);
}

boot();
