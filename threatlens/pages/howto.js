// pages/howto.js

const STEPS = [
  { num: 1, icon: '🔗', title: 'Paste a URL', desc: 'Copy any suspicious link and paste it into the URL tab. Include the full address starting with http:// or https://.' },
  { num: 2, icon: '✉️', title: 'Paste an Email', desc: 'Switch to the Email tab and paste the complete email content, including headers, sender address, and body text.' },
  { num: 3, icon: '💬', title: 'Paste a Message', desc: 'Use the Message tab for WhatsApp, SMS, Instagram DMs, Telegram, Discord, or any suspicious text messages.' },
  { num: 4, icon: '🖼️', title: 'Upload Screenshot', desc: 'Switch to the Screenshot tab and upload a PNG, JPG, or JPEG image. Our AI uses OCR to extract and analyze the content.' },
  { num: 5, icon: '🔍', title: 'Click Analyze', desc: 'Press the "Analyze Now" button. The AI engine will process your content through multiple security checks.' },
  { num: 6, icon: '📊', title: 'Read AI Report', desc: 'View your personalized threat report including the Risk Score, Threat Radar, Timeline, and detected threats.' },
  { num: 7, icon: '✅', title: 'Follow Recommendations', desc: 'Act on the AI-generated recommendations to protect yourself. Each suggestion includes the reason and priority level.' },
];

export function renderHowTo(container) {
  container.innerHTML = `
    <div class="top-bar">
      <div class="ai-status"><div class="ai-status-dot"></div>AI Engine Online</div>
    </div>
    <div class="howto-page page">
      <h1>How to Use ThreatLens</h1>
      <p class="subtitle">Follow these simple steps to detect phishing, scams, and malicious threats in seconds.</p>
      <div class="howto-grid">
        ${STEPS.map(s => `
          <div class="howto-card">
            <div class="howto-step-num">${s.num}</div>
            <div class="howto-icon" style="font-size:28px">${s.icon}</div>
            <h3>${s.title}</h3>
            <p>${s.desc}</p>
          </div>
        `).join('')}
      </div>

      <!-- Tips box -->
      <div class="card" style="margin-top:24px;padding:22px">
        <div class="section-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Pro Tips
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px">
          ${[
            'Always analyze links before clicking, especially from unknown senders.',
            'For emails, paste the full header for more accurate analysis.',
            'Screenshots are analyzed using OCR — ensure text is clearly visible.',
            'Run analysis again if you edit the content — results update automatically.',
          ].map(tip => `
            <div style="display:flex;gap:10px;font-size:13px;color:var(--color-text-secondary);padding:12px;background:var(--color-bg-surface);border-radius:var(--radius-md);border:1px solid var(--color-border-subtle)">
              <span style="color:var(--color-accent-bright);flex-shrink:0">💡</span>
              ${tip}
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
