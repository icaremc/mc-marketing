import { NextResponse } from "next/server"

import { checkoutTotal, fetchMembershipPlan, gatewayFee } from "@/lib/membership"
import { isBackendConfigured } from "@/lib/backend"

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
    backendConfigured: isBackendConfigured(),
    paymentConfigured: plan.source.chapa !== "none",
  })
}
