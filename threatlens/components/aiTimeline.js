// components/aiTimeline.js

export function renderTimeline(container, timelineData) {
  const items = timelineData || [];

  container.innerHTML = `
    <div class="section-title" style="padding:18px 18px 10px">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      AI Analysis Timeline
    </div>
    <div class="timeline-section">
      <div class="timeline" id="timeline-list"></div>
    </div>
  `;

  const list = container.querySelector('#timeline-list');

  items.forEach((item, idx) => {
    const el = document.createElement('div');
    el.className = 'timeline-item';
    el.innerHTML = `
      <div class="timeline-connector">
        <div class="timeline-dot"></div>
        ${idx < items.length - 1 ? '<div class="timeline-line"></div>' : ''}
      </div>
      <div class="timeline-content">
        <div class="timeline-header">
          <span class="timeline-time">${item.time}</span>
          <span class="timeline-title">${item.title}</span>
        </div>
        <div class="timeline-desc">${item.desc}</div>
        ${item.detail ? `<div class="timeline-expanded">${item.detail}</div>` : ''}
      </div>
    `;
    list.appendChild(el);

    // Toggle expand on click
    el.addEventListener('click', () => {
      el.classList.toggle('open');
    });

    // Staggered animation
    setTimeout(() => el.classList.add('visible'), idx * 180);
  });
}
