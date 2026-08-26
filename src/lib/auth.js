/**
 * Strapi Authentication Helper Utility
 * Connects Next.js client with Strapi Users & Permissions API (http://localhost:1337)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";
const TOKEN_KEY = "strapi_jwt";

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
  } else {
    localStorage.removeItem(TOKEN_KEY);
    deleteCookie(TOKEN_KEY);
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
  const response = await fetch(`${API_BASE_URL}/api/auth/local`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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
  const response = await fetch(`${API_BASE_URL}/api/auth/local/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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
export async function fetchCurrentUser(token) {
  const authToken = token || getStoredToken();
  if (!authToken) return null;

  const response = await fetch(
    `${API_BASE_URL}/api/users/me?populate=image,role`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      clearStoredToken();
      return null;
    }
    throw new Error(`Failed to fetch current user (HTTP ${response.status})`);
  }

  return await response.json();
}
