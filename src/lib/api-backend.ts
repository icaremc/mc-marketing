/** Same hosts as the TinaVerify Flutter app (`AppEnvironment` / `.env.staging`). */
const DEFAULT_API_BASE_URL =
  "https://zuludine-backend-staging-562272610794.europe-west3.run.app"

export const PRODUCTION_API_BASE_URL =
  "https://zuludine-backend-prod-562272610794.europe-west3.run.app"

export function getApiBaseUrl(): string {
  const fromEnv = process.env.TINA_VERIFY_API_URL?.trim()
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "")
  }
  const legacy = process.env.API_BASE_URL?.trim()
  if (legacy) {
    return legacy.replace(/\/$/, "")
  }
  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_API_BASE_URL
  }
  return DEFAULT_API_BASE_URL
}

export function apiUrl(path: string): string {
  const base = getApiBaseUrl()
  return `${base}${path.startsWith("/") ? path : `/${path}`}`
}
