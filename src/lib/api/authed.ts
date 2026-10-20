import { backendFetch, sessionFromTokenOut, type TokenOut } from "@/lib/backend"
import {
  clearSessionCookies,
  getSessionTokens,
  setSessionCookies,
  type SessionTokens,
} from "@/lib/session"

export async function getValidSession(): Promise<SessionTokens | null> {
  const session = await getSessionTokens()
  if (!session) return null

  const now = Math.floor(Date.now() / 1000)
  if (session.expiresAt - now > 90) return session

  const refreshed = await backendFetch<TokenOut>("/auth/refresh", {
    method: "POST",
    json: { refresh_token: session.refreshToken },
  })
  if (!refreshed.ok || !refreshed.data.access_token) {
    await clearSessionCookies()
    return null
  }

  const next = sessionFromTokenOut(refreshed.data, session.role)
  await setSessionCookies(next)
  return next
}

export async function authedFetch<T = unknown>(
  path: string,
  init: {
    method?: string
    json?: unknown
    form?: Record<string, string>
    searchParams?: Record<string, string | undefined>
  } = {},
) {
  const session = await getValidSession()
  if (!session) {
    return {
      ok: false as const,
      status: 401,
      message: "Please sign in again.",
      data: null as unknown,
    }
  }
  return backendFetch<T>(path, { ...init, token: session.accessToken })
}
