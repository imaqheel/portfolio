// Prevent browser from restoring previous scroll position on load
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
window.scrollTo(0, 0);

const mobileBreakpoint = 1024;
const stage = document.querySelector(".story-stage");
const panels = [...document.querySelectorAll(".story-panel")];
const techChips = [...document.querySelectorAll("[data-tech-step]")];
const siteHeader = document.querySelector(".site-header");
const navLinks = [...document.querySelectorAll("[data-nav-link]")];
const scrollLinks = [...document.querySelectorAll("[data-scroll-link]")];
const mobileMenuToggle = document.querySelector("[data-mobile-menu-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const navSections = navLinks
  .map((link) => document.querySelector(link.hash))
  .filter(Boolean);
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const experienceSection = document.querySelector("#experience");
const aboutSection = document.querySelector("#about");
const counters = [...document.querySelectorAll("[data-counter]")];
const aboutCounter = document.querySelector("[data-about-counter]");
const certificateModal = document.querySelector("[data-certificate-modal]");
const certificateOpenButtons = [...document.querySelectorAll("[data-certificate-open]")];
const certificateCloseButton = document.querySelector("[data-certificate-close]");
const certificatePanel = document.querySelector("[data-certificate-panel]");
const faqRows = [...document.querySelectorAll("[data-faq-row]")];

const state = {
  step: 0,
  ticking: false,
  counterObserver: null,
  aboutCounterObserver: null,
  lastFocusedButton: null,
};

const basePanelClasses = [
  "opacity-0",
  "pointer-events-none",
];

const activePanelClasses = [
  "opacity-100",
  "pointer-events-auto",
];

function setPanelState(panel, active) {
  panel.classList.remove(...(active ? basePanelClasses : activePanelClasses));
  panel.classList.add(...(active ? activePanelClasses : basePanelClasses));
}

function syncTechStack(step) {
  techChips.forEach((chip) => {
    chip.classList.toggle("is-active", Number(chip.dataset.techStep) === step);
  });
}

function syncPanels(step) {
  const isMobile = window.innerWidth <= mobileBreakpoint;

  panels.forEach((panel) => {
    const panelStep = Number(panel.dataset.step);
    if (isMobile) {
      panel.classList.toggle("hidden", panelStep !== 0);
      setPanelState(panel, panelStep === 0);
      syncTechStack(0);
      return;
    }

    panel.classList.remove("hidden");
    setPanelState(panel, panelStep === step);
  });

  syncTechStack(step);
}

function getHeaderOffset() {
  return Math.round((siteHeader?.getBoundingClientRect().height || 0));
}

function getScrollTop() {
  return window.scrollY;
}

function getSectionTop(section) {
  return section.getBoundingClientRect().top + window.scrollY;
}

function scrollToSection(target) {
  const top = target.id === "home" ? 0 : getSectionTop(target) - getHeaderOffset();

  window.scrollTo({
    top: Math.max(0, top),
    behavior: prefersReducedMotion.matches ? "auto" : "smooth",
  });
}

function setActiveNav(sectionId) {
  if (state.activeSection === sectionId) {
    return;
  }

  state.activeSection = sectionId;

  navLinks.forEach((link) => {
    const isActive = link.hash === `#${sectionId}`;
    link.classList.toggle("is-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function setMobileMenu(open) {
  if (!mobileMenuToggle || !mobileMenu) {
    return;
  }

  mobileMenuToggle.classList.toggle("is-open", open);
  mobileMenu.classList.toggle("is-open", open);
  mobileMenuToggle.setAttribute("aria-expanded", String(open));
  mobileMenuToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
}

function closeMobileMenu() {
  setMobileMenu(false);
}

function updateActiveNav() {
  const marker = getScrollTop() + getHeaderOffset() + 24;
  const current =
    [...navSections]
      .reverse()
      .find((section) => marker >= getSectionTop(section)) || navSections[0];

  if (current) {
    setActiveNav(current.id);
  }
}

function updateStory() {
  if (window.innerWidth <= mobileBreakpoint) {
    state.step = 0;
    syncPanels(0);
    return;
  }

  const viewportHeight = window.innerHeight;
  const scrollable = stage.offsetHeight - viewportHeight;
  if (scrollable <= 1) {
    state.step = 0;
    syncPanels(0);
    return;
  }

  const scrolledThroughStage = -stage.getBoundingClientRect().top;

  const progress = Math.min(
    1,
    Math.max(0, scrolledThroughStage / Math.max(1, scrollable)),
  );

  const step = Math.min(3, Math.floor(progress * 4));

  if (step !== state.step) {
    state.step = step;
    syncPanels(step);
  }
}

function setCounterValue(counter, value) {
  counter.textContent = String(Math.round(value));
}

function resetCounters() {
  counters.forEach((counter) => {
    counter.dataset.animated = "false";
    counter.dataset.runId = "reset";
    setCounterValue(counter, 0);
  });
}

function animateCounter(counter) {
  if (counter.dataset.animated === "true") {
    return;
  }

  counter.dataset.animated = "true";

  const target = Number(counter.dataset.target || 0);
  const duration = prefersReducedMotion.matches ? 0 : 1500;
  const startedAt = performance.now();
  const runId = `${startedAt}-${target}`;
  counter.dataset.runId = runId;

  function tick(now) {
    if (counter.dataset.runId !== runId) {
      return;
    }

    if (duration === 0) {
      setCounterValue(counter, target);
      return;
    }

    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    setCounterValue(counter, target * eased);

    if (progress < 1) {
      window.requestAnimationFrame(tick);
    }
  }

  window.requestAnimationFrame(tick);
}

function animateCounters() {
  counters.forEach(animateCounter);
}

function setupCounterObserver() {
  state.counterObserver?.disconnect();

  const educationCard = document.querySelector("#education-card");
  const observeTarget = educationCard || experienceSection;

  if (!observeTarget || counters.length === 0) {
    return;
  }

  state.counterObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        resetCounters();
        animateCounters();
      } else {
        resetCounters();
      }
    },
    {
      root: null,
      threshold: 0.3,
    },
  );

  state.counterObserver.observe(observeTarget);
}

function resetAboutCounter() {
  if (!aboutCounter) {
    return;
  }

  aboutCounter.dataset.animated = "false";
  aboutCounter.dataset.runId = "reset";
  setCounterValue(aboutCounter, 0);
}

function animateAboutCounter() {
  if (!aboutCounter || aboutCounter.dataset.animated === "true") {
    return;
  }

  aboutCounter.dataset.animated = "true";

  const target = Number(aboutCounter.dataset.target || 100);
  const duration = prefersReducedMotion.matches ? 0 : 1200;
  const startedAt = performance.now();
  const runId = `${startedAt}-${target}-about`;
  aboutCounter.dataset.runId = runId;

  function tick(now) {
    if (aboutCounter.dataset.runId !== runId) {
      return;
    }

    if (duration === 0) {
      setCounterValue(aboutCounter, target);
      return;
    }

    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    setCounterValue(aboutCounter, target * eased);

    if (progress < 1) {
      window.requestAnimationFrame(tick);
    }
  }

  window.requestAnimationFrame(tick);
}

function setupAboutCounterObserver() {
  state.aboutCounterObserver?.disconnect();

  if (!aboutSection || !aboutCounter) {
    return;
  }

  state.aboutCounterObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        resetAboutCounter();
        animateAboutCounter();
      } else {
        resetAboutCounter();
      }
    },
    {
      root: null,
      threshold: 0.45,
    },
  );

  state.aboutCounterObserver.observe(aboutSection);
}

