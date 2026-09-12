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
    const service = document.getElementById("service").value;
    const message = document.getElementById("message").value.trim();

    const text =
`Hi Implify Visuals, I'd like to start a project.

Name: ${firstName} ${lastName}
Email: ${email}
Service: ${service}
Project details: ${message}`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
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

// ============ Logo Intro Overlay ============
(function () {
    const overlay = document.getElementById("introOverlay");
    if (!overlay) return;

    const INTRO_DURATION_MS = 5000;   // must match --intro-duration in style.css
    const HOLD_AFTER_MS = 300;        // brief pause after logo settles before fading out
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.body.style.overflow = "hidden";

    let removed = false;
    function removeOverlay() {
        if (removed) return;
        removed = true;
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        document.body.style.overflow = "";
    }

    function finishIntro() {
        overlay.classList.add("intro-fade-out");
        overlay.addEventListener("transitionend", removeOverlay, { once: true });
        setTimeout(removeOverlay, 900); // fallback in case transitionend doesn't fire
    }

    setTimeout(finishIntro, reducedMotion ? 700 : INTRO_DURATION_MS + HOLD_AFTER_MS);
})();

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

/* FINAL7 — Premium upward scroll reveals. Layout, carousel and existing interactions remain unchanged. */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) return;

  const sections = Array.from(document.querySelectorAll('section, .marquee-wrapper'));
  const sectionSelectors = [
    '.hero-section', '.stats-section', '.marquee-wrapper', '.about-section',
    '.clarity-section', '.tools-elevate-section', '.strategy-section',
    '.past-projects-section', '.reviews-section', '.portfolio-section',
    '.contact-section'
  ];

  sectionSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => el.classList.add('scroll-reveal'));
  });

  const staggerSelectors = [
    '.stats-container', '.services-triple-grid', '.tools-pills', '.strategy-cards',
    '.past-projects-column .projects-stage', '.past-projects-layout',
    '.reviews-carousel', '.portfolio-outer-frame', '.clarity-grid', '.dual-grid',
    '.contact-grid', '.what-to-expect-column'
  ];

  staggerSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => el.classList.add('scroll-reveal-stagger'));
  });

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
})();
