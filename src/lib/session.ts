import { cookies } from "next/headers"

import {
  normalizeRoles,
  pickActiveRole,
  type AppRole,
} from "@/lib/auth/roles"

const ACCESS = "mc_access_token"
const REFRESH = "mc_refresh_token"
const EXPIRES = "mc_expires_at"
const ROLE = "mc_role"
const ROLES = "mc_roles"
const USER_ID = "mc_user_id"

export type SessionTokens = {
  accessToken: string
  refreshToken: string
  expiresAt: number
  role?: AppRole | null
  roles?: AppRole[]
  userId?: string | null
}

function cookieCommon(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  }
}

export async function setSessionCookies(session: SessionTokens) {
  const jar = await cookies()
  const maxAge = Math.max(60, session.expiresAt - Math.floor(Date.now() / 1000))
  const common = cookieCommon(maxAge)

  jar.set(ACCESS, session.accessToken, common)
  jar.set(REFRESH, session.refreshToken, common)
  jar.set(EXPIRES, String(session.expiresAt), common)

  const roles =
    session.roles ??
    normalizeRoles({ role: session.role ?? null, roles: null })
  const active = pickActiveRole(roles, session.role ?? null)

  if (active) jar.set(ROLE, active, common)
  else jar.delete(ROLE)

  if (roles.length) jar.set(ROLES, JSON.stringify(roles), common)
  else jar.delete(ROLES)

  if (session.userId) jar.set(USER_ID, session.userId, common)
  else jar.delete(USER_ID)
}

export async function clearSessionCookies() {
  const jar = await cookies()
  jar.delete(ACCESS)
  jar.delete(REFRESH)
  jar.delete(EXPIRES)
  jar.delete(ROLE)
  jar.delete(ROLES)
  jar.delete(USER_ID)
}

export async function getSessionTokens(): Promise<SessionTokens | null> {
  const jar = await cookies()
  const accessToken = jar.get(ACCESS)?.value
  const refreshToken = jar.get(REFRESH)?.value
  const expiresAt = Number(jar.get(EXPIRES)?.value ?? 0)
  if (!accessToken || !refreshToken) return null

  let roles: AppRole[] = []
  try {
    const raw = jar.get(ROLES)?.value
    if (raw) roles = JSON.parse(raw) as AppRole[]
  } catch {
    roles = []
  }

  const roleCookie = jar.get(ROLE)?.value
  const role =
    roleCookie === "patient" || roleCookie === "doctor"
      ? roleCookie
      : pickActiveRole(roles)

  return {
    accessToken,
    refreshToken,
    expiresAt,
    role,
    roles,
    userId: jar.get(USER_ID)?.value ?? null,
  }
}

/** Edge-safe cookie names for middleware (no next/headers). */
export const sessionCookieNames = {
  access: ACCESS,
  refresh: REFRESH,
  expires: EXPIRES,
  role: ROLE,
  roles: ROLES,
  userId: USER_ID,
} as const
