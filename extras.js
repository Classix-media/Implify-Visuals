/* Implify Visuals extras: count-up stats + video cards (Andrea Bank motion graphics, footer video). */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cards = document.querySelectorAll('.stat-card h3');
  cards.forEach(function (el) {
    var m = String(el.textContent).trim().match(/^(\d+(?:\.\d+)?)(.*)$/);
    if (!m) return;
    el.dataset.target = m[1]; el.dataset.suffix = m[2]; el.style.fontVariantNumeric = 'tabular-nums';
  });
  function countUp(el, delay) {
    var target = parseFloat(el.dataset.target), suffix = el.dataset.suffix || '', dec = (el.dataset.target.split('.')[1] || '').length;
    if (reduce) { el.textContent = el.dataset.target + suffix; return; }
    var dur = 1700, t0 = null;
    el.textContent = '0' + suffix;
    function step(ts) {
      if (t0 === null) t0 = ts + delay;
      var p = Math.min(1, Math.max(0, (ts - t0) / dur)), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * e).toFixed(dec) + suffix;
      if (p < 1) requestAnimationFrame(step); else el.textContent = el.dataset.target + suffix;
    }
    requestAnimationFrame(step);
  }
  var counters = Array.prototype.filter.call(cards, function (c) { return c.dataset.target; });
  if (counters.length) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          io.unobserve(en.target);
          countUp(en.target, counters.indexOf(en.target) * 120);
        });
      }, { threshold: 0.6 });
      counters.forEach(function (c) { io.observe(c); });
    } else counters.forEach(function (c) { countUp(c, 0); });
  }
  var vids = [];
  document.querySelectorAll('.vid-card').forEach(function (card) {
    var v = card.querySelector('video'), b = card.querySelector('.vid-play'); if (!v || !b) return;
    vids.push(v);
    function toggle() {
      if (v.paused) {
        vids.forEach(function (o) { if (o !== v) o.pause(); });
        v.muted = false; var p = v.play(); if (p && p.catch) p.catch(function () { v.muted = true; v.play().catch(function () {}); });
      } else v.pause();
    }
    b.addEventListener('click', toggle);
    v.addEventListener('click', function () { if (card.classList.contains('playing')) toggle(); });
    v.addEventListener('play', function () { card.classList.add('playing'); v.controls = true; });
    v.addEventListener('pause', function () { if (!v.ended) card.classList.remove('playing'); });
    v.addEventListener('ended', function () { card.classList.remove('playing'); v.controls = false; v.currentTime = 0; });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { if (!en[0].isIntersecting && !v.paused) v.pause(); }, { threshold: 0.15 }).observe(card);
  });
})();
