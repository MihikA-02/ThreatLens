// pages/dashboard.js

import { State, saveHistory } from '../js/modules/state.js';
import {
  analyzeURL,
  analyzeEmail,
  analyzeMessage,
  analyzeScreenshot
} from '../js/modules/api.service.js';
import { APP_CONFIG } from '../js/config/app.config.js';
import { renderRadar } from '../components/radar.js';
import { renderRiskScore } from '../components/riskScore.js';
import { renderTimeline } from '../components/aiTimeline.js';
import { renderThreatsDetected } from '../components/threatsDetected.js';
import { renderRecommendations } from '../components/recommendations.js';
import { showToast } from '../js/utils/toast.js';

const EXAMPLES = APP_CONFIG.exampleInputs;
const ANALYSIS_STEPS = APP_CONFIG.analysisSteps || [];


let currentImageFile = null;
let analysisShown = false;

export function renderDashboard(container) {
  container.innerHTML = `
    <!-- Top bar -->
    <div class="top-bar">
      <div class="ai-status">
        <div class="ai-status-dot"></div>
        AI Engine Online
      </div>
      <button class="theme-toggle-btn" id="theme-toggle-btn" title="Toggle theme">🌙</button>
    </div>

    <div class="dashboard-page">
      <!-- LEFT COLUMN -->
      <div class="dashboard-left">
        <!-- Header -->
        <div class="dashboard-header">
          <h1>Analyze Any Content. <span>Stay Protected.</span></h1>
          <p>Paste a URL, email, or any message to detect phishing, scams, and malicious threats.</p>
        </div>

        <!-- Input Section -->
        <div class="input-section card">
          <!-- Tabs -->
          <div class="tab-selector" id="tab-selector">
            ${['url', 'email', 'message', 'screenshot'].map((t, i) => `
              <button class="tab-btn ${i === 0 ? 'active' : ''}" data-tab="${t}">
                ${tabIcon(t)} <span>${tabLabel(t)}</span>
              </button>
            `).join('')}
          </div>

          <div class="input-label" id="input-label">Paste a URL to analyze</div>

          <!-- URL / Email / Message inputs -->
          <div id="text-input-wrap" class="input-row">
            <input type="text" id="main-input" class="input-field"
              placeholder="https://example.com/login?verify=account" />
            <button type="button" class="analyze-btn" id="analyze-btn">
              <span>Analyze Now</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>

          <!-- Screenshot upload -->
          <div id="screenshot-wrap" style="display:none">
            <div class="upload-area" id="upload-area">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto;color:var(--color-accent-bright)"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <p>Click to upload or drag & drop<br><span style="font-size:11px">PNG, JPG, JPEG supported</span></p>
              <input type="file" id="file-input" accept=".png,.jpg,.jpeg" style="display:none"/>
            </div>
            <div id="preview-wrap" style="display:none;margin-top:12px">
              <div class="upload-preview">
                <img id="preview-img" src="" alt="Screenshot preview"/>
                <button class="remove-img-btn" id="remove-img">✕</button>
              </div>
            </div>
            <div class="input-row" style="margin-top:12px">
              <div style="flex:1"></div>
              <button type="button" class="analyze-btn" id="analyze-btn-img">
                <span>Analyze Now</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </div>
          </div>

          <!-- Quick examples -->
          <div class="quick-examples" id="quick-examples">
            <span class="quick-examples-label">Quick examples:</span>
            ${(EXAMPLES.url || []).map(e => `<button class="example-chip" data-value="${e.value}">${e.label}</button>`).join('')}
          </div>

          <!-- Outdated banner -->
          <div class="outdated-banner" id="outdated-banner">
            ⚠ Analysis Outdated – input has changed
          </div>
        </div>

        <!-- Loading progress -->
        <div class="card analysis-progress" id="analysis-progress">
          <div class="progress-spinner"></div>
          <div>
            <div class="progress-text">Analyzing content...</div>
            <div class="progress-step" id="progress-step">Receiving input...</div>
          </div>
        </div>

        <!-- Error card -->
        <div id="error-card-wrap"></div>

        <!-- Risk Score -->
        <div id="risk-score-wrap"></div>

        <!-- Threats + Recommendations -->
        <div id="analysis-results">

    <div class="threats-recs-row" id="threats-recs-row">

        <div class="threats-section card" id="threats-wrap"></div>

        <div class="recs-section card" id="recs-wrap"></div>

    </div>

</div>

<!-- Tip bar -->
        <div class="tip-bar" id="tip-bar" style="display:none">
          💡 <em>When in doubt, don't click. Always double-check the source.</em>
        </div>

        <!-- Cyber Helpline -->
        <div class="helpline-section card">
          <div class="helpline-inner">
            <div class="helpline-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.72 19.79 19.79 0 01.06 1.1 2 2 0 012 .08h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
            </div>
            <div class="helpline-info">
              <h3>Cyber Helpline &amp; Contact</h3>
              <p>Need help or want to report a cyber crime?</p>
            </div>
            <div class="helpline-contacts">
              <div class="helpline-contact">
                <div>
                  <div class="helpline-contact-value">1930</div>
                  <div class="helpline-contact-label">(24x7 Helpline)</div>
                </div>
              </div>
              <div class="helpline-contact" style="flex-direction:column;gap:4px">
                <a class="helpline-contact-link" href="mailto:help@cybercrime.gov.in">help@cybercrime.gov.in</a>
                <div class="helpline-contact-label">Email Support</div>
              </div>
              <div class="helpline-contact" style="flex-direction:column;gap:4px">
                <a class="helpline-contact-link" href="https://cybercrime.gov.in" target="_blank">www.cybercrime.gov.in</a>
                <div class="helpline-contact-label">Official Website</div>
              </div>
            </div>
            <div class="helpline-btns">
              <button class="helpline-btn" onclick="navigator.clipboard.writeText('1930');window.showToast&&showToast('Copied!','success')">Copy Number</button>
              <button class="helpline-btn" onclick="navigator.clipboard.writeText('https://cybercrime.gov.in');window.showToast&&showToast('Copied!','success')">Copy Website</button>
              <button class="helpline-btn" onclick="window.open('https://cybercrime.gov.in','_blank')">Open Website</button>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN -->
      <div class="dashboard-right">
        <!-- Threat Overview Radar -->
        <div class="card radar-section" id="radar-section">
          <div class="section-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Threat Overview (This Analysis)
          </div>
          <div class="radar-container" id="radar-container">
            ${placeholderRadar()}
          </div>
          <div class="radar-note">This radar represents the threat profile of your submitted content.</div>
        </div>

        <!-- AI Explanation Timeline -->
        <div class="card" id="timeline-section">
          <div id="timeline-wrap">
            <div class="section-title" style="padding:18px 18px 10px">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              AI Analysis Timeline
            </div>
            <div class="timeline-section">
              <div style="color:var(--color-text-muted);font-size:13px;padding:8px 0 16px">
                Run an analysis to see the AI explanation timeline.
              </div>
            </div>
          </div>
        </div>

        <!-- How to Stay Safe -->
        <div class="card">
          <div class="section-title" style="padding:18px 18px 10px">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            How to Stay Safe Online
          </div>
          <div class="safety-list">
            ${SAFETY_TIPS.map(tip => `
              <div class="safety-item">
                <span class="safety-icon">${tip.icon}</span>
                <span>${tip.text}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  initDashboard(container);
}

