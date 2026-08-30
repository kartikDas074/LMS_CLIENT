const configuredApiUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_STRAPI_API_URL;

if (!configuredApiUrl && process.env.NODE_ENV === "production") {
  throw new Error("NEXT_PUBLIC_BACKEND_URL must be configured for production.");
}

export const API_BASE_URL = (
  configuredApiUrl || "http://localhost:1337/api"
).replace(/\/$/, "");
