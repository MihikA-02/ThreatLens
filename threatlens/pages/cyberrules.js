// pages/cyberrules.js

const RULES = [
  {
    icon: '🔑', title: 'Password Safety',
    content: `<ul>
      <li>Use passwords with 12+ characters including letters, numbers, and symbols.</li>
      <li>Never reuse the same password across multiple websites.</li>
      <li>Use a trusted password manager to store credentials securely.</li>
      <li>Enable two-factor authentication (2FA) on all important accounts.</li>
      <li>Change passwords immediately if a breach is suspected.</li>
    </ul>`,
  },
  {
    icon: '🔢', title: 'OTP Safety',
    content: `<ul>
      <li>Never share your OTP with anyone, including bank employees or government officials.</li>
      <li>OTPs are valid for short durations — never save them.</li>
      <li>If you receive an OTP you didn't request, your account may be under attack.</li>
      <li>Be suspicious of calls asking you to "read out" your OTP.</li>
    </ul>`,
  },
  {
    icon: '💳', title: 'UPI Fraud',
    content: `<ul>
      <li>You never need to enter your PIN to receive money via UPI.</li>
      <li>Verify the recipient's UPI ID before sending any payment.</li>
      <li>Beware of "collect request" scams — approve only payments you initiated.</li>
      <li>Never scan QR codes sent by strangers — they are used to deduct money.</li>
      <li>Report UPI fraud immediately at the National Cyber Crime Helpline: 1930.</li>
    </ul>`,
  },
  {
    icon: '📱', title: 'QR Code Scam',
    content: `<ul>
      <li>Scanning a QR code can redirect you to malicious websites or download malware.</li>
      <li>Only scan QR codes from trusted, verified sources.</li>
      <li>Never scan QR codes sent via WhatsApp or email from unknown contacts.</li>
      <li>Use a QR scanner app that previews the URL before opening it.</li>
    </ul>`,
  },
  {
    icon: '💼', title: 'Job Scam',
    content: `<ul>
      <li>Legitimate employers never ask for money during the hiring process.</li>
      <li>Be wary of job offers with very high pay for minimal work from home.</li>
      <li>Verify company existence on official websites and LinkedIn.</li>
      <li>Never share Aadhaar, PAN, or bank details during initial hiring stages.</li>
      <li>Advance fee fraud is common — never pay to "secure" a job.</li>
    </ul>`,
  },
  {
    icon: '🪪', title: 'KYC Scam',
    content: `<ul>
      <li>Banks never ask you to complete KYC via WhatsApp or phone calls.</li>
      <li>Never install apps (AnyDesk, TeamViewer) as instructed by unknown callers.</li>
      <li>Fraudsters impersonate bank staff — always verify via official bank numbers.</li>
      <li>If your mobile banking is blocked, visit the branch in person.</li>
    </ul>`,
  },
  {
    icon: '🤖', title: 'AI Deepfake Scam',
    content: `<ul>
      <li>Deepfake videos and voices can convincingly impersonate people you trust.</li>
      <li>Verify identity through a separate channel (call back on a known number).</li>
      <li>Be skeptical of urgent video/voice requests for money or credentials.</li>
      <li>AI-generated content may have subtle glitches — look for unnatural blinking, lip sync issues.</li>
    </ul>`,
  },
  {
    icon: '🎭', title: 'Social Engineering',
    content: `<ul>
      <li>Fraudsters create urgency, fear, or excitement to bypass your critical thinking.</li>
      <li>Common tactics: pretending to be police, banks, income tax, or family emergencies.</li>
      <li>Always slow down, verify, and consult before acting on urgent requests.</li>
      <li>Never let a caller keep you on the phone while you make transactions.</li>
    </ul>`,
  },
  {
    icon: '🔗', title: 'Fake Links (Phishing URLs)',
    content: `<ul>
      <li>Check for subtle misspellings: paypa1.com, g00gle.com, sbi-secure-login.tk</li>
      <li>Legitimate websites use HTTPS but a padlock doesn't guarantee safety.</li>
      <li>Hover over links to preview the actual destination URL.</li>
      <li>Use ThreatLens to analyze suspicious URLs before clicking.</li>
      <li>Free domain extensions (.tk, .ml, .ga, .cf, .ru) are frequently used in scams.</li>
    </ul>`,
  },
  {
    icon: '🏛️', title: 'Government Cyber Resources',
    content: `<ul>
      <li><strong>National Cyber Crime Helpline:</strong> 1930 (24x7)</li>
      <li><strong>Cyber Crime Portal:</strong> cybercrime.gov.in</li>
      <li><strong>Email:</strong> help@cybercrime.gov.in</li>
      <li><strong>CERT-In:</strong> cert-in.org.in (national cybersecurity agency)</li>
      <li>Report cybercrime within 48 hours for better chances of fund recovery.</li>
    </ul>`,
  },
];

export function renderCyberRules(container) {
  container.innerHTML = `
    <div class="top-bar">
      <div class="ai-status"><div class="ai-status-dot"></div>AI Engine Online</div>
    </div>
    <div class="cyberrules-page page">
      <h1>Cyber Safety Rules</h1>
      <p class="subtitle">Learn how to protect yourself from common cyber threats and scams.</p>

      <div class="cyberrules-search-wrap">
        <svg class="cyberrules-search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" class="cyberrules-search" id="rules-search" placeholder="Search cyber rules..."/>
      </div>

      <div class="accordion-list" id="accordion-list">
        ${RULES.map((rule, idx) => `
          <div class="accordion-item" data-idx="${idx}">
            <div class="accordion-header">
              <div class="accordion-icon-wrap">${rule.icon}</div>
              <div class="accordion-title">${rule.title}</div>
              <svg class="accordion-chevron" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <div class="accordion-body">${rule.content}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Accordion
  container.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      item.classList.toggle('open');
    });
  });

  // Search
  container.querySelector('#rules-search')?.addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    container.querySelectorAll('.accordion-item').forEach(item => {
      const idx = parseInt(item.dataset.idx);
      const rule = RULES[idx];
      const matches = !q || rule.title.toLowerCase().includes(q) || rule.content.toLowerCase().includes(q);
      item.style.display = matches ? '' : 'none';
      if (q && matches) item.classList.add('open');
      else if (!q) item.classList.remove('open');
    });
  });
}
