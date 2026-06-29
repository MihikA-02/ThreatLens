// components/riskScore.js

import { animateNumber, animateCircle, getScoreColor, getScoreClass, getScoreBgClass } from '../js/utils/animate.js';

export function renderRiskScore(container, result) {
  const { riskScore, threatLevel, aiConfidence, summary, threatTags } = result;
  const color = getScoreColor(riskScore);
  const scoreClass = getScoreClass(riskScore);
  const badgeClass = getScoreBgClass(riskScore);

  const tagsHTML = (threatTags || []).map(tag => `
    <span class="threat-tag ${badgeClass}" style="font-size:12px">
      ${tag.name}
      <span class="tag-tooltip">${tag.tooltip || ''}</span>
    </span>
  `).join('');

  const now = new Date();
  const scanTime = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    + ', ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  container.innerHTML = `
    <div class="risk-score-section card" style="position:relative; overflow:hidden;">
      <div class="risk-score-title">Overall Risk Score</div>
      <div class="risk-score-inner">
        <div class="risk-circle-wrap">
          <svg class="risk-circle-svg" viewBox="0 0 120 120">
            <circle class="risk-circle-track" cx="60" cy="60" r="52"/>
            <circle id="risk-fill" class="risk-circle-fill" cx="60" cy="60" r="52"
              style="stroke-dasharray:326; stroke-dashoffset:326; transition: stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1), stroke 0.5s ease;"/>
          </svg>
          <div class="risk-circle-label">
            <span id="risk-number" class="risk-number ${scoreClass}">0</span>
            <span class="risk-denom">/100</span>
          </div>
        </div>

        <div class="risk-meta">
          <div id="risk-level" class="risk-level ${scoreClass}">${threatLevel} Risk</div>
          <div class="risk-badge ${badgeClass}">
            ⚠ Threat Detected
          </div>
          <div class="risk-summary">${summary}</div>
          <div class="threat-tags-row">${tagsHTML}</div>
          <div class="scan-meta">
            <span>Scanned At: ${scanTime}</span>
            <span>AI Confidence: <span style="color:var(--color-safe);font-weight:700">${aiConfidence}%</span></span>
          </div>
        </div>
      </div>

      <!-- Hacker SVG decoration -->
      <div class="hacker-figure">
        <img src="./assets/images/hooded-hacker.png" alt="Threat" class="hacker-image">
      </div>
    </div>
  `;

  // Animate
  const fill = container.querySelector('#risk-fill');
  const numEl = container.querySelector('#risk-number');
  animateCircle(fill, riskScore, color);
  animateNumber(numEl, 0, riskScore, 1200);
}

