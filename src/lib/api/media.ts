import { backendBaseUrl } from "@/lib/backend"

/** Mirrors Flutter BackendConfig.resolveMediaUrl */
export function resolveMediaUrl(url: string | null | undefined): string {
  const raw = url?.trim() ?? ""
  if (!raw) return ""
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw
  const base = backendBaseUrl()
  if (raw.startsWith("/")) return `${base}${raw}`
  return `${base}/${raw}`
}
