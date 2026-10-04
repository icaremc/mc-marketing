const DEFAULT_API_BASE = "https://api.icaremchealth.com"

export function backendBaseUrl(): string {
  const raw =
    process.env.API_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
    DEFAULT_API_BASE
  return raw.replace(/\/+$/, "")
}

export function isBackendConfigured(): boolean {
  return Boolean(backendBaseUrl())
}

export type BackendError = {
  status: number
  message: string
  body: unknown
}

function readErrorMessage(body: unknown, status: number): string {
  if (!body || typeof body !== "object") return `Request failed (${status}).`
  const record = body as Record<string, unknown>
  if (typeof record.detail === "string" && record.detail.trim()) return record.detail.trim()
  if (Array.isArray(record.detail) && record.detail[0]) {
    const first = record.detail[0] as { msg?: unknown }
    if (typeof first.msg === "string") return first.msg
  }
  if (typeof record.error === "string" && record.error.trim()) return record.error.trim()
  if (typeof record.message === "string" && record.message.trim()) return record.message.trim()
  return `Request failed (${status}).`
}

export async function backendFetch<T = unknown>(
  path: string,
  init: {
    method?: string
    token?: string
    json?: unknown
    form?: Record<string, string>
    searchParams?: Record<string, string | undefined>
  } = {},
): Promise<{ ok: true; status: number; data: T } | { ok: false; status: number; message: string; data: unknown }> {
  const url = new URL(`${backendBaseUrl()}/api/v1${path.startsWith("/") ? path : `/${path}`}`)
  for (const [key, value] of Object.entries(init.searchParams ?? {})) {
    if (value != null && value !== "") url.searchParams.set(key, value)
  }

  const headers: Record<string, string> = { Accept: "application/json" }
  let body: string | undefined
  if (init.form) {
    headers["Content-Type"] = "application/x-www-form-urlencoded"
    body = new URLSearchParams(init.form).toString()
  } else if (init.json !== undefined) {
    headers["Content-Type"] = "application/json"
    body = JSON.stringify(init.json)
  }
  if (init.token) headers.Authorization = `Bearer ${init.token}`

  try {
    const response = await fetch(url, {
      method: init.method ?? (body ? "POST" : "GET"),
      headers,
      body,
      cache: "no-store",
    })
    const raw = await response.text()
    let data: unknown = null
    if (raw) {
      try {
        data = JSON.parse(raw) as unknown
      } catch {
        data = raw
      }
    }
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: readErrorMessage(data, response.status),
        data,
      }
    }
    return { ok: true, status: response.status, data: data as T }
  } catch {
    return {
      ok: false,
      status: 503,
      message: "Could not reach the API. Check your connection.",
      data: null,
    }
  }
}

export type TokenOut = {
  ok?: boolean
  access_token: string
  refresh_token: string
  user_id?: string
  role?: string | null
}

export function sessionFromTokenOut(tokens: TokenOut) {
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    // ponytail: TokenOut has no expires_at; cookie maxAge follows JWT access (~60m)
    expiresAt: Math.floor(Date.now() / 1000) + 60 * 60,
  }
}
