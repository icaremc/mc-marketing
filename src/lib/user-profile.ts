import { apiUrl } from "@/lib/api-backend"
import { authHeaders } from "@/lib/api-auth"
import { parseApiError } from "@/lib/api-errors"
import { parseAppRole, type AppRole } from "@/lib/auth-role"

export type MeProfile = {
  id: string
  name: string
  email?: string
  phone?: string
  role: AppRole
  raw: Record<string, unknown>
}

export async function fetchMeProfile(accessToken: string): Promise<MeProfile> {
  const response = await fetch(apiUrl("/api/v1/users/me"), {
    headers: authHeaders(accessToken),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(parseApiError(response.status, await response.text()))
  }

  const data = (await response.json()) as Record<string, unknown>
  const id = data.id?.toString() ?? ""
  const first = data.first_name?.toString().trim() ?? ""
  const last = data.last_name?.toString().trim() ?? ""
  const full = data.full_name?.toString().trim() ?? ""
  const username = data.username?.toString().trim() ?? ""
  const name =
    full ||
    [first, last].filter(Boolean).join(" ") ||
    username ||
    "User"

  const role =
    parseAppRole(data.role ?? data.roles ?? data.user_role) ?? "owner"

  return {
    id,
    name,
    email: data.email?.toString(),
    phone: data.phone_number?.toString() ?? data.phone?.toString(),
    role,
    raw: data,
  }
}

export async function fetchUserBranch(
  accessToken: string
): Promise<Record<string, unknown> | null> {
  const response = await fetch(apiUrl("/api/v1/users/me/branch"), {
    headers: authHeaders(accessToken),
    cache: "no-store",
  })
  if (!response.ok) return null
  const data = (await response.json()) as Record<string, unknown>
  return data
}
