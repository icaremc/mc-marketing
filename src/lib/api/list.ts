import { asRecord, rowsFrom } from "@/lib/api/parse"

/** Prefer bare `data: []` arrays used by pregnancies/children APIs. */
export function listFromBody(
  body: unknown,
  key?: string,
): Record<string, unknown>[] {
  const root = asRecord(body)
  if (!root) {
    if (Array.isArray(body)) {
      return body.filter(
        (row): row is Record<string, unknown> =>
          !!row && typeof row === "object" && !Array.isArray(row),
      )
    }
    return []
  }
  if (Array.isArray(root.data)) {
    return root.data.filter(
      (row): row is Record<string, unknown> =>
        !!row && typeof row === "object" && !Array.isArray(row),
    )
  }
  if (key) return rowsFrom(body, key)
  return rowsFrom(body, "items")
}

export function str(row: Record<string, unknown>, key: string, fallback = "") {
  const value = row[key]
  if (value == null) return fallback
  return String(value)
}

export function num(row: Record<string, unknown>, key: string) {
  const value = row[key]
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}
