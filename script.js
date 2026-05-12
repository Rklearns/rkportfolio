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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buildNameReelSteps = () => {
  const texts = [
    "RishitKar",
    "RISHITKAR",
    "rishitkar",
    "Rishit Kar",
    "RISHIT KAR",
    "rishit kar",
    "RishitKar.",
    "riShItKaR",
    "Rishit_Kar",
    "rishit.kar",
  ];
  const fonts = [
    `'Bebas Neue', sans-serif`,
    `'Oswald', sans-serif`,
    `'Playfair Display', Georgia, serif`,
    `'JetBrains Mono', ui-monospace, monospace`,
    `'Syne', sans-serif`,
    `'Instrument Serif', Georgia, serif`,
    `'Archivo Black', sans-serif`,
    `'Shadows Into Light', cursive`,
    `'Quicksand', sans-serif`,
    "Georgia, ui-serif, serif",
    "ui-monospace, Menlo, Monaco, monospace",
    "system-ui, sans-serif",
    "Palatino, 'Palatino Linotype', serif",
  ];
  const mods = ["", "name-reel__label--chrome", "name-reel__label--outline", "name-reel__label--frost", "name-reel__label--glow", "name-reel__label--mono-cut"];
  const transforms = [
    "none",
    "scale(1.1) rotate(-2.5deg)",
    "scale(0.9) rotate(2deg)",
    "scale(1.06) skewX(-5deg)",
    "skewX(5deg) scale(0.94)",
    "rotate(-7deg) scale(1.04)",
    "scaleY(1.18) scaleX(0.88)",
    "translateX(-1.5%) scale(1.08)",
    "scale(1.15) rotate(1.2deg)",
  ];
  const weights = ["200", "300", "400", "500", "600", "700", "800", "900"];
  const steps = [];

  for (let i = 0; i < 28; i++) {
    steps.push({
      text: texts[i % texts.length],
      className: mods[i % mods.length],
      style: {
        fontFamily: fonts[i % fonts.length],
        fontWeight: weights[i % weights.length],
        fontStyle: i % 5 === 1 ? "italic" : "normal",
        letterSpacing: `${(-0.055 + (i % 14) * 0.0075).toFixed(4)}em`,
        textTransform: ["uppercase", "lowercase", "none", "capitalize"][(i + 1) % 4],
        transform: transforms[i % transforms.length],
        filter: i % 9 === 2 ? "blur(0.35px)" : i % 9 === 6 ? "contrast(1.12)" : "none",
        opacity: String(0.78 + (i % 4) * 0.06),
        fontSize: `clamp(${2.25 + (i % 8) * 0.2}rem, ${6.2 + (i % 6) * 0.9}vw, ${4.6 + (i % 5) * 0.35}rem)`,
      },
    });
  }

  steps.push({
    text: "Rishit Kar",
    className: "name-reel__label--shine",
    style: {
      fontFamily: `'Quicksand', sans-serif`,
      fontWeight: "600",
      fontStyle: "normal",
      letterSpacing: "-0.03em",
      textTransform: "none",
      transform: "scale(1)",
      filter: "none",
      opacity: "1",
      fontSize: "clamp(2.6rem, 10vw, 5rem)",
    },
  });

  steps.push({
    text: "Rishit Kar",
    className: "",
    style: {
      fontFamily: `'Shadows Into Light', cursive`,
      fontWeight: "400",
      fontStyle: "normal",
      letterSpacing: "0.02em",
      textTransform: "none",
      transform: "scale(1.02)",
      filter: "none",
      opacity: "1",
      fontSize: "clamp(3rem, 12vw, 6rem)",
    },
  });

  return steps;
};

const applyReelStep = (el, step) => {
  el.textContent = step.text;
  el.className = "name-reel__label" + (step.className ? ` ${step.className}` : "");
  el.style.cssText = "";
  Object.assign(el.style, step.style);
};