function initDashboard(container) {
  // Expose toast for inline buttons
  window.showToast = showToast;

  const currentTab = () => State.get('currentTab') || 'url';
  let analyzing = false;

  // Theme toggle
  const themeBtn = container.querySelector('#theme-toggle-btn');
  themeBtn?.addEventListener('click', () => {
    const isDark = document.documentElement.dataset.theme === 'dark';
    const next = isDark ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    State.set('theme', next);
    localStorage.setItem('tl_theme', next);
    themeBtn.textContent = next === 'dark' ? '🌙' : '☀️';
  });
  // Sync icon
  if (State.get('theme') === 'light') themeBtn && (themeBtn.textContent = '☀️');

  // Tab switching
  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      State.set('currentTab', tab);
      updateInputUI(container, tab);
    });
  });

  // Input changes → mark outdated
  const mainInput = container.querySelector('#main-input');
  mainInput?.addEventListener('input', () => {
    if (analysisShown) showOutdated(container, true);
  });

  // Example chips
  container.querySelectorAll('.example-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      if (mainInput) {
        mainInput.value = chip.dataset.value;
        if (analysisShown) showOutdated(container, true);
      }
    });
  });

  // Analyze button
  container.querySelector('#analyze-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    runAnalysis(container);
  });
  container.querySelector("#analyze-btn-img")
    ?.addEventListener("click", async (e) => {
      console.log("CLICKED");

      e.preventDefault();
      e.stopPropagation();


      await runAnalysis(container);

      console.log("AFTER RUN");

      console.log("FINISHED");
    });

  // Enter key
  mainInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); runAnalysis(container); }
  });

  // File upload
  const uploadArea = container.querySelector('#upload-area');
  const fileInput = container.querySelector('#file-input');

  uploadArea?.addEventListener('click', () => fileInput?.click());
  uploadArea?.addEventListener('dragover', e => { e.preventDefault(); uploadArea.style.borderColor = 'var(--color-accent)'; });
  uploadArea?.addEventListener('dragleave', () => { uploadArea.style.borderColor = ''; });
  uploadArea?.addEventListener('drop', e => {
    e.preventDefault();
    uploadArea.style.borderColor = '';
    const file = e.dataTransfer?.files[0];
    if (file) handleFileSelect(container, file);
  });
  fileInput?.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) handleFileSelect(container, file);
  });

  container.querySelector('#remove-img')?.addEventListener('click', () => {
    currentImageFile = null;
    container.querySelector('#preview-wrap').style.display = 'none';
    container.querySelector('#upload-area').style.display = 'block';
    if (fileInput) fileInput.value = '';
  });

  // Restore previous result if any
  const prevResult = State.get('analysisResult');
  if (prevResult) {
    populateResults(container, prevResult);
  }
}

