/**
 * Strapi Authentication Helper Utility
 * Connects Next.js client with Strapi Users & Permissions API (http://localhost:1337)
 */

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_STRAPI_API_URL ||
  "http://localhost:1337/api"
).replace(/\/$/, "");
const TOKEN_KEY = "strapi_jwt";

function logAuth(event, details = {}) {
  console.debug(`[auth] ${event}`, details);
}

/**
 * Retrieves the stored Strapi JWT token from localStorage or cookie.
 */
export function getStoredToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY) || getCookie(TOKEN_KEY);
}

/**
 * Stores the Strapi JWT token in localStorage and cookie.
 */
export function setStoredToken(token) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    setCookie(TOKEN_KEY, token, 7);
    logAuth("JWT stored", { exists: true, length: token.length });
  } else {
    localStorage.removeItem(TOKEN_KEY);
    deleteCookie(TOKEN_KEY);
    logAuth("JWT removed", { source: "clearStoredToken" });
  }
}

/**
 * Removes the stored token.
 */
export function clearStoredToken() {
  setStoredToken(null);
}

/**
 * Helper to get cookie by name.
 */
function getCookie(name) {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

/**
 * Helper to set cookie.
 */
function setCookie(name, value, days) {
  if (typeof document === "undefined") return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; path=/; expires=${date.toUTCString()}; SameSite=Lax`;
}

/**
 * Helper to delete cookie.
 */
function deleteCookie(name) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
}

/**
 * Logs in a user using Strapi POST /api/auth/local
 * @param {Object} credentials { identifier, password }
 * @returns {Promise<{ user: Object, jwt: string }>}
 */
export async function loginUser({ identifier, password }) {
  const response = await fetch(`${API_BASE_URL}/auth/local`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ identifier, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg =
      data?.error?.message ||
      data?.message?.[0]?.messages?.[0]?.message ||
      "Invalid identifier or password.";
    throw new Error(errorMsg);
  }

  setStoredToken(data.jwt);
  return data;
}

/**
 * Registers a user with custom role assignment and Cloudinary image attachment.
 * Calls Strapi POST /api/auth/local/register
 * @param {Object} payload { username, email, password, confirmPassword, role, profileImage }
 * @returns {Promise<{ user: Object, jwt: string }>}
 */
export async function registerUser({
  username,
  email,
  password,
  confirmPassword,
  role,
  profileImage,
}) {
  const response = await fetch(`${API_BASE_URL}/auth/local/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      username,
      email,
      password,
      confirmPassword,
      role,
      profileImage,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg =
      data?.error?.message ||
      data?.message?.[0]?.messages?.[0]?.message ||
      "Registration failed. Please check your inputs.";
    throw new Error(errorMsg);
  }

  setStoredToken(data.jwt);
  return data;
}

/**
 * Retrieves the current authenticated user with role and profile image populated.
 * Calls Strapi GET /api/users/me?populate=image,role
 * @param {string} token
 * @returns {Promise<Object>}
 */
export async function fetchCurrentUser(token, allowRefresh = true) {
  const authToken = token || getStoredToken();
  if (!authToken) return null;

  logAuth("Authentication restore started", {
    jwtExists: true,
    jwtLength: authToken.length,
  });

  const response = await fetch(
    `${API_BASE_URL}/users/me?populate=image,role`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      credentials: "include",
    }
  );

  logAuth("/users/me response", { status: response.status });

  if (!response.ok) {
    if (response.status === 401) {
      logAuth("Authentication restore failed", {
        reason: "access token rejected; attempting refresh",
      });
      const refreshedToken = allowRefresh ? await refreshAccessToken() : null;
      if (refreshedToken) {
        return fetchCurrentUser(refreshedToken, false);
      }
      const error = new Error("Authentication session is no longer valid.");
      error.status = 401;
      error.authInvalid = true;
      throw error;
    }
    const error = new Error(`Failed to fetch current user (HTTP ${response.status})`);
    error.status = response.status;
    throw error;
  }

  logAuth("Authentication restore succeeded");
  return response.json();
}

export async function refreshAccessToken() {
  logAuth("Access token refresh started");
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    logAuth("/auth/refresh response", { status: response.status });
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (!data?.jwt) {
      return null;
    }

    setStoredToken(data.jwt);
    logAuth("Access token refresh succeeded", { jwtLength: data.jwt.length });
    return data.jwt;
  } catch (error) {
    logAuth("Access token refresh failed", { reason: error.message });
    return null;
  }
}
