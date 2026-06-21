/** Remove payment / auth query params from the browser URL after handling. */
export function stripHandledQueryParams(
  keys: string[] = ["trx_ref", "tx_ref", "reference", "token", "access_token"]
): void {
  if (typeof window === "undefined") return
  const url = new URL(window.location.href)
  let changed = false
  for (const key of keys) {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key)
      changed = true
    }
  }
  if (!changed) return
  const next =
    url.pathname +
    (url.searchParams.toString() ? `?${url.searchParams}` : "") +
    url.hash
  window.history.replaceState({}, "", next)
}
