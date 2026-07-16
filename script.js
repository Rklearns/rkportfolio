const storageKey = "rk-portfolio-theme";
const themeToggle = document.querySelector("[data-theme-toggle]");

const getPreferredTheme = () => {
  const saved = localStorage.getItem(storageKey);
  if (saved === "dark" || saved === "light") return saved;
  return "light";
};

const applyTheme = (theme) => {
  document.body.dataset.theme = theme;
};

applyTheme(getPreferredTheme());

themeToggle?.addEventListener("click", () => {
  const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  localStorage.setItem(storageKey, nextTheme);
});

const toast = document.getElementById("toast");
let toastTimer;

const showToast = (message) => {
  if (!toast) return;
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 1800);
};

document.querySelectorAll("[data-bibtex]").forEach((button) => {
  button.addEventListener("click", async () => {
    const bibtex = button.dataset.bibtex;
    if (!bibtex) return;

    try {
      await navigator.clipboard.writeText(bibtex);
      showToast("BibTeX copied");
    } catch {
      showToast("BibTeX ready to copy");
    }
  });
});