function updateInputUI(container, tab) {
  const textWrap = container.querySelector('#text-input-wrap');
  const ssWrap = container.querySelector('#screenshot-wrap');
  const labelEl = container.querySelector('#input-label');
  const examples = container.querySelector('#quick-examples');

  const labels = { url: 'Paste a URL to analyze', email: 'Paste the complete email content', message: 'Paste your message (WhatsApp, SMS, etc.)', screenshot: 'Upload a screenshot to analyze' };
  const placeholders = { url: 'https://example.com/login?verify=account', email: 'From: ...\nSubject: ...\n\nEmail body here...', message: 'Paste suspicious message here...' };

  labelEl.textContent = labels[tab] || '';

  if (tab === 'screenshot') {
    textWrap.style.display = 'none';
    ssWrap.style.display = 'block';
    examples.style.display = 'none';
  } else {
    textWrap.style.display = 'flex';
    ssWrap.style.display = 'none';
    examples.style.display = 'flex';

    const input = container.querySelector('#main-input');
    if (input) {
      const isTextarea = tab !== 'url';
      if (isTextarea && input.tagName === 'INPUT') {
        // Switch to textarea
        const ta = document.createElement('textarea');
        ta.id = 'main-input';
        ta.className = 'input-field';
        ta.rows = 5;
        ta.placeholder = placeholders[tab] || '';
        input.replaceWith(ta);
        ta.addEventListener('input', () => { if (analysisShown) showOutdated(container, true); });
      } else if (!isTextarea && input.tagName === 'TEXTAREA') {
        const inp = document.createElement('input');
        inp.type = 'text';
        inp.id = 'main-input';
        inp.className = 'input-field';
        inp.placeholder = placeholders[tab] || '';
        input.replaceWith(inp);
        inp.addEventListener('input', () => { if (analysisShown) showOutdated(container, true); });
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') runAnalysis(container); });
      } else {
        input.placeholder = placeholders[tab] || '';
      }
    }

    // Update example chips
    const chips = EXAMPLES[tab] || EXAMPLES.url;
    examples.innerHTML = `<span class="quick-examples-label">Quick examples:</span>
      ${chips.map(e => `<button class="example-chip" data-value="${e.value}">${e.label}</button>`).join('')}`;
    examples.querySelectorAll('.example-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const mi = container.querySelector('#main-input');
        if (mi) { mi.value = chip.dataset.value; if (analysisShown) showOutdated(container, true); }
      });
    });
  }
}

function handleFileSelect(container, file) {

  if (!file.type.match(/image\/(png|jpe?g)/)) {

    showErrorCard(
      container,
      "Unsupported file type. Please upload PNG, JPG, or JPEG images."
    );

    return;
  }

  currentImageFile = file;

  const preview = container.querySelector("#preview-img");

  if (preview) {
    preview.src = URL.createObjectURL(file);
  }

  container.querySelector("#preview-wrap").style.display = "block";
  container.querySelector("#upload-area").style.display = "none";
}