function openCertificateModal(event) {
  if (!certificateModal) {
    return;
  }

  const button = event.currentTarget;
  state.lastFocusedButton = button;
  const src = button.getAttribute("data-certificate-src");
  const title = button.getAttribute("data-certificate-title") || "Certificate";

  const modalImg = certificateModal.querySelector("img");
  const modalTitle = certificateModal.querySelector("#internship-certificate-title");

  if (modalImg && src) {
    modalImg.src = src;
    modalImg.alt = title;
  }
  if (modalTitle) {
    modalTitle.textContent = title;
  }

  certificateModal.classList.remove("hidden");
  certificateModal.classList.add("flex");
  document.body.style.overflow = "hidden";
  certificateCloseButton?.focus();

  // Trigger animations in the next paint cycle
  window.requestAnimationFrame(() => {
    certificateModal.classList.remove("opacity-0");
    certificateModal.classList.add("opacity-100");
    if (certificatePanel) {
      certificatePanel.classList.remove("scale-95", "opacity-0");
      certificatePanel.classList.add("scale-100", "opacity-100");
    }
  });
}

function closeCertificateModal() {
  if (!certificateModal) {
    return;
  }

  certificateModal.classList.remove("opacity-100");
  certificateModal.classList.add("opacity-0");
  if (certificatePanel) {
    certificatePanel.classList.remove("scale-100", "opacity-100");
    certificatePanel.classList.add("scale-95", "opacity-0");
  }

  // Hide the modal container completely once transition finishes
  setTimeout(() => {
    certificateModal.classList.add("hidden");
    certificateModal.classList.remove("flex");
    document.body.style.overflow = "";
    if (state.lastFocusedButton) {
      state.lastFocusedButton.focus();
    }
  }, 300);
}

