import { apiUrl } from "@/lib/api-backend"

export type SubscriptionPlan = {
  id: string
  name: string
  code?: string
  price: number
  durationDays: number
  monthlyTransactionLimit?: number
}

function parseApiError(status: number, raw: string): string {
  try {
    const decoded = JSON.parse(raw) as {
      detail?: string | Array<{ msg?: string }>
      message?: string
      error?: string
    }
    const detail = decoded.detail
    if (typeof detail === "string") return detail
    if (Array.isArray(detail) && detail.length > 0) {
      const lines = detail
        .map((item) => item.msg)
        .filter((msg): msg is string => typeof msg === "string")
      if (lines.length > 0) return lines.join(" ")
    }
    return decoded.message ?? decoded.error ?? `Request failed (${status})`
  } catch {
    return raw.trim() || `Request failed (${status})`
  }
}

async function apiFetch(
  token: string,
  path: string,
  init?: RequestInit
): Promise<Response> {
  return fetch(apiUrl(path), {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
    cache: "no-store",
  })
}

function mapPlan(raw: Record<string, unknown>): SubscriptionPlan | null {
  const id = raw.id?.toString().trim()
  if (!id) return null
  if (raw.is_archived === true) return null

  const priceRaw = raw.price
  const price =
    typeof priceRaw === "number"
      ? priceRaw
      : Number.parseFloat(String(priceRaw ?? ""))
  if (!Number.isFinite(price) || price <= 0) return null

  const daysRaw = raw.duration_days
  const durationDays =
    typeof daysRaw === "number"
      ? daysRaw
      : Number.parseInt(String(daysRaw ?? "0"), 10) || 0

  const limitRaw = raw.monthly_transaction_limit
  const monthlyTransactionLimit =
    typeof limitRaw === "number"
      ? limitRaw
      : Number.parseInt(String(limitRaw ?? ""), 10) || undefined

  const name =
    raw.name?.toString().trim() ||
    raw.code?.toString().trim() ||
    id

  return {
    id,
    name,
    code: raw.code?.toString(),
    price,
    durationDays,
    monthlyTransactionLimit:
      monthlyTransactionLimit && monthlyTransactionLimit > 0
        ? monthlyTransactionLimit
        : undefined,
  }
}

export async function listSubscriptionPlans(
  token: string
): Promise<SubscriptionPlan[]> {
  const response = await apiFetch(
    token,
    "/api/v1/subscription-plan?include_archived=false"
  )

  if (!response.ok) {
    throw new Error(parseApiError(response.status, await response.text()))
  }

  const data = (await response.json()) as unknown
  const list = Array.isArray(data) ? data : []
  return list
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map(mapPlan)
    .filter((plan): plan is SubscriptionPlan => plan !== null)
    .sort((a, b) => a.price - b.price)
}

export async function getCreditsPerEtb(token: string): Promise<number | null> {
  const response = await apiFetch(token, "/api/v1/subscriptions/exchange-rate")

  if (!response.ok) {
    return null
  }

  const data = (await response.json()) as {
    credits_per_etb?: number
    creditsPerEtb?: number
  }
  const rate = data.credits_per_etb ?? data.creditsPerEtb
  if (typeof rate === "number" && rate > 0) return rate
  return null
}

export async function paySubscriptionCheckout(
  token: string,
  businessId: string,
  planId: string
): Promise<{ checkoutUrl: string; txRef?: string }> {
  const url = `/api/v1/subscriptions/checkout?business_id=${encodeURIComponent(businessId)}`
  const response = await apiFetch(token, url, {
    method: "POST",
    body: JSON.stringify({ plan_id: planId }),
  })

  if (!response.ok) {
    throw new Error(parseApiError(response.status, await response.text()))
  }

  const data = (await response.json()) as {
    checkout_url?: string
    checkoutUrl?: string
    tx_ref?: string
    txRef?: string
  }

  const checkoutUrl = data.checkout_url ?? data.checkoutUrl
  if (!checkoutUrl) {
    throw new Error("Could not start checkout.")
  }

  return {
    checkoutUrl,
    txRef: data.tx_ref ?? data.txRef,
  }
}

export async function payCustomSubscriptionCheckout(
  token: string,
  businessId: string,
  amount: number,
  credits: number
): Promise<{ checkoutUrl: string; txRef?: string }> {
  const url = `/api/v1/subscriptions/checkout/custom?business_id=${encodeURIComponent(businessId)}`
  const response = await apiFetch(token, url, {
    method: "POST",
    body: JSON.stringify({ amount, credits }),
  })

  if (!response.ok) {
    throw new Error(parseApiError(response.status, await response.text()))
  }

  const data = (await response.json()) as {
    checkout_url?: string
    checkoutUrl?: string
    tx_ref?: string
    txRef?: string
  }

  const checkoutUrl = data.checkout_url ?? data.checkoutUrl
  if (!checkoutUrl) {
    throw new Error("Could not start checkout.")
  }

  return {
    checkoutUrl,
    txRef: data.tx_ref ?? data.txRef,
  }
}

export async function verifyChapaPayment(
  token: string,
  txRef: string
): Promise<Record<string, unknown>> {
  const response = await apiFetch(
    token,
    `/api/v1/payments/chapa/verify/${encodeURIComponent(txRef)}`
  )

  if (!response.ok) {
    throw new Error(parseApiError(response.status, await response.text()))
  }

  const data = (await response.json()) as Record<string, unknown>
  return data
}

export function planTitle(plan: SubscriptionPlan): string {
  return plan.name || plan.code || plan.id
}

export function planSubtitle(plan: SubscriptionPlan): string {
  const price = formatPlanPrice(plan.price)
  if (plan.durationDays <= 0) return `${price} ETB`
  return `${price} ETB · ${plan.durationDays} days`
}

export function planCaption(plan: SubscriptionPlan): string | null {
  if (plan.monthlyTransactionLimit && plan.monthlyTransactionLimit > 0) {
    return `${plan.monthlyTransactionLimit.toLocaleString()} verification credits`
  }
  return plan.durationDays > 0 ? `${plan.durationDays}-day validity` : null
}

export function formatPlanPrice(price: number): string {
  if (price === Math.round(price)) return price.toLocaleString()
  return price.toFixed(2)
}
