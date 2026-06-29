// components/radar.js – Animated Radar/Polygon Chart

export function renderRadar(container, values) {
  // values: { Phishing, "Credential Theft", "Malicious URL", "Social Engineering", Urgency, "Safe Signals" }
  const labels = Object.keys(values);
  const scores = Object.values(values);
  const n = labels.length;
  const cx = 120, cy = 120, r = 90;

  const angleStep = (2 * Math.PI) / n;
  const getPoint = (idx, radius) => {
    const angle = idx * angleStep - Math.PI / 2;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  };

  // Background grid rings
  const rings = [0.2, 0.4, 0.6, 0.8, 1.0];
  const gridPolygons = rings.map(scale => {
    const pts = Array.from({ length: n }, (_, i) => {
      const p = getPoint(i, r * scale);
      return `${p.x},${p.y}`;
    }).join(' ');
    return `<polygon class="radar-bg-polygon" points="${pts}"/>`;
  }).join('');

  // Axes
  const axes = Array.from({ length: n }, (_, i) => {
    const p = getPoint(i, r);
    return `<line class="radar-axis" x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}"/>`;
  }).join('');

  // Data polygon (starts collapsed)
  const dataPointsStr = Array.from({ length: n }, (_, i) => {
    const p = getPoint(i, 0);
    return `${p.x},${p.y}`;
  }).join(' ');

  // Labels
  const LABEL_PADDING = 20;
  const labelEls = labels.map((label, i) => {
    const p = getPoint(i, r + LABEL_PADDING);
    const score = scores[i];
    let severity = 'low';
    if (score > 75) severity = 'critical';
    else if (score > 50) severity = 'high';
    else if (score > 25) severity = 'medium';

    const anchor = p.x < cx - 5 ? 'end' : p.x > cx + 5 ? 'start' : 'middle';
    const displayName = label.length > 10 ? label.split(' ')[0] : label;
    const levelLabel = score > 75 ? 'High' : score > 50 ? 'Medium' : 'Low';
    const levelColor = score > 75 ? '#f97316' : score > 50 ? '#f59e0b' : '#22c55e';

    return `<g class="radar-label-group">
      <text x="${p.x}" y="${p.y - 4}" text-anchor="${anchor}" class="radar-label-name">${displayName}</text>
      <text x="${p.x}" y="${p.y + 10}" text-anchor="${anchor}" class="radar-label-value ${severity}" fill="${levelColor}">${levelLabel}</text>
    </g>`;
  }).join('');

  container.innerHTML = `
    <svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
      ${gridPolygons}
      ${axes}
      <polygon id="radar-data" class="radar-data-polygon" points="${dataPointsStr}"/>
      ${Array.from({ length: n }, (_, i) => {
        const p = getPoint(i, 0);
        return `<circle class="radar-data-point" id="radar-pt-${i}" cx="${p.x}" cy="${p.y}" r="3"/>`;
      }).join('')}
      ${labelEls}
    </svg>
  `;

  // Animate data polygon
  requestAnimationFrame(() => {
    const finalPts = Array.from({ length: n }, (_, i) => {
      const p = getPoint(i, r * (scores[i] / 100));
      return `${p.x},${p.y}`;
    }).join(' ');

    const dataPoly = container.querySelector('#radar-data');
    if (dataPoly) dataPoly.setAttribute('points', finalPts);

    labels.forEach((_, i) => {
      const p = getPoint(i, r * (scores[i] / 100));
      const pt = container.querySelector(`#radar-pt-${i}`);
      if (pt) { pt.setAttribute('cx', p.x); pt.setAttribute('cy', p.y); }
    });
  });
}
