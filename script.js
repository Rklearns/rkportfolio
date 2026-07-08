const storageKey = "rk-portfolio-theme";
const body = document.body;
const toggle = document.querySelector("[data-theme-toggle]");

const getPreferredTheme = () => {
  const saved = localStorage.getItem(storageKey);
  if (saved === "dark" || saved === "light") return saved;
  return "light";
};

const applyTheme = (theme) => {
  body.dataset.theme = theme;
};

applyTheme(getPreferredTheme());

toggle?.addEventListener("click", () => {
  const nextTheme = body.dataset.theme === "light" ? "dark" : "light";
  applyTheme(nextTheme);
  localStorage.setItem(storageKey, nextTheme);
});

const openCardLink = (card) => {
  const href = card?.dataset.href;
  if (!href) return;

  const external = card.dataset.external === "true";
  if (external) {
    window.open(href, "_blank", "noopener,noreferrer");
    return;
  }

  window.location.href = href;
};

document.querySelectorAll("[data-href]").forEach((card) => {
  card.addEventListener("click", () => openCardLink(card));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openCardLink(card);
    }
  });
});

const SECTION_IDS = new Set([
  "home",
  "about",
  "projects",
  "publications",
  "talks",
  "experience",
  "education",
  "contact",
]);

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const spotPointerOk = () =>
  !prefersReducedMotion() && window.matchMedia("(hover: hover)").matches;

let pageTurnBusy = false;

const resolveSectionElement = (id) =>
  id === "home" ? document.getElementById("home") : document.getElementById(id);

const runSceneTransition = async (mid) => {
  const root = document.getElementById("sceneTransition");
  const paper = root?.querySelector(".scene-transition__paper");
  const shade = root?.querySelector(".scene-transition__shade");

  if (!root || !paper || !shade || prefersReducedMotion() || typeof paper.animate !== "function") {
    mid();
    return;
  }

  if (pageTurnBusy) return;
  pageTurnBusy = true;
  root.removeAttribute("hidden");
  root.classList.add("is-active");
  root.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  const ease = "cubic-bezier(0.45, 0, 0.18, 1)";
  const slideIn = { duration: 440, easing: ease, fill: "both" };
  const slideOut = { duration: 460, easing: "cubic-bezier(0.32, 0.08, 0.2, 1)", fill: "both" };

  try {
    const paperIn = paper.animate(
      [{ transform: "translateX(105%)" }, { transform: "translateX(0%)" }],
      slideIn
    );
    const shadeIn = shade.animate([{ opacity: 0 }, { opacity: 0.22 }], slideIn);
    await Promise.all([paperIn.finished, shadeIn.finished]);
    paperIn.cancel();
    shadeIn.cancel();
    paper.style.transform = "translateX(0%)";
    shade.style.opacity = "0.22";

    mid();

    const paperOut = paper.animate(
      [{ transform: "translateX(0%)" }, { transform: "translateX(-105%)" }],
      slideOut
    );
    const shadeOut = shade.animate([{ opacity: 0.22 }, { opacity: 0 }], slideOut);
    await Promise.all([paperOut.finished, shadeOut.finished]);
    paperOut.cancel();
    shadeOut.cancel();
  } catch {
    mid();
  } finally {
    paper.style.removeProperty("transform");
    shade.style.removeProperty("opacity");
    root.classList.remove("is-active");
    root.setAttribute("hidden", "");
    root.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    pageTurnBusy = false;
  }
};

document.addEventListener("click", async (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

  const anchor = e.target.closest("a[href]");
  if (!anchor) return;

  const raw = anchor.getAttribute("href");
  if (!raw || !raw.startsWith("#")) return;

  const id = raw.slice(1);
  if (!id || !SECTION_IDS.has(id)) return;

  let url;
  try {
    url = new URL(anchor.href);
  } catch {
    return;
  }
  if (url.origin !== window.location.origin) return;

  const targetEl = resolveSectionElement(id);
  if (!targetEl) return;

  if (pageTurnBusy) {
    e.preventDefault();
    return;
  }

  e.preventDefault();

  const go = () => {
    targetEl.scrollIntoView({ block: "start", behavior: "auto" });
    if (history.replaceState) {
      history.replaceState(null, "", `#${id}`);
    }
  };

  await runSceneTransition(go);
});

const introStage = document.querySelector(".intro-stage");
if (introStage && spotPointerOk()) {
  introStage.addEventListener(
    "pointermove",
    (e) => {
      const r = introStage.getBoundingClientRect();
      const x = ((e.clientX - r.left) / Math.max(r.width, 1)) * 100;
      const y = ((e.clientY - r.top) / Math.max(r.height, 1)) * 100;
      introStage.style.setProperty("--spot-x", `${Math.max(0, Math.min(100, x))}%`);
      introStage.style.setProperty("--spot-y", `${Math.max(0, Math.min(100, y))}%`);
    },
    { passive: true }
  );
}

// ── Scroll progress bar ──
const scrollProgress = document.getElementById("scrollProgress");
if (scrollProgress) {
  const updateProgress = () => {
    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress.style.setProperty("--scroll-pct", `${scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0}%`);
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();
}

// ── Section reveal on scroll ──
if (!prefersReducedMotion()) {
  const revObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          revObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
  );
  document.querySelectorAll(".simple-section").forEach((s) => revObserver.observe(s));
}

// ── Nav scroll spy ──
(() => {
  const allNavLinks = [...document.querySelectorAll(".center-nav a")];
  if (!allNavLinks.length) return;

  const getNavPairs = () =>
    allNavLinks.map((link) => ({
      link,
      section: document.getElementById(link.getAttribute("href").slice(1)),
    }));

  const updateActive = () => {
    const scrollY = window.scrollY + 160;
    let activeId = null;
    const pairs = getNavPairs();
    for (const { link, section } of pairs) {
      if (section && section.offsetTop <= scrollY) {
        activeId = link.getAttribute("href");
      }
    }
    pairs.forEach(({ link }) => {
      const isActive = link.getAttribute("href") === activeId;
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  window.addEventListener("scroll", updateActive, { passive: true });
  updateActive();
})();

// ── Arrow key navigation ──
(() => {
  const sectionIds = ["home", "about", "experience", "projects", "publications", "talks", "education", "contact"];

  document.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    if (e.target.closest("input, textarea, [contenteditable]")) return;
    e.preventDefault();

    const scrollCenter = window.scrollY + window.innerHeight / 2;
    let currentIdx = -1;
    for (let i = 0; i < sectionIds.length; i++) {
      const el = document.getElementById(sectionIds[i]);
      if (!el) continue;
      const top = el.offsetTop;
      const bottom = top + el.offsetHeight;
      if (scrollCenter >= top && scrollCenter < bottom) {
        currentIdx = i;
        break;
      }
    }

    if (currentIdx < 0) {
      const scrollTop = window.scrollY;
      for (let i = 0; i < sectionIds.length; i++) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop + el.offsetHeight / 2 >= scrollTop) {
          currentIdx = i;
          break;
        }
      }
      if (currentIdx < 0) currentIdx = 0;
    }

    const targetIdx = e.key === "ArrowDown"
      ? Math.min(currentIdx + 1, sectionIds.length - 1)
      : Math.max(currentIdx - 1, 0);

    if (targetIdx === currentIdx) return;
    const target = document.getElementById(sectionIds[targetIdx]);
    if (target) target.scrollIntoView({ block: "start", behavior: "smooth" });
  });
})();