async function runAnalysis(container) {
  console.log("RUN 1");
  const tab = State.get('currentTab') || 'url';
  let value = '';

  if (tab === 'screenshot') {
    if (!currentImageFile) {
      showErrorCard(container, 'Please upload a screenshot image first.');
      return;
    }
  } else {
    const input = container.querySelector('#main-input');
    value = input?.value?.trim() || '';
    if (!value) {
      showErrorCard(container, tab === 'url' ? 'Please enter a URL to analyze.' : 'Please paste content to analyze.');
      return;
    }
    if (tab === 'url' && !value.match(/^https?:\/\/.+/i) && !value.includes('.')) {
      showErrorCard(container, 'Please enter a valid URL starting with http:// or https://');
      return;
    }
  }

  clearErrorCard(container);
  setAnalyzing(container, true);
  showOutdated(container, false);

  // Animate through steps
  const stepEl = container.querySelector('#progress-step');
  let stepIdx = 0;
  const stepInterval = setInterval(() => {
    if (stepEl && stepIdx < ANALYSIS_STEPS.length) {
      stepEl.textContent = ANALYSIS_STEPS[stepIdx++];
    }
  }, 600);

  try {
    let result;

    if (tab === "url") {

      result = await analyzeURL(value);

    }

    else if (tab === "message") {

      result = await analyzeMessage(value);

    }

    else if (tab === "email") {

      result = await analyzeEmail({
        sender_email: value,
        display_name: "",
        subject: "",
        body: "",
        attachment: ""
      });

    }

    else if (tab === "screenshot") {

      if (!currentImageFile) {
        throw new Error('No image selected. Please upload a screenshot first.');
      }
      console.log("RUN BEFORE API");
      result = await analyzeScreenshot(currentImageFile);
      console.log("RUN AFTER API");

    }
    ;

    clearInterval(stepInterval);
    setAnalyzing(container, false);
    analysisShown = true;
    const uiResult = transformBackendResponse(result);
    State.set('analysisResult', uiResult);
    saveToHistory(uiResult, tab, value);
    populateResults(container, uiResult);
    showToast('Analysis complete!', 'success');
  } catch (err) {
    clearInterval(stepInterval);
    setAnalyzing(container, false);
    console.error(err);
    showErrorCard(container, `Analysis failed: ${err.message || 'Please try again.'}`);
  }
}

function setAnalyzing(container, state) {
  const btn = container.querySelector('#analyze-btn');
  const btn2 = container.querySelector('#analyze-btn-img');
  const progress = container.querySelector('#analysis-progress');

  [btn, btn2].forEach(b => { if (b) { b.disabled = state; b.classList.toggle('loading', state); } });
  if (progress) progress.classList.toggle('visible', state);
}

function showOutdated(container, show) {
  container.querySelector('#outdated-banner')?.classList.toggle('visible', show);
  if (show) {
    const btn = container.querySelector('#analyze-btn');
    if (btn) btn.disabled = false;
  }
}

function showErrorCard(container, message) {
  const wrap = container.querySelector('#error-card-wrap');
  if (!wrap) return;
  wrap.innerHTML = `
    <div class="error-card">
      <div class="error-card-icon">⚠</div>
      <div>
        <strong>Error</strong>
        <div style="margin-top:4px;font-size:12.5px;opacity:0.8">${message}</div>
      </div>
    </div>`;
}

function clearErrorCard(container) {
  const wrap = container.querySelector('#error-card-wrap');
  if (wrap) wrap.innerHTML = '';
}

