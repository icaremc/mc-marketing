import { NextResponse } from "next/server"

import { backendFetch } from "@/lib/backend"
import { siteConfig } from "@/lib/brand"
import { getSessionTokens } from "@/lib/session"
import {
  checkoutTotal,
  fetchChapaSettings,
  fetchMembershipSettings,
} from "@/lib/subscription-settings"

type InitiateOut = {
  ok?: boolean
  tx_ref: string
  checkout_url?: string | null
  dev?: boolean | null
}

export async function POST() {
  const session = await getSessionTokens()
  if (!session) {
    return NextResponse.json({ error: "Please register or sign in first." }, { status: 401 })
  }

  const plan = await fetchMembershipSettings()
  if (!plan.enabled) {
    return NextResponse.json({ error: "Subscriptions are not available right now." }, { status: 400 })
  }

  const chapa = await fetchChapaSettings()
  const feePercent = chapa?.feePercent ?? 2.5
  if (chapa && (!chapa.enable || !chapa.isActive)) {
    return NextResponse.json(
      { error: "Payment is not configured. Try again later or use the mobile app." },
      { status: 503 },
    )
  }

  const amount = checkoutTotal(plan.yearlyPrice, feePercent)
  const returnUrl = `${siteConfig.siteUrl}/subscribe/callback`

  const result = await backendFetch<InitiateOut>("/payments/chapa/initiate", {
    method: "POST",
    token: session.accessToken,
    json: {
      kind: "app_subscription",
      amount,
      currency: plan.currency,
      return_url: returnUrl,
      email: "member@icaremchealth.com",
      first_name: "Member",
      last_name: "iCare",
    },
  })

  if (!result.ok || !result.data.tx_ref) {
    return NextResponse.json(
      { error: !result.ok ? result.message : "Could not start checkout." },
      { status: result.status >= 400 ? result.status : 400 },
    )
  }

  if (!result.data.checkout_url) {
    // Dev/staging may return tx_ref without a Chapa URL when secret is unset.
    return NextResponse.json(
      {
        error:
          "Payment checkout is not available right now. Try again later or use the mobile app.",
      },
      { status: 503 },
    )
  }

  return NextResponse.json({
    ok: true,
    checkoutUrl: result.data.checkout_url,
    txRef: result.data.tx_ref,
    amount,
    currency: plan.currency,
  })
}
