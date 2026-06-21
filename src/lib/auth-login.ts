import { apiUrl, getApiBaseUrl } from "@/lib/api-backend"
import { authHeaders } from "@/lib/api-auth"
import { parseApiError } from "@/lib/api-errors"
import { ApiRequestError } from "@/lib/api-request-error"
import type { AppRole } from "@/lib/auth-role"
import { parseAppRole } from "@/lib/auth-role"
import { normalizeEthiopianPhone } from "@/lib/phone-utils"
import { parseBusinessListPayload } from "@/lib/parse-business-list"
import { fetchMeProfile } from "@/lib/user-profile"

export type UserBusiness = {
  id: string
  name: string
}

export type LoginResult = {
  accessToken: string
  refreshToken?: string
  userId: string
  businessId: string | null
  businesses: UserBusiness[]
  role: AppRole
  userName: string
}

type BusinessRow = {
  id?: string
  name?: string
  is_archived?: boolean
}

function profileFromLoginUser(user: Record<string, unknown>): {
  userName: string
  role: AppRole
} {
  const info = user.user_information
  let first = ""
  let last = ""
  if (info && typeof info === "object" && !Array.isArray(info)) {
    const record = info as Record<string, unknown>
    first = record.first_name?.toString().trim() ?? ""
    last = record.last_name?.toString().trim() ?? ""
  }
  const combined = `${first} ${last}`.trim()
  const userName =
    combined ||
    user.username?.toString().trim() ||
    user.full_name?.toString().trim() ||
    "User"

  return {
    userName,
    role: parseAppRole(user.role ?? user.roles ?? user.user_role) ?? "owner",
  }
}

export async function loginUser(
  phoneOrUsername: string,
  password: string
): Promise<LoginResult> {
  const username = normalizeEthiopianPhone(phoneOrUsername.trim())
  const body = new URLSearchParams({
    grant_type: "password",
    username,
    password: password.trim(),
  })

  const response = await fetch(apiUrl("/api/v1/users/login"), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    cache: "no-store",
  })

  if (!response.ok) {
    const message = parseApiError(response.status, await response.text())
    throw new ApiRequestError(message, response.status)
  }

  const data = (await response.json()) as {
    access_token?: string
    refresh_token?: string
    user?: Record<string, unknown>
  }

  const accessToken = data.access_token
  const userMap = data.user
  const userId = userMap?.id?.toString()
  if (!accessToken || !userId) {
    throw new Error("Invalid response from server.")
  }

  const fromLogin = userMap ? profileFromLoginUser(userMap) : null

  let businesses = await fetchUserBusinesses(accessToken)
  let role = fromLogin?.role ?? "owner"
  let userName = fromLogin?.userName ?? "User"

  try {
    const profile = await fetchMeProfile(accessToken)
    if (profile.name.trim()) userName = profile.name
    role = profile.role
  } catch (profileError) {
    console.warn(
      "[auth/login] profile fetch failed, using login payload:",
      profileError
    )
  }

  const businessId = pickPrimaryBusinessId(businesses)

  return {
    accessToken,
    refreshToken: data.refresh_token,
    userId,
    businessId,
    businesses,
    role,
    userName,
  }
}

export async function fetchUserBusinesses(
  accessToken: string
): Promise<UserBusiness[]> {
  const response = await fetch(apiUrl("/api/v1/users/me/business"), {
    headers: authHeaders(accessToken),
    cache: "no-store",
  })

  if (!response.ok) {
    console.warn(
      `[auth/login] GET /users/me/business failed (${response.status}) api=${getApiBaseUrl()}`
    )
    return []
  }

  let decoded: unknown
  try {
    decoded = await response.json()
  } catch {
    return []
  }

  const rows = parseBusinessListPayload(decoded) as BusinessRow[]

  return rows
    .filter((b) => b.id && b.is_archived !== true)
    .map((b) => ({
      id: b.id!,
      name: b.name?.trim() || "My Business",
    }))
}

export function pickPrimaryBusinessId(
  businesses: UserBusiness[],
  preferredId?: string
): string | null {
  if (preferredId && businesses.some((b) => b.id === preferredId)) {
    return preferredId
  }
  return businesses[0]?.id ?? null
}

export async function forgotPassword(phoneNumber: string): Promise<string> {
  const phone = normalizeEthiopianPhone(phoneNumber.trim())
  const response = await fetch(apiUrl("/api/v1/users/forgot-password"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ phone_number: phone }),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(parseApiError(response.status, await response.text()))
  }

  const raw = (await response.text()).trim()
  if (!raw) {
    return "If an account exists for this number, check your phone for next steps."
  }

  try {
    const decoded = JSON.parse(raw) as string | { message?: string }
    if (typeof decoded === "string" && decoded.trim()) return decoded
    if (typeof decoded === "object" && decoded.message?.trim()) {
      return decoded.message
    }
  } catch {
    // plain text body
  }

  return raw
}
