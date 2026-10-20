/** Extract list payloads the same way Flutter RestClient helpers do. */
export function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

export function rowsFrom(
  body: unknown,
  key: string,
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

  const candidates: unknown[] = [
    root[key],
    root.data,
    root.results,
    root.items,
    root.appointments,
    root.doctors,
    root.categories,
    root.services,
  ]

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter(
        (row): row is Record<string, unknown> =>
          !!row && typeof row === "object" && !Array.isArray(row),
      )
    }
    const nested = asRecord(candidate)
    if (nested) {
      for (const innerKey of ["items", "results", "data", key]) {
        const inner = nested[innerKey]
        if (Array.isArray(inner)) {
          return inner.filter(
            (row): row is Record<string, unknown> =>
              !!row && typeof row === "object" && !Array.isArray(row),
          )
        }
      }
    }
  }

  return []
}

export function objectFrom(
  body: unknown,
  key?: string,
): Record<string, unknown> | null {
  const root = asRecord(body)
  if (!root) return null
  if (key) {
    const nested = asRecord(root[key])
    if (nested) return nested
    const data = asRecord(root.data)
    if (data) {
      const deeper = asRecord(data[key])
      if (deeper) return deeper
      return data
    }
  }
  return root
}
