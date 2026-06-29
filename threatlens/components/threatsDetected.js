// components/threatsDetected.js

const THREAT_ICONS = {
  Critical: '🔴',
  High:     '🟠',
  Medium:   '🟡',
  Low:      '🟢',
};

export function renderThreatsDetected(container, threats) {
  container.innerHTML = `
    <div class="section-title">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      Threats Detected
    </div>
    <div class="threat-list" id="threat-list"></div>
  `;

  const list = container.querySelector('#threat-list');

  if (!threats?.length) {
    list.innerHTML = `<div class="no-results"><div class="no-results-icon">✅</div>No threats detected</div>`;
    return;
  }

  threats.forEach(t => {
    const item = document.createElement('div');
    item.className = 'threat-item';
    item.innerHTML = `
      <div>
        <div class="threat-item-name">
          ${THREAT_ICONS[t.severity] || '⚪'}
          <span style="color:${getSeverityColor(t.severity)}">${t.name}</span>
        </div>
        <div class="threat-item-desc">${t.description}</div>
        ${t.detail ? `<div class="threat-detail-expanded">${t.detail}</div>` : ''}
      </div>
      <div class="severity-badge ${t.severity?.toLowerCase()}">${t.severity}</div>
    `;
    item.addEventListener('click', () => item.classList.toggle('open'));
    list.appendChild(item);
  });
}

function getSeverityColor(severity) {
  const map = { Critical: '#ef4444', High: '#f97316', Medium: '#f59e0b', Low: '#22c55e' };
  return map[severity] || 'var(--color-text-primary)';
}
