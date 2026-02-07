/**
 * API Configuration for Services Portal
 * Handles local vs production environment detection
 *
 * Production Domains:
 * - Services UI: services.exyconn.com (port 4003)
 * - Services Server: exyconn-service-server.exyconn.com (port 4004)
 */

// Detect if running in production
const isProduction = (): boolean => {
  // Check if running on production domain
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    return (
      hostname === "services.exyconn.com" ||
      hostname.endsWith(".exyconn.com") ||
      hostname === "exyconn.com"
    );
  }
  // Check environment variable
  return import.meta.env.PROD || import.meta.env.MODE === "production";
};

// API Base URLs
const LOCAL_API_BASE = "http://localhost:4004/api";
const PRODUCTION_API_BASE = "https://exyconn-service-server.exyconn.com/api";

/**
 * Get the API base URL based on environment
 * Uses VITE_API_URL if set, otherwise auto-detects based on hostname
 */
export const getApiBaseUrl = (): string => {
  // Allow manual override via environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  return isProduction() ? PRODUCTION_API_BASE : LOCAL_API_BASE;
};

/**
 * API Base URL - computed once on module load
 * Re-exports for backward compatibility
 */
export const API_BASE = getApiBaseUrl();

/**
 * Common headers for API requests
 */
export const getHeaders = (apiKey?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers["x-api-key"] = apiKey;
    headers["X-API-Key"] = apiKey; // Some endpoints use capital letters
  }
  return headers;
};

/**
 * Check if we're in development mode
 */
export const isDevelopment = (): boolean => !isProduction();

/**
 * Environment info for debugging
 */
export const getEnvironmentInfo = () => ({
  isProduction: isProduction(),
  apiBase: API_BASE,
  hostname: typeof window !== "undefined" ? window.location.hostname : "server",
  mode: import.meta.env.MODE,
});

export default {
  API_BASE,
  getApiBaseUrl,
  getHeaders,
  isProduction,
  isDevelopment,
  getEnvironmentInfo,
};
