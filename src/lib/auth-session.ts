import type { AppRole } from "@/lib/auth-role"
import type { UserBusiness } from "@/lib/auth-login"

export const SESSION_ACCESS_TOKEN_KEY = "icaremc_access_token"
export const SESSION_REFRESH_TOKEN_KEY = "icaremc_refresh_token"
export const SESSION_USER_ID_KEY = "icaremc_user_id"
export const SESSION_BUSINESS_ID_KEY = "icaremc_business_id"
export const SESSION_ROLE_KEY = "icaremc_role"
export const SESSION_USER_JSON_KEY = "icaremc_user"
export const SESSION_BUSINESSES_KEY = "icaremc_businesses"

/** Legacy activation key — kept in sync on login. */
export const ACTIVATION_TOKEN_STORAGE_KEY = "icaremc_activation_token"

export type SessionUser = {
  id: string
  name: string
  email?: string
  phone?: string
  role: AppRole
}

export type AuthSession = {
  accessToken: string
  refreshToken?: string
  userId: string
  businessId: string
  role: AppRole
  user: SessionUser
  businesses: UserBusiness[]
}

export function saveAuthSession(session: AuthSession): void {
  if (typeof window === "undefined") return
  sessionStorage.setItem(SESSION_ACCESS_TOKEN_KEY, session.accessToken)
  if (session.refreshToken) {
    sessionStorage.setItem(SESSION_REFRESH_TOKEN_KEY, session.refreshToken)
  }
  sessionStorage.setItem(SESSION_USER_ID_KEY, session.userId)
  sessionStorage.setItem(SESSION_BUSINESS_ID_KEY, session.businessId)
  sessionStorage.setItem(SESSION_ROLE_KEY, session.role)
  sessionStorage.setItem(SESSION_USER_JSON_KEY, JSON.stringify(session.user))
  sessionStorage.setItem(
    SESSION_BUSINESSES_KEY,
    JSON.stringify(session.businesses)
  )
  sessionStorage.setItem(ACTIVATION_TOKEN_STORAGE_KEY, session.accessToken)
}

export function readAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null

  const accessToken = sessionStorage.getItem(SESSION_ACCESS_TOKEN_KEY)
  const userId = sessionStorage.getItem(SESSION_USER_ID_KEY)
  const businessId = sessionStorage.getItem(SESSION_BUSINESS_ID_KEY)
  const role = sessionStorage.getItem(SESSION_ROLE_KEY) as AppRole | null
  const userJson = sessionStorage.getItem(SESSION_USER_JSON_KEY)

  if (!accessToken || !userId || !businessId || !role || !userJson) {
    return null
  }

  try {
    const user = JSON.parse(userJson) as SessionUser
    const businessesRaw = sessionStorage.getItem(SESSION_BUSINESSES_KEY)
    const businesses = businessesRaw
      ? (JSON.parse(businessesRaw) as UserBusiness[])
      : []

    return {
      accessToken,
      refreshToken:
        sessionStorage.getItem(SESSION_REFRESH_TOKEN_KEY) ?? undefined,
      userId,
      businessId,
      role,
      user,
      businesses,
    }
  } catch {
    return null
  }
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(SESSION_ACCESS_TOKEN_KEY)
  sessionStorage.removeItem(SESSION_REFRESH_TOKEN_KEY)
  sessionStorage.removeItem(SESSION_USER_ID_KEY)
  sessionStorage.removeItem(SESSION_BUSINESS_ID_KEY)
  sessionStorage.removeItem(SESSION_ROLE_KEY)
  sessionStorage.removeItem(SESSION_USER_JSON_KEY)
  sessionStorage.removeItem(SESSION_BUSINESSES_KEY)
  sessionStorage.removeItem(ACTIVATION_TOKEN_STORAGE_KEY)
}

export function setActiveBusinessId(businessId: string): void {
  if (typeof window === "undefined") return
  sessionStorage.setItem(SESSION_BUSINESS_ID_KEY, businessId)
}