(() => {
  const reel = document.getElementById("nameReel");
  const label = document.getElementById("reelText");
  const skipBtn = reel?.querySelector("[data-reel-skip]");
  if (!reel || !label) return;

  if (prefersReducedMotion()) {
    reel.classList.add("name-reel--gone");
    reel.setAttribute("aria-hidden", "true");
    reel.setAttribute("inert", "");
    return;
  }

  const steps = buildNameReelSteps();
  let done = false;
  let escHandler = null;

  const cleanup = () => {
    if (escHandler) {
      document.removeEventListener("keydown", escHandler);
      escHandler = null;
    }
    document.documentElement.classList.remove("reel-active");
    document.body.style.overflow = "";
    reel.setAttribute("aria-hidden", "true");
    reel.classList.add("name-reel--out");

    let finalized = false;
    const finalize = () => {
      if (finalized) return;
      finalized = true;
      reel.removeEventListener("transitionend", onEnd);
      clearTimeout(fallback);
      reel.setAttribute("inert", "");
      reel.setAttribute("hidden", "");
      reel.classList.add("name-reel--gone");
    };
    const onEnd = (e) => {
      if (e.target !== reel || e.propertyName !== "opacity") return;
      finalize();
    };
    const fallback = setTimeout(finalize, 900);
    reel.addEventListener("transitionend", onEnd);
  };

  const finish = () => {
    if (done) return;
    done = true;
    cleanup();
  };

  skipBtn?.addEventListener("click", finish);
  escHandler = (e) => {
    if (e.key === "Escape") finish();
  };
  document.addEventListener("keydown", escHandler);

  document.documentElement.classList.add("reel-active");
  document.body.style.overflow = "hidden";
  skipBtn?.focus({ preventScroll: true });

  (async () => {
    for (let i = 0; i < steps.length; i++) {
      if (done) return;
      applyReelStep(label, steps[i]);
      const ms = i >= steps.length - 2 ? 110 : 45 + (i % 3) * 12;
      await sleep(ms);
    }
    if (done) return;
    await sleep(360);
    finish();
  })();
})();

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
  const allNavLinks = [...document.querySelectorAll(".center-nav a, .sticky-nav a")];
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
    pairs.forEach(({ link }) => link.classList.toggle("active", link.getAttribute("href") === activeId));
  };

  window.addEventListener("scroll", updateActive, { passive: true });
  updateActive();
})();

// ── Sticky nav toggle ──
(() => {
  const stickyNav = document.getElementById("stickyNav");
  const introStage = document.querySelector(".intro-stage");
  if (!stickyNav || !introStage) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      stickyNav.classList.toggle("visible", !entry.isIntersecting);
    },
    { threshold: 0 }
  );
  observer.observe(introStage);
})();

// ── Rotating tagline ──
(() => {
  const el = document.getElementById("introRole");
  if (!el) return;
  const roles = ["AI Researcher", "Backend Engineer", "ML Enthusiast", "CS Undergraduate"];
  let idx = 0;
  setInterval(() => {
    el.classList.add("fade");
    setTimeout(() => {
      idx = (idx + 1) % roles.length;
      el.textContent = roles[idx];
      el.classList.remove("fade");
    }, 350);
  }, 3200);
})();

// ── Arrow key navigation ──
(() => {
  const sectionIds = ["home", "about", "projects", "publications", "talks", "experience", "education", "contact"];

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

// ── Photo 3D tilt on hover ──
if (!prefersReducedMotion() && window.matchMedia("(hover: hover)").matches) {
  document.querySelectorAll(".floating-photo").forEach((photo) => {
    photo.addEventListener("mousemove", (e) => {
      const rect = photo.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      photo.style.setProperty("--tilt-x", `${(y - 0.5) * -10}deg`);
      photo.style.setProperty("--tilt-y", `${(x - 0.5) * 10}deg`);
    });

    photo.addEventListener("mouseleave", () => {
      photo.style.removeProperty("--tilt-x");
      photo.style.removeProperty("--tilt-y");
    });
  });
}