function setFaqRow(row, open) {
  const trigger = row.querySelector("[data-faq-trigger]");
  const content = row.querySelector("[data-faq-content]");
  const icon = row.querySelector("[data-faq-icon]");

  trigger?.setAttribute("aria-expanded", String(open));
  row.classList.toggle("border-slate-300", open);
  row.classList.toggle("bg-white", open);
  row.classList.toggle("shadow-[0_18px_44px_rgba(15,23,42,0.08)]", open);
  row.classList.toggle("border-slate-200/80", !open);
  row.classList.toggle("bg-white/70", !open);
  content?.classList.toggle("grid-rows-[1fr]", open);
  content?.classList.toggle("opacity-100", open);
  content?.classList.toggle("grid-rows-[0fr]", !open);
  content?.classList.toggle("opacity-0", !open);
  icon?.classList.toggle("rotate-180", open);
}

syncPanels(0);
updateStory();
updateActiveNav();
setupCounterObserver();
setupAboutCounterObserver();

certificateOpenButtons.forEach((btn) => btn.addEventListener("click", openCertificateModal));
certificateCloseButton?.addEventListener("click", closeCertificateModal);
certificateModal?.addEventListener("click", closeCertificateModal);
certificatePanel?.addEventListener("click", (event) => {
  event.stopPropagation();
});

mobileMenuToggle?.addEventListener("click", () => {
  const isOpen = mobileMenuToggle.getAttribute("aria-expanded") === "true";
  setMobileMenu(!isOpen);
});

document.addEventListener("click", (event) => {
  if (!siteHeader?.contains(event.target)) {
    closeMobileMenu();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && certificateModal && !certificateModal.classList.contains("hidden")) {
    closeCertificateModal();
  }

  if (event.key === "Escape") {
    closeMobileMenu();
  }
});

faqRows.forEach((row, index) => {
  function openRow() {
    faqRows.forEach((currentRow) => {
      setFaqRow(currentRow, currentRow === row);
    });
  }

  function closeRows() {
    faqRows.forEach((currentRow) => {
      setFaqRow(currentRow, false);
    });
  }

  row.querySelector("[data-faq-trigger]")?.addEventListener("click", () => {
    const isOpen = row.querySelector("[data-faq-trigger]")?.getAttribute("aria-expanded") === "true";

    faqRows.forEach((currentRow) => {
      setFaqRow(currentRow, false);
    });

    if (!isOpen) {
      setFaqRow(row, true);
    } else if (index === 0) {
      setFaqRow(row, false);
    }
  });

  const isFinePointer = window.matchMedia("(pointer: fine)").matches;
  if (isFinePointer) {
    row.addEventListener("mouseenter", openRow);
    row.addEventListener("mouseleave", closeRows);
    row.querySelector("[data-faq-trigger]")?.addEventListener("focus", openRow);
    row.querySelector("[data-faq-trigger]")?.addEventListener("blur", closeRows);
  }
});

scrollLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.hash);

    if (!target) {
      return;
    }

    event.preventDefault();
    setActiveNav(target.id);
    closeMobileMenu();
    scrollToSection(target);
    window.history.pushState(null, "", link.hash);
  });
});

window.addEventListener("resize", () => {
  if (window.innerWidth >= 1024) {
    closeMobileMenu();
  }

  updateStory();
  updateActiveNav();
  setupCounterObserver();
  setupAboutCounterObserver();
});

function scheduleScrollUpdate() {
  if (state.ticking) {
    return;
  }

  state.ticking = true;
  window.requestAnimationFrame(() => {
    updateStory();
    updateActiveNav();
    state.ticking = false;
  });
}

window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });

// ==========================================
// ADVANCED UI/UX & ANIMATION EXTENSIONS
// ==========================================

