const TOKEN_KEY = "mpms_token";
const USER_KEY = "mpms_user";

function isBrowser() {
  return typeof window !== "undefined";
}

export function saveToken(token) {
  if (!isBrowser()) return;

  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  if (!isBrowser()) return null;

  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
  if (!isBrowser()) return;

  localStorage.removeItem(TOKEN_KEY);
}

export function saveUser(user) {
  if (!isBrowser()) return;

  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser() {
  if (!isBrowser()) return null;

  const user = localStorage.getItem(USER_KEY);

  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

export function removeUser() {
  if (!isBrowser()) return;

  localStorage.removeItem(USER_KEY);
}

export function logout() {
  removeToken();
  removeUser();
}

export function isAuthenticated() {
  return Boolean(getToken());
}
