// js/utils/animate.js

export function animateNumber(el, from, to, duration = 1200) {
  if (!el) return;
  const start = performance.now();
  const range = to - from;

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
    el.textContent = Math.round(from + range * eased);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

export function animateCircle(svgCircle, score, color) {
  if (!svgCircle) return;
  const circumference = 326;
  const offset = circumference - (score / 100) * circumference;

  svgCircle.style.stroke = color;
  setTimeout(() => {
    svgCircle.style.strokeDashoffset = offset;
  }, 50);
}

export function getScoreColor(score) {
  if (score < 20) return '#10b981'; // safe
  if (score < 40) return '#22c55e'; // low
  if (score < 60) return '#f59e0b'; // medium
  if (score < 80) return '#f97316'; // high
  return '#ef4444'; // critical
}

export function getScoreClass(score) {
  if (score < 20) return 'risk-safe';
  if (score < 40) return 'risk-low';
  if (score < 60) return 'risk-medium';
  if (score < 80) return 'risk-high';
  return 'risk-critical';
}

export function getScoreBgClass(score) {
  return getScoreClass(score) + '-bg';
}