// --- Theme Toggle Logic ---
function initThemeToggle() {
  const themeToggle = document.getElementById("theme-toggle");
  if (!themeToggle) return;

  const sunIcon = themeToggle.querySelector(".sun-icon");
  const moonIcon = themeToggle.querySelector(".moon-icon");
  const systemDarkQuery = window.matchMedia("(prefers-color-scheme: dark)");

  function applyTheme(isDark) {
    if (isDark) {
      document.documentElement.classList.add("dark");
      sunIcon?.classList.remove("hidden");
      moonIcon?.classList.add("hidden");
    } else {
      document.documentElement.classList.remove("dark");
      sunIcon?.classList.add("hidden");
      moonIcon?.classList.remove("hidden");
    }
  }

  // Initial check — respect saved preference, otherwise follow system
  const savedTheme = localStorage.getItem("theme");
  const isDark = savedTheme === "dark" || (!savedTheme && systemDarkQuery.matches);
  applyTheme(isDark);

  // Live listener: if system theme changes and user hasn't manually picked, follow along
  systemDarkQuery.addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
      applyTheme(e.matches);
    }
  });

  themeToggle.addEventListener("click", () => {
    const currentlyDark = document.documentElement.classList.contains("dark");
    const newDark = !currentlyDark;
    applyTheme(newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
  });
}

// --- Custom Cursor Logic ---
function initCustomCursor() {
  const dot = document.getElementById("cursor-dot");
  const circle = document.getElementById("cursor-circle");
  if (!dot || !circle) return;

  // Only run if device supports fine pointing (mouse)
  const isFinePointer = window.matchMedia("(pointer: fine)").matches;
  if (!isFinePointer) {
    dot.style.display = "none";
    circle.style.display = "none";
    return;
  }

  let mouse = { x: -100, y: -100 };
  let dotPos = { x: -100, y: -100 };
  let circlePos = { x: -100, y: -100 };
  let velocity = { x: 0, y: 0 };
  let lastTime = performance.now();

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // Smooth follow using requestAnimationFrame (lerp)
  function updateCursor(time) {
    const dt = time - lastTime || 1;
    lastTime = time;

    // Dot snaps immediately
    dotPos.x = mouse.x;
    dotPos.y = mouse.y;

    // Circle follows with lag (lerp)
    const lerpFactor = 0.15;
    const dx = mouse.x - circlePos.x;
    const dy = mouse.y - circlePos.y;

    circlePos.x += dx * lerpFactor;
    circlePos.y += dy * lerpFactor;

    // Stretch based on mouse velocity
    velocity.x = dx / dt;
    velocity.y = dy / dt;
    const speed = Math.min(Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y), 4); // Clamp speed
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    const stretch = 1 + speed * 0.15;

    dot.style.transform = `translate3d(${dotPos.x}px, ${dotPos.y}px, 0)`;
    circle.style.transform = `translate3d(${circlePos.x}px, ${circlePos.y}px, 0) rotate(${angle}deg) scale(${stretch}, ${2 - stretch})`;

    requestAnimationFrame(updateCursor);
  }
  requestAnimationFrame(updateCursor);

  // Hover states
  const interactables = document.querySelectorAll("a, button, [role='button'], [data-faq-trigger], [data-certificate-open]");
  interactables.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      dot.classList.add("hovered");
      circle.classList.add("hovered");
    });
    el.addEventListener("mouseleave", () => {
      dot.classList.remove("hovered");
      circle.classList.remove("hovered");
    });
  });
}

// --- Interactive Particle Canvas ---
function initParticleCanvas() {
  const canvas = document.getElementById("hero-particles");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = (canvas.width = canvas.offsetWidth);
  let height = (canvas.height = canvas.offsetHeight);

  let particles = [];
  const particleCount = Math.min(Math.floor((width * height) / 14000), 75); // Adaptive count

  let mouse = { x: null, y: null, radius: 150 };

  window.addEventListener("resize", () => {
    if (!canvas.offsetWidth) return;
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  });

  const homeSection = document.getElementById("home");
  homeSection?.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  homeSection?.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.radius = Math.random() * 2 + 1;
    }

    update() {
      // Repel from mouse
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x -= Math.cos(angle) * force * 1.5;
          this.y -= Math.sin(angle) * force * 1.5;
        }
      }

      this.x += this.vx;
      this.y += this.vy;

      // Wrap around bounds
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
    }

    draw() {
      const isDark = document.documentElement.classList.contains("dark");
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? "rgba(56, 189, 248, 0.45)" : "rgba(15, 23, 42, 0.25)";
      ctx.fill();
    }
  }

  // Initialize particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw lines
    const isDark = document.documentElement.classList.contains("dark");
    const maxDist = 110;
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const alpha = ((maxDist - dist) / maxDist) * 0.16;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = isDark
            ? `rgba(56, 189, 248, ${alpha})`
            : `rgba(15, 23, 42, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

// --- 3D Card Tilt & Spotlight Glare ---
function initCardTilt() {
  const cards = document.querySelectorAll(".spotlight-card");
  const isFinePointer = window.matchMedia("(pointer: fine)").matches;
  if (!isFinePointer) return; // Disable tilt on touch devices

  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Spotlight coordinates for border shine
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);

      // 3D Tilt calculation
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((centerY - y) / centerY) * 6; // Max 6 degrees
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1000px) translate3d(0, 0, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = `perspective(1000px) translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
  });
}

