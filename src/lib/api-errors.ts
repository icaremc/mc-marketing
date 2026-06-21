export function parseApiError(status: number, raw: string): string {
  try {
    const decoded = JSON.parse(raw) as {
      detail?: string | Array<{ msg?: string }>
      message?: string
      error?: string
    }
    const detail = decoded.detail
    if (typeof detail === "string" && detail.trim()) return detail
    if (Array.isArray(detail) && detail.length > 0) {
      const lines = detail
        .map((item) => item.msg)
        .filter((msg): msg is string => typeof msg === "string")
      if (lines.length > 0) return lines.join(" ")
    }
    return decoded.message ?? decoded.error ?? `Request failed (${status})`
  } catch {
    return raw.trim() || `Request failed (${status})`
  }
}
