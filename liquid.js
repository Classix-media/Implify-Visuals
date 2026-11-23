/* Booking progress: landscape glass capsule filled with blue liquid (sloshing wave front + bubbles). */
(function () {
  'use strict';
  var host = document.getElementById('journeySteps'); if (!host) return;
  var pole = document.createElement('div'); pole.className = 'liquid-pole'; pole.setAttribute('aria-hidden', 'true');
  var cv = document.createElement('canvas'); pole.appendChild(cv);
  ['lp-rim', 'lp-gloss', 'lp-spec'].forEach(function (c) { var i = document.createElement('i'); i.className = c; pole.appendChild(i); });
  host.insertBefore(pole, host.firstChild);
  var ctx = cv.getContext('2d'), W = 1, H = 1, RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function size() {
    var r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
    cv.width = Math.round(W * d); cv.height = Math.round(H * d); ctx.setTransform(d, 0, 0, d, 0, 0);
  }
  size(); window.addEventListener('resize', size);
  if (window.ResizeObserver) new ResizeObserver(size).observe(pole);
  var cur = 0, bub = [], i;
  for (i = 0; i < 16; i++) bub.push({ x: Math.random(), y: Math.random(), r: 0.7 + Math.random() * 1.9, s: 0.0035 + Math.random() * 0.006, ph: Math.random() * 6.28 });
  function target() { var p = parseFloat(getComputedStyle(host).getPropertyValue('--p')) || 0; return Math.min(1, (p * 5 + 1) / 6); }
  function frame(ts) {
    var t = RM ? 0 : ts, tg = target(); cur += (tg - cur) * (RM ? 1 : 0.05);
    ctx.clearRect(0, 0, W, H);
    var A = H * 0.2 * (1 - Math.max(0, (cur - 0.9) / 0.1) * 0.85), fx = cur * (W + 3.4 * A) - 1.8 * A;
    function xf(y) { return fx + A * (Math.sin(y * 0.17 + t * 0.0042) + 0.55 * Math.sin(y * 0.36 - t * 0.0029) + 0.25 * Math.sin(y * 0.09 + t * 0.0017)); }
    if (cur > 0.003) {
      ctx.save(); ctx.beginPath(); ctx.moveTo(0, 0);
      for (var y = 0; y <= H; y += 2) ctx.lineTo(xf(y), y);
      ctx.lineTo(0, H); ctx.closePath(); ctx.clip();
      var g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a95ff'); g.addColorStop(0.45, '#0a56ff'); g.addColorStop(1, '#0029b8');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      var f = ctx.createLinearGradient(fx - W * 0.2, 0, fx + A * 1.7, 0);
      f.addColorStop(0, 'rgba(120,225,255,0)'); f.addColorStop(0.7, 'rgba(110,225,255,0.5)'); f.addColorStop(1, 'rgba(210,252,255,0.95)');
      ctx.fillStyle = f; ctx.fillRect(0, 0, W, H);
      var s = ctx.createLinearGradient(0, 0, 0, H); s.addColorStop(0, 'rgba(255,255,255,0.32)'); s.addColorStop(0.35, 'rgba(255,255,255,0.04)'); s.addColorStop(1, 'rgba(0,0,0,0.28)');
      ctx.fillStyle = s; ctx.fillRect(0, 0, W, H);
      for (i = 0; i < bub.length; i++) {
        var b = bub[i]; if (!RM) { b.y -= b.s; if (b.y < -0.05) { b.y = 1.05; b.x = Math.random(); } }
        var bx = b.x * W + Math.sin(t * 0.002 + b.ph) * 3, by = b.y * H; if (bx > fx - 8) continue;
        ctx.beginPath(); ctx.arc(bx, by, b.r, 0, 6.283); ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.fill();
        ctx.lineWidth = 0.7; ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.stroke();
      }
      ctx.restore();
      ctx.beginPath(); for (y = 0; y <= H; y += 2) { if (y) ctx.lineTo(xf(y), y); else ctx.moveTo(xf(y), y); }
      ctx.lineWidth = 1.3; ctx.strokeStyle = 'rgba(235,252,255,0.75)'; ctx.stroke();
    }
    if (!document.hidden) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) requestAnimationFrame(frame); });
})();
