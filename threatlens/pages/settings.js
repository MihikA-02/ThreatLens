// pages/settings.js

import { State, saveHistory } from '../js/modules/state.js';
import { showToast } from '../js/utils/toast.js';

export function renderSettings(container) {
  const isDark = State.get('theme') === 'dark';
  const animEnabled = State.get('animations') !== false;

  container.innerHTML = `
    <div class="top-bar">
      <div class="ai-status"><div class="ai-status-dot"></div>AI Engine Online</div>
    </div>
    <div class="settings-page page">
      <h1>Settings</h1>

      <div class="settings-group">
        <div class="settings-group-title">Appearance</div>
        <div class="settings-item">
          <div class="settings-item-info">
            <h3>Dark Mode</h3>
            <p>Use dark futuristic theme (recommended)</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="dark-mode-toggle" ${isDark ? 'checked' : ''}/>
            <div class="toggle-track"></div>
          </label>
        </div>
        <div class="settings-item">
          <div class="settings-item-info">
            <h3>Animations</h3>
            <p>Enable smooth transitions and chart animations</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="anim-toggle" ${animEnabled ? 'checked' : ''}/>
            <div class="toggle-track"></div>
          </label>
        </div>
      </div>

      <div class="settings-group">
        <div class="settings-group-title">Data</div>
        <div class="settings-item">
          <div class="settings-item-info">
            <h3>Clear Analysis History</h3>
            <p>Permanently delete all saved analysis records</p>
          </div>
          <button class="settings-danger-btn" id="clear-history-btn">Clear History</button>
        </div>
      </div>

      <div class="about-box">
        <div style="margin-bottom:12px">
          <img src="./assets/images/logo.png" alt="ThreatLens Logo" class="settings-logo">
        </div>
        <h2>ThreatLens</h2>
        <p>AI-Powered Scam &amp; Phishing Detector</p>
        <p style="margin-top:8px;font-size:13px;color:var(--color-text-secondary)">
          Protecting you from phishing, scams, and malicious content<br>using advanced AI analysis.
        </p>
        <p class="version">v1.0.0 </p>
      </div>
    </div>
  `;

  // Dark mode toggle
  container.querySelector('#dark-mode-toggle')?.addEventListener('change', e => {
    const theme = e.target.checked ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    State.set('theme', theme);
    localStorage.setItem('tl_theme', theme);
    showToast(`${theme === 'dark' ? 'Dark' : 'Light'} mode enabled`, 'success');
  });

  // Animation toggle
  container.querySelector('#anim-toggle')?.addEventListener('change', e => {
    const enabled = e.target.checked;
    document.documentElement.dataset.animations = enabled;
    State.set('animations', enabled);
    localStorage.setItem('tl_animations', enabled);
    showToast(`Animations ${enabled ? 'enabled' : 'disabled'}`, 'success');
  });

  // Clear history
  container.querySelector('#clear-history-btn')?.addEventListener('click', () => {
    if (confirm('Clear all analysis history? This cannot be undone.')) {
      State.set('history', []);
      saveHistory([]);
      showToast('History cleared', 'success');
    }
  });
}
