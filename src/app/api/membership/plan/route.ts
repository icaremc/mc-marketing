import { NextResponse } from "next/server"

import { checkoutTotal, fetchMembershipPlan, gatewayFee } from "@/lib/membership"
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase"

export async function GET() {
  const plan = await fetchMembershipPlan()
  const feeAmount = gatewayFee(plan.yearlyPrice, plan.feePercent)
  const total = checkoutTotal(plan.yearlyPrice, plan.feePercent)

  return NextResponse.json({
    enabled: plan.enabled,
    yearlyPrice: plan.yearlyPrice,
    currency: plan.currency,
    durationDays: plan.durationDays,
    feePercent: plan.feePercent,
    feeAmount,
    total,
    source: plan.source,
    // Ops hints only — never expose secret keys.
    supabaseConfigured: isSupabaseConfigured(),
    serviceRoleConfigured: Boolean(getServiceSupabase()),
    paymentConfigured: plan.source.chapa !== "none",
  })
}
