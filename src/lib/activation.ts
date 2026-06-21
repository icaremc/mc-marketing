import { isUuid } from "@/lib/uuid"
import {
  listSubscriptionPlans,
  type SubscriptionPlan,
} from "@/lib/subscription"

export type { SubscriptionPlan as ActivationPlan }

export function formatEtb(amount: number): string {
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getPlanById(
  plans: SubscriptionPlan[],
  planId: string
): SubscriptionPlan | undefined {
  return plans.find((plan) => plan.id === planId)
}

export async function fetchActivationPlans(
  accessToken: string
): Promise<SubscriptionPlan[]> {
  return listSubscriptionPlans(accessToken)
}

export function parseActivationIds(
  userId: string,
  businessId: string | undefined
): { ok: true } | { ok: false; message: string } {
  if (!isUuid(userId)) {
    return { ok: false, message: "Invalid account link." }
  }
  if (!businessId) {
    return {
      ok: false,
      message: "Missing business. Open this page from the TinaVerify app.",
    }
  }
  if (!isUuid(businessId)) {
    return { ok: false, message: "Invalid business link." }
  }
  return { ok: true }
}

export function parseAccessToken(
  token: string | undefined
): { ok: true; token: string } | { ok: false; message: string } {
  const trimmed = token?.trim()
  if (!trimmed) {
    return {
      ok: false,
      message:
        "Sign in on the TinaVerify app, then open activation from the app again.",
    }
  }
  return { ok: true, token: trimmed }
}