function transformBackendResponse(apiResponse) {

  console.log("BACKEND RESPONSE:", apiResponse);

  if (!apiResponse) {
    throw new Error("No response received from backend.");
  }

  const data = apiResponse.result || apiResponse;

  if (!data) {
    throw new Error("Backend returned an empty result.");
  }

  let risk;

  if (data.risk) {
    // Screenshot endpoint
    risk = data.risk;
  } else {
    // URL / Email / Message endpoints
    risk = {
      risk_score: data.risk_score || 0,
      flags: data.overall_flags || data.flags || [],
      recommendation: "Generated by ThreatLens.",
      risk_level:
        data.risk_score >= 80 ? "Critical" :
          data.risk_score >= 60 ? "High" :
            data.risk_score >= 40 ? "Medium" :
              data.risk_score >= 20 ? "Low" :
                "Safe"
    };
  }

  return {

    riskScore: risk.risk_score || 0,

    threatLevel: risk.risk_level || "Safe",

    aiConfidence: 95,

    summary:
      risk.recommendation ||
      "Analysis completed.",

    threatTags:
      (risk.flags || []).map(flag => ({
        name: flag,
        tooltip: flag
      })),

    threatsDetected:
      (risk.flags || []).map(flag => ({
        name: flag,
        severity: risk.risk_level || "Low",
        description: flag,
        detail: flag
      })),

    aiExplanation:
      data.simple_explanation ||
      "AI explanation couldn't be generated at the moment.Your security analysis is still complete.",

    recommendations: (data.recommendations || []).map(text => ({
      action: text,
      reason: "",
      priority:
        (risk.risk_level === "Critical" || risk.risk_level === "High")
          ? "High"
          : "Medium"
    })),

    timeline: [
      {
        time: "00:00",
        title: "Input Received",
        desc: "ThreatLens started analysis.",
        detail: ""
      },
      {
        time: "00:02",
        title: "Threat Detection",
        desc:
          (risk.flags || []).join(", ") ||
          "No threats detected.",
        detail: ""
      },
      {
        time: "00:04",
        title: "Risk Calculated",
        desc:
          `Overall Risk: ${risk.risk_level || "Safe"}`,
        detail: ""
      }
    ],

    radarValues: {

      Phishing:
        risk.risk_score || 0,

      "Credential Theft":
        (risk.flags || []).includes("Credential Request")
          ? 90
          : 10,

      "Malicious URL":
        data.urls?.flags?.length
          ? 90
          : 10,

      "Social Engineering":
        (risk.flags || []).includes("Fear Tactics")
          ? 85
          : 20,

      Urgency:
        (risk.flags || []).includes("Urgency")
          ? 90
          : 20,

      "Safe Signals":
        100 - (risk.risk_score || 0)

    }

  };

}

function populateResults(container, result) {
  // Risk score
  const rsWrap = container.querySelector('#risk-score-wrap');
  if (rsWrap) renderRiskScore(rsWrap, result);

  // Threats + recs row
  const row = container.querySelector('#threats-recs-row');
  if (row) row.style.display = 'grid';

  const threatsWrap = container.querySelector('#threats-wrap');
  if (threatsWrap) renderThreatsDetected(threatsWrap, result.threatsDetected);

  const recsWrap = container.querySelector('#recs-wrap');
  if (recsWrap) renderRecommendations(recsWrap, result.recommendations, result.aiExplanation);

  // Tip bar
  const tipBar = container.querySelector('#tip-bar');
  if (tipBar) tipBar.style.display = 'flex';

  // Radar
  if (result.radarValues) {
    const radarContainer = container.querySelector('#radar-container');
    if (radarContainer) renderRadar(radarContainer, result.radarValues);
  }

  // Timeline
  const timelineWrap = container.querySelector('#timeline-wrap');
  if (timelineWrap && result.timeline?.length) {
    renderTimeline(timelineWrap, result.timeline);
  }
}

function saveToHistory(result, type, value) {
  const history = State.get('history') || [];
  const entry = {
    id: Date.now(),
    riskScore: result.riskScore,
    threatLevel: result.threatLevel,
    date: new Date().toISOString(),
    inputType: type,
    summary: result.summary,
    result,
    preview: value?.substring(0, 80) || '[screenshot]',
  };
  const updated = [entry, ...history].slice(0, 50);
  State.set('history', updated);
  saveHistory(updated);
}

function placeholderRadar() {
  return `<div style="display:flex;align-items:center;justify-content:center;height:200px;color:var(--color-text-muted);font-size:13px;text-align:center;padding:20px;">
    Run an analysis to see<br>the threat radar chart
  </div>`;
}

const SAFETY_TIPS = [
  { icon: '🔒', text: 'Never share OTP or passwords.' },
  { icon: '✉️', text: 'Verify websites before logging in.' },
  { icon: '🔗', text: 'Avoid clicking on unknown links.' },
  { icon: '⚙️', text: 'Keep your device & software updated.' },
  { icon: '🛡️', text: 'Report suspicious activity.' },
];

function tabIcon(tab) {
  const icons = {
    url: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>`,
    email: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
    message: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`,
    screenshot: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  };
  return icons[tab] || '';
}

function tabLabel(tab) {
  const labels = { url: 'URL', email: 'Email', message: 'Message / Text', screenshot: 'Screenshot (Image)' };
  return labels[tab] || tab;
}
