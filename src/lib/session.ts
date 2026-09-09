import { cookies } from "next/headers"

const ACCESS = "mc_access_token"
const REFRESH = "mc_refresh_token"
const EXPIRES = "mc_expires_at"

export type SessionTokens = {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export async function setSessionCookies(session: SessionTokens) {
  const jar = await cookies()
  const maxAge = Math.max(60, session.expiresAt - Math.floor(Date.now() / 1000))
  const common = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  }
  jar.set(ACCESS, session.accessToken, common)
  jar.set(REFRESH, session.refreshToken, common)
  jar.set(EXPIRES, String(session.expiresAt), common)
}

export async function clearSessionCookies() {
  const jar = await cookies()
  jar.delete(ACCESS)
  jar.delete(REFRESH)
  jar.delete(EXPIRES)
}

export async function getSessionTokens(): Promise<SessionTokens | null> {
  const jar = await cookies()
  const accessToken = jar.get(ACCESS)?.value
  const refreshToken = jar.get(REFRESH)?.value
  const expiresAt = Number(jar.get(EXPIRES)?.value ?? 0)
  if (!accessToken || !refreshToken) return null
  return { accessToken, refreshToken, expiresAt }
}
