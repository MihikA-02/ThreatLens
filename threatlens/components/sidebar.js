// components/sidebar.js

import { navigate } from '../js/modules/router.js';
import { ROUTES } from '../js/config/app.config.js';

const NAV_ITEMS = [
  { page: ROUTES.DASHBOARD, icon: houseIcon(), label: 'Dashboard' },
  { page: ROUTES.HISTORY, icon: clockIcon(), label: 'History' },
  { page: ROUTES.HOW_TO_USE, icon: bookIcon(), label: 'How to Use' },
  { page: ROUTES.CYBER_RULES, icon: shieldIcon(), label: 'Cyber Rules' },
  { page: ROUTES.SETTINGS, icon: gearIcon(), label: 'Settings' },
];

export function renderSidebar(container) {
  container.innerHTML = `
    <a class="sidebar-logo" id="logo-link" href="#">
      <div class="logo-icon">
        <img src="./assets/images/logo.png"
             alt="ThreatLens Logo"
             class="logo-image">
      </div>
      <span class="logo-title">ThreatLens</span>
      <span class="logo-sub">AI-Powered Scam &<br>Phishing Detector</span>
    </a>

    <nav class="sidebar-nav">
      ${NAV_ITEMS.map(item => `
        <div class="nav-item" data-page="${item.page}">
          <span class="nav-icon">${item.icon}</span>
          <span>${item.label}</span>
        </div>
      `).join('')}
    </nav>

    <div class="sidebar-footer">
      <div class="sidebar-promo">
        <div class="sidebar-promo-icon">${promoShieldSVG()}</div>
        <div class="sidebar-promo-text">
          <strong>Stay Aware.</strong>
          Stay Secure.<br>
          <span style="color:var(--color-accent-bright)">Stay One Step Ahead.</span>
        </div>
      </div>
    </div>
  `;

  // Nav click handlers
  container.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.page));
  });

  // Logo → Dashboard
  container.querySelector('#logo-link').addEventListener('click', e => {
    e.preventDefault();
    navigate(ROUTES.DASHBOARD);
  });
}

// ---- Icon helpers ----
function houseIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
}
function clockIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
}
function bookIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>`;
}
function shieldIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
}
function gearIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`;
}

function logoSVG() {
  return `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="lg1" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#c084fc"/>
        <stop offset="100%" stop-color="#7c3aed"/>
      </radialGradient>
    </defs>
    <circle cx="30" cy="30" r="28" fill="url(#lg1)" opacity="0.2"/>
    <circle cx="30" cy="30" r="22" fill="none" stroke="#8b5cf6" stroke-width="1.5" stroke-dasharray="4 3"/>
    <!-- Magnifier -->
    <circle cx="27" cy="26" r="11" fill="none" stroke="#a78bfa" stroke-width="2.5"/>
    <line x1="35" y1="34" x2="44" y2="43" stroke="#a78bfa" stroke-width="3" stroke-linecap="round"/>
    <!-- Warning triangle -->
    <polygon points="27,19 20,31 34,31" fill="none" stroke="#ef4444" stroke-width="2" stroke-linejoin="round"/>
    <line x1="27" y1="23" x2="27" y2="27" stroke="#ef4444" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="27" cy="29.5" r="1" fill="#ef4444"/>
  </svg>`;
}

function promoShieldSVG() {
  return `<svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" width="44" height="44">
    <defs>
      <radialGradient id="sg1" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#c084fc"/>
        <stop offset="100%" stop-color="#4c1d95"/>
      </radialGradient>
    </defs>
    <path d="M22 4 L38 11 L38 24 C38 33 22 42 22 42 C22 42 6 33 6 24 L6 11 Z" fill="url(#sg1)" opacity="0.85"/>
    <path d="M22 4 L38 11 L38 24 C38 33 22 42 22 42 C22 42 6 33 6 24 L6 11 Z" fill="none" stroke="#a78bfa" stroke-width="1.5"/>
    <path d="M15 22 L20 27 L29 18" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}