// --- Intersection Observer Scroll Reveals ---
function initScrollReveal() {
  const revealElements = document.querySelectorAll(".reveal, .reveal-stagger");
  if (revealElements.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    },
    {
      root: null,
      threshold: 0.02,
      rootMargin: "0px 0px 150px 0px"
    }
  );

  revealElements.forEach((el) => observer.observe(el));
}

// --- Hacker Text Scramble Effect ---
class TextScrambler {
  constructor(el) {
    this.el = el;
    this.chars = "!<>-_\\/[]{}—=+*^?#________";
    this.update = this.update.bind(this);
  }

  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => (this.resolve = resolve));
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || "";
      const to = newText[i] || "";
      const start = Math.floor(Math.random() * 25);
      const end = start + Math.floor(Math.random() * 25);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameId);
    this.frame = 0;
    this.update();
    return promise;
  }

  update() {
    const fragment = document.createDocumentFragment();
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        fragment.appendChild(document.createTextNode(to));
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        const span = document.createElement("span");
        span.className = "text-sky-500 dark:text-sky-400 font-mono";
        span.textContent = char;
        fragment.appendChild(span);
      } else {
        fragment.appendChild(document.createTextNode(from));
      }
    }
    this.el.textContent = "";
    this.el.appendChild(fragment);
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameId = requestAnimationFrame(this.update);
      this.frame++;
    }
  }

  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

function initTextScramble() {
  const target = document.querySelector("#home h1");
  if (!target) return;

  const originalText = target.innerText;
  const scrambler = new TextScrambler(target);

  // Run scramble on hover
  target.addEventListener("mouseenter", () => {
    scrambler.setText(originalText);
  });

  // Run once initially
  scrambler.setText(originalText);
}

// --- Mobile Project Details Autoplay Carousel ---
function initProjectCarousels() {
  const carousels = document.querySelectorAll("[data-project-carousel]");

  carousels.forEach((carousel) => {
    let intervalId = null;
    let isInteracting = false;
    let interactionTimeout = null;

    function getNextScrollPosition() {
      const scrollLeft = carousel.scrollLeft;
      const children = [...carousel.children];
      if (children.length <= 1) return null;

      // Card width including the 16px (gap-4) spacing
      const cardWidth = children[0].offsetWidth + 16;
      const currentIndex = Math.round(scrollLeft / cardWidth);
      const nextIndex = (currentIndex + 1) % children.length;

      return nextIndex * cardWidth;
    }

    function autoScroll() {
      if (isInteracting) return;
      const nextPos = getNextScrollPosition();
      if (nextPos !== null) {
        carousel.scrollTo({
          left: nextPos,
          behavior: "smooth",
        });
      }
    }

    function startAutoScroll() {
      stopAutoScroll();
      intervalId = setInterval(autoScroll, 3200);
    }

    function stopAutoScroll() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }

    function handleInteraction() {
      isInteracting = true;
      stopAutoScroll();

      if (interactionTimeout) {
        clearTimeout(interactionTimeout);
      }

      // Resume auto-scroll after 6 seconds of touch inactivity
      interactionTimeout = setTimeout(() => {
        isInteracting = false;
        startAutoScroll();
      }, 6000);
    }

    // Touch events for mobile swiping
    carousel.addEventListener("touchstart", handleInteraction, { passive: true });
    carousel.addEventListener("touchmove", handleInteraction, { passive: true });
    carousel.addEventListener("touchend", handleInteraction, { passive: true });

    // Fallback for click/scroll activity
    carousel.addEventListener("mousedown", handleInteraction, { passive: true });
    carousel.addEventListener("scroll", () => {
      if (!intervalId && !isInteracting) {
        handleInteraction();
      }
    }, { passive: true });

    // Start auto scroll
    startAutoScroll();
  });
}

// Initialize all features
initThemeToggle();
initCustomCursor();
initParticleCanvas();
initCardTilt();
initScrollReveal();
initTextScramble();
initProjectCarousels();

