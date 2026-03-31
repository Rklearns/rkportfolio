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
