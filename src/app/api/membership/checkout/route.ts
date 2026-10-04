import { NextResponse } from "next/server"

import { backendFetch } from "@/lib/backend"
import {
  authMe,
  bearerToken,
  checkoutTotal,
  fetchChapaConfig,
  fetchMembershipPlan,
  isUuid,
} from "@/lib/membership"

export const maxDuration = 30

type InitiateOut = {
  ok?: boolean
  tx_ref: string
  checkout_url?: string | null
}

export async function POST(request: Request) {
  const token = bearerToken(request)
  if (!token) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 })
  }

  let body: { userId?: string }
  try {
    body = (await request.json()) as { userId?: string }
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const userId = body.userId?.trim() ?? ""
  if (!isUuid(userId)) {
    return NextResponse.json({ error: "Invalid user id." }, { status: 400 })
  }

  const me = await authMe(token)
  if (!me || me.id !== userId) {
    return NextResponse.json({ error: "Session does not match account." }, { status: 403 })
  }

  const plan = await fetchMembershipPlan()
  if (!plan.enabled || plan.yearlyPrice <= 0) {
    return NextResponse.json({ error: "Membership is not available." }, { status: 400 })
  }

  const chapa = await fetchChapaConfig()
  if (!chapa || !chapa.enable || !chapa.isActive) {
    return NextResponse.json(
      {
        error:
          "Online payment is not configured in admin app settings (payment / Chapa).",
      },
      { status: 503 },
    )
  }

  const amount = checkoutTotal(plan.yearlyPrice, chapa.feePercent)
  const origin = new URL(request.url).origin
  const returnUrl = `${origin}/activate/success?user_id=${encodeURIComponent(userId)}`

  const result = await backendFetch<InitiateOut>("/payments/chapa/initiate", {
    method: "POST",
    token,
    json: {
      kind: "app_subscription",
      amount,
      currency: plan.currency || "ETB",
      return_url: returnUrl,
      email: "member@icaremchealth.com",
      first_name: "Member",
      last_name: "iCare",
    },
  })

  if (!result.ok || !result.data.tx_ref || !result.data.checkout_url) {
    return NextResponse.json(
      {
        error: !result.ok
          ? result.message
          : "Could not start payment. Try again in a moment.",
      },
      { status: result.status >= 400 ? result.status : 502 },
    )
  }

  return NextResponse.json({
    checkoutUrl: result.data.checkout_url,
    txRef: result.data.tx_ref,
    amount,
    currency: plan.currency,
  })
}
