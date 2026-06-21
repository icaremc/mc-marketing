/** Mirrors Flutter `BusinessApiService._parseBusinessListPayload`. */
export function parseBusinessListPayload(
  decoded: unknown
): Array<Record<string, unknown>> {
  if (Array.isArray(decoded)) {
    return decoded.filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null && !Array.isArray(item)
    )
  }

  if (decoded && typeof decoded === "object" && !Array.isArray(decoded)) {
    const record = decoded as Record<string, unknown>
    for (const key of ["items", "data", "businesses", "results", "content", "value"]) {
      const value = record[key]
      if (Array.isArray(value)) {
        return value.filter(
          (item): item is Record<string, unknown> =>
            typeof item === "object" && item !== null && !Array.isArray(item)
        )
      }
    }
    const id = record.id
    const name = record.name
    if (typeof id === "string" && id.length > 0 && name != null) {
      return [record]
    }
  }

  return []
}
