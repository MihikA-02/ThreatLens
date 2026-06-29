// pages/history.js

import { State, saveHistory } from '../js/modules/state.js';
import { showToast } from '../js/utils/toast.js';
import { getScoreColor, getScoreClass } from '../js/utils/animate.js';

export function renderHistory(container) {
  container.innerHTML = `
    <div class="top-bar">
      <div class="ai-status"><div class="ai-status-dot"></div>AI Engine Online</div>
    </div>
    <div class="history-page page">
      <div class="history-header">
        <h1>Analysis History</h1>
        <div class="history-controls">
          <input type="text" class="search-input" id="history-search" placeholder="Search history..." />
          <div class="filter-btns">
            <button class="filter-btn active" data-filter="all">All</button>
            <button class="filter-btn" data-filter="High">High Risk</button>
            <button class="filter-btn" data-filter="Medium">Medium</button>
            <button class="filter-btn" data-filter="Safe">Safe</button>
          </div>
          <button class="clear-all-btn" id="clear-all-btn">🗑 Clear All</button>
        </div>
      </div>
      <div class="history-grid" id="history-grid"></div>
    </div>
  `;

  let filter = 'all';
  let search = '';

  function renderCards() {
    const history = State.get('history') || [];
    const grid = container.querySelector('#history-grid');
    const filtered = history.filter(h => {
      const matchFilter = filter === 'all' ||
        (filter === 'High' && h.riskScore >= 60) ||
        (filter === 'Medium' && h.riskScore >= 30 && h.riskScore < 60) ||
        (filter === 'Safe' && h.riskScore < 30);
      const matchSearch = !search || h.preview?.toLowerCase().includes(search) || h.threatLevel?.toLowerCase().includes(search);
      return matchFilter && matchSearch;
    });

    if (!filtered.length) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--color-text-muted);padding:48px;font-size:14px">
        <div style="font-size:36px;margin-bottom:10px">📂</div>
        No analysis history yet.
      </div>`;
      return;
    }

    grid.innerHTML = filtered.map(h => {
      const color = getScoreColor(h.riskScore);
      const cls   = getScoreClass(h.riskScore);
      const date  = new Date(h.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
      const typeIcon = { url: '🔗', email: '✉️', message: '💬', screenshot: '🖼️' }[h.inputType] || '🔍';

      return `<div class="history-card" data-id="${h.id}">
        <div class="history-card-header">
          <div class="history-input-type">${typeIcon} ${h.inputType?.toUpperCase()}</div>
          <button class="history-delete-btn" data-del="${h.id}" title="Delete">🗑</button>
        </div>
        <div class="history-score-row">
          <div class="history-score-circle ${cls}" style="border-color:${color};color:${color}">
            ${h.riskScore}
          </div>
          <div class="history-meta">
            <div class="history-level ${cls}">${h.threatLevel} Risk</div>
            <div class="history-date">${date}</div>
          </div>
        </div>
        <div class="history-summary">${h.summary || ''}</div>
      </div>`;
    }).join('');

    // Delete individual
    grid.querySelectorAll('.history-delete-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        deleteEntry(btn.dataset.del);
        renderCards();
      });
    });

    // Click card to view full report  
    grid.querySelectorAll('.history-card').forEach(card => {
      card.addEventListener('click', () => {
        const h = history.find(x => x.id === parseInt(card.dataset.id));
        if (h?.result) {
          State.set('analysisResult', h.result);
          import('../js/modules/router.js').then(m => m.navigate('dashboard'));
        }
      });
    });
  }

  function deleteEntry(id) {
    const history = (State.get('history') || []).filter(h => h.id !== parseInt(id));
    State.set('history', history);
    saveHistory(history);
    showToast('Entry deleted', 'success');
  }

  // Filter buttons
  container.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filter = btn.dataset.filter;
      renderCards();
    });
  });

  // Search
  container.querySelector('#history-search')?.addEventListener('input', e => {
    search = e.target.value.toLowerCase();
    renderCards();
  });

  // Clear all
  container.querySelector('#clear-all-btn')?.addEventListener('click', () => {
    if (confirm('Clear all analysis history?')) {
      State.set('history', []);
      saveHistory([]);
      renderCards();
      showToast('History cleared', 'success');
    }
  });

  renderCards();
}
