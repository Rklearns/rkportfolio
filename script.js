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
