const WHATSAPP_NUMBER = "2348121986430";

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Mobile nav toggle
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", isOpen);
  });
  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => navLinks.classList.remove("open"));
  });
}

const form = document.getElementById("contactForm");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    const text =
`Hi Implify Visuals, I need support.

Name: ${firstName} ${lastName}
Email: ${email}

Message: ${message}`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    const w = window.open(url, "_blank", "noopener");
    if (!w) window.location.href = url;
    form.reset();
  });
}

// Clients Reviews Carousel
const reviewTrack = document.getElementById("reviewTrack");
const reviewDotsWrap = document.getElementById("reviewDots");
const reviewPrevBtn = document.getElementById("reviewPrev");
const reviewNextBtn = document.getElementById("reviewNext");

if (reviewTrack && reviewDotsWrap && reviewPrevBtn && reviewNextBtn) {
  const totalReviews = reviewTrack.children.length;
  let currentReview = 0;
  let autoplayTimer;

  for (let i = 0; i < totalReviews; i++) {
    const dot = document.createElement("div");
    dot.className = "dot" + (i === 0 ? " active" : "");
    dot.addEventListener("click", () => goToReview(i));
    reviewDotsWrap.appendChild(dot);
  }
  const dots = reviewDotsWrap.querySelectorAll(".dot");

  function updateReview() {
    reviewTrack.style.transform = `translateX(-${currentReview * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("active", i === currentReview));
  }

  function goToReview(index) {
    currentReview = (index + totalReviews) % totalReviews;
    updateReview();
    resetAutoplay();
  }

  function nextReview() { goToReview(currentReview + 1); }
  function prevReview() { goToReview(currentReview - 1); }

  function resetAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(nextReview, 6000);
  }

  reviewNextBtn.addEventListener("click", nextReview);
  reviewPrevBtn.addEventListener("click", prevReview);

  resetAutoplay();
}

// Scroll reveal animations — slide up / left / right as sections come into view
function setupScrollReveal() {
  const upTargets = document.querySelectorAll(
    ".stat-card, .about-left, .faq-card, .service-card, .dual-card, .tools-card, .reviews-section, .portfolio-outer-frame, .contact-left, .contact-right"
  );
  const leftTargets = document.querySelectorAll(".about-right, .need-card");

  upTargets.forEach(el => el.classList.add("reveal-up"));
  leftTargets.forEach(el => el.classList.add("reveal-left"));

  const allTargets = [...upTargets, ...leftTargets];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -12% 0px" });

  allTargets.forEach(el => observer.observe(el));
}

setupScrollReveal();

/* ============ PAST PROJECTS SHOWCASE CAROUSEL ============ */
(function initPastProjectsCarousel() {
    const carousel = document.getElementById('projectsCarousel');
    if (!carousel) return;

    const stage = document.getElementById('projectsStage');
    const slides = Array.from(carousel.querySelectorAll('.project-slide'));
    const dots = Array.from(carousel.querySelectorAll('.project-dot'));
    const prev = document.getElementById('projectsPrev');
    const next = document.getElementById('projectsNext');

    if (!stage || slides.length < 2) return;

    let current = 0;
    let timer = null;
    let startX = 0;
    let startY = 0;
    let pointerActive = false;
    let suppressClick = false;

    const AUTOPLAY_MS = 5200;
    const SWIPE_THRESHOLD = 45;
    const mobileQuery = window.matchMedia('(max-width: 900px)');
    const isMobileCarousel = () => mobileQuery.matches;

    function setSlide(index, direction = 1) {
        current = (index + slides.length) % slides.length;

        if (!isMobileCarousel()) {
            slides.forEach((slide) => {
                slide.classList.add('is-active');
                slide.setAttribute('aria-hidden', 'false');
                slide.style.transform = '';
            });
            return;
        }

        slides.forEach((slide, i) => {
            slide.classList.toggle('is-active', i === current);
            slide.setAttribute('aria-hidden', i === current ? 'false' : 'true');
            if (i !== current) {
                slide.style.transform = '';
            }
        });

        dots.forEach((dot, i) => {
            const active = i === current;
            dot.classList.toggle('is-active', active);
            dot.setAttribute('aria-selected', active ? 'true' : 'false');
        });

        carousel.dataset.direction = direction > 0 ? 'next' : 'prev';
    }

    function nextSlide() {
        setSlide(current + 1, 1);
        restartAutoplay();
    }

    function prevSlide() {
        setSlide(current - 1, -1);
        restartAutoplay();
    }

    function stopAutoplay() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    function startAutoplay() {
        stopAutoplay();
        if (!isMobileCarousel() || document.hidden || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        timer = window.setInterval(() => setSlide(current + 1, 1), AUTOPLAY_MS);
    }

    function restartAutoplay() {
        startAutoplay();
    }

    prev?.addEventListener('click', () => { if (isMobileCarousel()) prevSlide(); });
    next?.addEventListener('click', () => { if (isMobileCarousel()) nextSlide(); });

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            if (!isMobileCarousel() || i === current) return;
            setSlide(i, i > current ? 1 : -1);
            restartAutoplay();
        });
    });

    stage.addEventListener('pointerdown', (event) => {
        if (!isMobileCarousel()) return;
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        pointerActive = true;
        startX = event.clientX;
        startY = event.clientY;
        suppressClick = false;
        stage.setPointerCapture?.(event.pointerId);
        stopAutoplay();
    });

    stage.addEventListener('pointermove', (event) => {
        if (!isMobileCarousel() || !pointerActive) return;
        const dx = event.clientX - startX;
        const dy = event.clientY - startY;
        if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) {
            suppressClick = true;
        }
    });

    function finishPointer(event) {
        if (!isMobileCarousel() || !pointerActive) return;
        pointerActive = false;
        const dx = event.clientX - startX;
        const dy = event.clientY - startY;

        if (Math.abs(dx) >= SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
            if (dx < 0) nextSlide();
            else prevSlide();
        } else {
            restartAutoplay();
        }
    }

    stage.addEventListener('pointerup', finishPointer);
    stage.addEventListener('pointercancel', finishPointer);

    stage.addEventListener('click', (event) => {
        if (suppressClick) {
            event.preventDefault();
            event.stopPropagation();
            suppressClick = false;
        }
    }, true);

    stage.addEventListener('mouseenter', () => { if (isMobileCarousel()) stopAutoplay(); });
    stage.addEventListener('mouseleave', () => { if (isMobileCarousel()) startAutoplay(); });
    stage.addEventListener('focusin', () => { if (isMobileCarousel()) stopAutoplay(); });
    stage.addEventListener('focusout', () => { if (isMobileCarousel()) startAutoplay(); });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stopAutoplay();
        else startAutoplay();
    });

    stage.addEventListener('keydown', (event) => {
        if (!isMobileCarousel()) return;
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            prevSlide();
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            nextSlide();
        }
    });

    const syncCarouselMode = () => {
        if (isMobileCarousel()) {
            setSlide(current, 1);
            startAutoplay();
        } else {
            stopAutoplay();
            slides.forEach((slide) => {
                slide.classList.add('is-active');
                slide.setAttribute('aria-hidden', 'false');
                slide.style.transform = '';
            });
        }
    };

    mobileQuery.addEventListener?.('change', syncCarouselMode);
    syncCarouselMode();
})();


/* FINAL8 — Premium upward scroll reveals.
   Glass-safe: .hero-section and .hero-right are deliberately NOT transformed,
   preserving the MP4's existing mix-blend-mode/mask visual treatment. */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) return;

  const sectionSelectors = [
    '.stats-section', '.marquee-wrapper', '.about-section',
    '.clarity-section', '.tools-elevate-section', '.strategy-section',
    '.past-projects-section', '.reviews-section', '.portfolio-section',
    '.contact-section'
  ];

  sectionSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => el.classList.add('scroll-reveal'));
  });

  // Reveal the hero copy only. Do not transform the hero section or glass media.
  document.querySelectorAll('.hero-left').forEach(el => el.classList.add('scroll-reveal'));

  const staggerSelectors = [
    '.stats-container', '.services-triple-grid', '.tools-pills', '.strategy-cards',
    '.past-projects-layout',
    '.reviews-carousel', '.portfolio-outer-frame', '.clarity-grid', '.dual-grid',
    '.contact-grid', '.what-to-expect-column'
  ];

  staggerSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => el.classList.add('scroll-reveal-stagger'));
  });

  // FINAL13: Desktop gallery is still one visual unit, but its reveal is NOT
  // blocked by waiting for four image decodes. The images are eager-loaded in
  // the HTML, so the browser can fetch and paint them as early as possible.
  const galleryStage = document.querySelector('.past-projects-column .projects-stage');

  // Warm the browser's image decoder shortly before the gallery enters view.
  // This is deliberately non-blocking: scroll animation never waits on it.
  if (galleryStage && !window.matchMedia('(max-width: 900px)').matches) {
    const galleryImages = Array.from(galleryStage.querySelectorAll('img'));
    const warmGalleryImages = () => {
      galleryImages.forEach(img => {
        if (img.complete && img.naturalWidth > 0 && typeof img.decode === 'function') {
          img.decode().catch(() => {});
        }
      });
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(warmGalleryImages, { timeout: 1200 });
    } else {
      window.setTimeout(warmGalleryImages, 350);
    }
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target);
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -8% 0px'
  });

  document.querySelectorAll('.scroll-reveal, .scroll-reveal-stagger').forEach(el => observer.observe(el));

  // Give the desktop gallery its own earlier trigger so the unified row can
  // start its slide-up while the user is approaching it, rather than waiting
  // until the row is already deep inside the viewport.
  if (galleryStage && !window.matchMedia('(max-width: 900px)').matches && 'IntersectionObserver' in window) {
    const galleryObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        galleryStage.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.01, rootMargin: '0px 0px 24% 0px' });
    galleryObserver.observe(galleryStage);
  } else if (galleryStage) {
    galleryStage.classList.add('is-visible');
  }
})();

/* FINAL12 — touch-only glow feedback. No touch transform/movement. */
(() => {
  const touchTargets = document.querySelectorAll('.past-projects-column .project-link, .btn, .quick-message-button, .nav-btn');
  if (!touchTargets.length) return;

  touchTargets.forEach(target => {
    let clearTimer;
    const clearGlow = () => {
      window.clearTimeout(clearTimer);
      clearTimer = window.setTimeout(() => target.classList.remove('touch-glow'), 70);
    };

    target.addEventListener('touchstart', () => {
      window.clearTimeout(clearTimer);
      target.classList.add('touch-glow');
    }, { passive: true });
    target.addEventListener('touchend', clearGlow, { passive: true });
    target.addEventListener('touchcancel', clearGlow, { passive: true });
  });
})();


/* ===== v32 premium carousel: native scroll-snap swipe + smooth autoplay ===== */
(function ppCarousel(){
  const track=document.getElementById('ppTrack');if(!track)return;
  const slides=[...track.querySelectorAll('.pp-slide')],dots=[...document.querySelectorAll('.pp-dot')],now=document.getElementById('ppNow');
  let cur=0,timer=null,resume=null,raf=0,moved=false,visible=true;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pos=i=>slides[i].offsetLeft-(track.clientWidth-slides[i].clientWidth)/2;
  const set=i=>{cur=i;slides.forEach((s,k)=>s.classList.toggle('is-active',k===i));dots.forEach((d,k)=>d.classList.toggle('is-active',k===i));if(now)now.textContent=String(i+1).padStart(2,'0');};
  const pc=()=>matchMedia('(min-width:901px)').matches;
  const go=i=>{if(pc())return;i=(i+slides.length)%slides.length;track.scrollTo({left:pos(i),behavior:'smooth'});set(i);};
  const sync=()=>{raf=0;const c=track.scrollLeft+track.clientWidth/2;let b=0,d=1e9;slides.forEach((s,k)=>{const x=Math.abs(s.offsetLeft+s.clientWidth/2-c);if(x<d){d=x;b=k;}});if(b!==cur)set(b);};
  track.addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(sync);},{passive:true});
  const stop=()=>{clearInterval(timer);timer=null;};
  const play=()=>{if(pc()||reduce||timer||!visible||document.hidden)return;timer=setInterval(()=>go(cur+1),4600);};
  const pause=()=>{stop();clearTimeout(resume);resume=setTimeout(play,6000);};
  document.getElementById('ppPrev')?.addEventListener('click',()=>{go(cur-1);pause();});
  document.getElementById('ppNext')?.addEventListener('click',()=>{go(cur+1);pause();});
  dots.forEach(d=>d.addEventListener('click',()=>{go(+d.dataset.i);pause();}));
  ['touchstart','wheel','keydown'].forEach(e=>track.addEventListener(e,pause,{passive:true}));
  track.addEventListener('mouseenter',stop);track.addEventListener('mouseleave',()=>{clearTimeout(resume);resume=setTimeout(play,1200);});
  track.addEventListener('keydown',e=>{if(e.key==='ArrowRight')go(cur+1);if(e.key==='ArrowLeft')go(cur-1);});
  /* mouse drag for PC */
  let down=false,sx=0,sl=0;
  track.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;down=true;moved=false;sx=e.clientX;sl=track.scrollLeft;});
  window.addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-sx;if(Math.abs(dx)>6){moved=true;track.classList.add('is-dragging');}if(moved)track.scrollLeft=sl-dx;});
  window.addEventListener('pointerup',()=>{if(!down)return;down=false;if(moved){track.classList.remove('is-dragging');sync();go(cur);pause();}});
  track.addEventListener('click',e=>{if(moved){e.preventDefault();e.stopPropagation();moved=false;}},true);
  new IntersectionObserver(en=>{visible=en[0].isIntersecting;visible?play():stop();},{threshold:.35}).observe(track);
  document.addEventListener('visibilitychange',()=>document.hidden?stop():play());
  addEventListener('resize',()=>track.scrollTo({left:pos(cur)}));
  track.scrollTo({left:pos(0)});play();
})();
