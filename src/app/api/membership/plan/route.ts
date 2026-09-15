import { NextResponse } from "next/server"

import { checkoutTotal, fetchMembershipPlan, gatewayFee } from "@/lib/membership"

export async function GET() {
  const plan = await fetchMembershipPlan()
  const feeAmount = gatewayFee(plan.yearlyPrice, plan.feePercent)
  const total = checkoutTotal(plan.yearlyPrice, plan.feePercent)

  return NextResponse.json({
    ...plan,
    feeAmount,
    total,
  })
}
