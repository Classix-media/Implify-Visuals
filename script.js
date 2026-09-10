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

    const INTRO_DURATION_MS = 7000;   // must match --intro-duration in style.css
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
