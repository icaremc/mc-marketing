import { apiUrl } from "@/lib/api-backend"
import { authHeaders } from "@/lib/api-auth"

export function isSubscriptionActive(data: Record<string, unknown>): boolean {
  let record = data
  const nested = data.data
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    record = nested as Record<string, unknown>
  } else {
    const sub = data.subscription
    if (sub && typeof sub === "object" && !Array.isArray(sub)) {
      record = sub as Record<string, unknown>
    }
  }

  const status = record.status
  if (typeof status !== "string") return false
  return status.toLowerCase().trim() === "active"
}

export async function fetchCurrentSubscription(
  accessToken: string,
  businessId: string
): Promise<Record<string, unknown> | null> {
  const url = `${apiUrl("/api/v1/subscriptions/me")}?business_id=${encodeURIComponent(businessId)}`

  const response = await fetch(url, {
    headers: authHeaders(accessToken),
    cache: "no-store",
  })

  if (response.status === 404) return null
  if (!response.ok) return null

  const data = (await response.json()) as Record<string, unknown>
  return data
}

export async function hasActiveSubscription(
  accessToken: string,
  businessId: string
): Promise<boolean> {
  const current = await fetchCurrentSubscription(accessToken, businessId)
  if (!current) return false
  return isSubscriptionActive(current)
}
