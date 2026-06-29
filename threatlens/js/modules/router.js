// js/modules/router.js

import { State } from './state.js';
import { renderDashboard } from '../../pages/dashboard.js?v=3';
import { renderHistory } from '../../pages/history.js';
import { renderHowTo } from '../../pages/howto.js';
import { renderCyberRules } from '../../pages/cyberrules.js';
import { renderSettings } from '../../pages/settings.js';

const PAGE_RENDERERS = {
  dashboard:   renderDashboard,
  history:     renderHistory,
  howto:       renderHowTo,
  cyberrules:  renderCyberRules,
  settings:    renderSettings,
};

export function navigate(page) {
  State.set('currentPage', page);

  const main = document.getElementById('main-content');
  if (!main) return;

  main.innerHTML = '';

  const renderer = PAGE_RENDERERS[page];
  if (renderer) {
    renderer(main);
  }

  // Update nav active state
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });

  // Close mobile sidebar
  closeMobileSidebar();
}

export function closeMobileSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebar-overlay')?.classList.remove('visible');
}
