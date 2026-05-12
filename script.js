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

let pageTurnBusy = false;

const resolveSectionElement = (id) =>
  id === "home" ? document.getElementById("home") : document.getElementById(id);

const runPageTurn = async (mid) => {
  const root = document.getElementById("pageTurn");
  const sheet = root?.querySelector(".page-turn__sheet");

  if (!root || !sheet || prefersReducedMotion() || typeof sheet.animate !== "function") {
    mid();
    return;
  }

  if (pageTurnBusy) return;
  pageTurnBusy = true;
  root.removeAttribute("hidden");
  root.classList.add("is-active");
  root.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  try {
    const close = sheet.animate(
      [{ transform: "rotateY(0deg)" }, { transform: "rotateY(-102deg)" }],
      { duration: 400, easing: "cubic-bezier(0.52, 0.02, 0.62, 1)", fill: "forwards" }
    );
    await close.finished;
    close.cancel();
    sheet.style.transform = "rotateY(-102deg)";
    mid();

    const open = sheet.animate(
      [{ transform: "rotateY(-102deg)" }, { transform: "rotateY(0deg)" }],
      { duration: 420, easing: "cubic-bezier(0.38, 0, 0.48, 1)", fill: "forwards" }
    );
    await open.finished;
    open.cancel();
  } catch {
    mid();
  } finally {
    sheet.style.removeProperty("transform");
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

  await runPageTurn(go);
});
