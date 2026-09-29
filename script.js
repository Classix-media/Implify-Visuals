(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const intro = $('#introOverlay');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (intro && !reduced) setTimeout(() => intro.classList.add('done'), 6000);
  else if (intro) intro.remove();

  const nav = $('#navbar');
  const navToggle = $('#navToggle');
  const navLinks = $('#navLinks');
  navToggle?.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  $$('.nav-link').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
  }));
  const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    }), { threshold: .12, rootMargin: '0px 0px -40px' });
    reveals.forEach(el => io.observe(el));
  } else reveals.forEach(el => el.classList.add('visible'));

  function slider(stageSelector, slideSelector, prevId, nextId, dotsId, interval = 0) {
    const slides = $$(slideSelector);
    const stage = $(stageSelector);
    const prev = $('#' + prevId), next = $('#' + nextId), dots = $('#' + dotsId);
    if (!slides.length || !stage) return;
    let index = 0, timer;
    const renderDots = () => {
      if (!dots) return;
      dots.innerHTML = slides.map((_, i) => `<i class="${i === index ? 'active' : ''}" data-index="${i}" role="button" aria-label="Go to item ${i + 1}"></i>`).join('');
      $$('.active', dots).forEach(() => {});
      $$('i', dots).forEach(d => d.addEventListener('click', () => go(Number(d.dataset.index))));
    };
    const go = n => { index = (n + slides.length) % slides.length; slides.forEach((s,i) => s.classList.toggle('active', i === index)); renderDots(); };
    prev?.addEventListener('click', () => go(index - 1)); next?.addEventListener('click', () => go(index + 1));
    renderDots();
    if (interval && !reduced) { timer = setInterval(() => go(index + 1), interval); stage.addEventListener('mouseenter', () => clearInterval(timer)); stage.addEventListener('mouseleave', () => timer = setInterval(() => go(index + 1), interval)); }
    let sx = 0;
    stage.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true });
    stage.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 45) go(index + (dx < 0 ? 1 : -1)); }, { passive: true });
  }
  slider('#projectsStage', '.project-slide', 'projectsPrev', 'projectsNext', 'projectDots', 0);
  slider('#reviewTrack', '.review-item', 'reviewPrev', 'reviewNext', 'reviewDots', 7000);

  $('#contactForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const first = $('#firstName')?.value.trim();
    const last = $('#lastName')?.value.trim();
    const email = $('#email')?.value.trim();
    const service = $('#service')?.value;
    const message = $('#message')?.value.trim();
    const text = `Hi Implify Visuals,\n\nMy name is ${first} ${last}.\nEmail: ${email}\nService: ${service}\n\nProject details:\n${message}`;
    window.open(`https://wa.me/2348121986430?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  });
  const year = $('#year'); if (year) year.textContent = new Date().getFullYear();
})();
