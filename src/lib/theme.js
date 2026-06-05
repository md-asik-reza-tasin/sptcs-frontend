const THEME_KEY = "mpms_theme";
const LIGHT_THEME = "light";
const DARK_THEME = "dark";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getTheme() {
  if (!isBrowser()) return LIGHT_THEME;

  const savedTheme = localStorage.getItem(THEME_KEY);

  return savedTheme === DARK_THEME ? DARK_THEME : LIGHT_THEME;
}

export function saveTheme(theme) {
  if (!isBrowser()) return;

  localStorage.setItem(THEME_KEY, theme === DARK_THEME ? DARK_THEME : LIGHT_THEME);
}

export function applyTheme(theme) {
  if (!isBrowser()) return;

  const nextTheme = theme === DARK_THEME ? DARK_THEME : LIGHT_THEME;

  document.documentElement.classList.toggle(DARK_THEME, nextTheme === DARK_THEME);
}

export function toggleTheme() {
  const nextTheme = getTheme() === DARK_THEME ? LIGHT_THEME : DARK_THEME;

  saveTheme(nextTheme);
  applyTheme(nextTheme);

  return nextTheme;
}
