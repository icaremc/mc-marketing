import { siteConfig } from "@/lib/brand"
import { backendFetch } from "@/lib/backend"
import {
  checkoutTotal,
  fetchProductionChapaConfig,
  fetchSubscriptionPlanSettings,
  gatewayFee,
  type ResolvedChapaConfig,
  type SubscriptionPlanSettings,
} from "@/lib/app-settings"

export const ACTIVATION_TOKEN_KEY = "icare_mc_activation_token"

export {
  checkoutTotal,
  gatewayFee,
  type ResolvedChapaConfig,
  type SubscriptionPlanSettings,
}

export function appLoginDeepLink(): string {
  return siteConfig.appLoginDeepLink
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim(),
  )
}

export function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization")?.trim() ?? ""
  if (!header.toLowerCase().startsWith("bearer ")) return null
  const token = header.slice(7).trim()
  return token.length > 20 ? token : null
}

export async function authMe(
  accessToken: string,
): Promise<{ id: string } | null> {
  const result = await backendFetch<{ id: string }>("/auth/me", {
    token: accessToken,
  })
  if (!result.ok || !result.data?.id) return null
  return { id: result.data.id }
}

export type MembershipPlan = {
  enabled: boolean
  yearlyPrice: number
  currency: string
  durationDays: number
  feePercent: number
  source: {
    plan: "app_settings" | "defaults"
    chapa: "app_settings" | "env" | "none"
  }
}

export async function fetchMembershipPlan(): Promise<MembershipPlan> {
  const [plan, chapa] = await Promise.all([
    fetchSubscriptionPlanSettings(),
    fetchProductionChapaConfig(),
  ])

  return {
    enabled: plan.enabled,
    yearlyPrice: plan.yearlyPrice,
    currency: plan.currency,
    durationDays: plan.durationDays,
    feePercent: chapa?.feePercent ?? 3.5,
    source: {
      plan: plan.source,
      chapa: chapa?.source ?? "none",
    },
  }
}

export async function fetchChapaConfig(): Promise<ResolvedChapaConfig | null> {
  return fetchProductionChapaConfig()
}
