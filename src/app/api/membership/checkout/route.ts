import { NextResponse } from "next/server"

import {
  bearerToken,
  checkoutTotal,
  fetchChapaConfig,
  fetchMembershipPlan,
  isUuid,
  supabaseWithToken,
} from "@/lib/membership"
import { siteConfig } from "@/lib/brand"

export const maxDuration = 30

function makeTxRef(): string {
  const rand = Math.random().toString(36).slice(2, 10)
  return `icare-year-${Date.now()}-${rand}`
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

  const supabase = supabaseWithToken(token)
  if (!supabase) {
    return NextResponse.json({ error: "Service unavailable." }, { status: 503 })
  }

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user || userData.user.id !== userId) {
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

  // Charge plan + gateway fee using admin feePercent from app_settings.
  const amount = checkoutTotal(plan.yearlyPrice, chapa.feePercent)
  const txRef = makeTxRef()
  const origin = new URL(request.url).origin
  const returnUrl = `${origin}/activate/success?tx_ref=${encodeURIComponent(txRef)}&user_id=${encodeURIComponent(userId)}`
  const callbackUrl = `${origin}/api/membership/verify`

  const meta = userData.user.user_metadata ?? {}
  const fullName = String(meta.full_name ?? meta.name ?? "Patient").trim()
  const parts = fullName.split(/\s+/).filter(Boolean)
  const firstName = parts[0] ?? "Patient"
  const lastName = parts.slice(1).join(" ") || "User"
  const email =
    userData.user.email?.trim() ||
    `${userId.replace(/-/g, "").slice(0, 12)}@icare.app`
  const phone = String(meta.phone ?? userData.user.phone ?? "").replace(/\D/g, "")

  const response = await fetch("https://api.chapa.co/v1/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${chapa.secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amount.toFixed(2),
      currency: plan.currency || "ETB",
      email,
      first_name: firstName,
      last_name: lastName,
      phone_number: phone || undefined,
      tx_ref: txRef,
      callback_url: callbackUrl,
      return_url: returnUrl,
      customization: {
        title: "ICare MC",
        description: "Yearly membership",
      },
      meta: {
        kind: "app_subscription",
        user_id: userId,
        plan_amount: plan.yearlyPrice,
        app: siteConfig.shortName,
      },
    }),
  })

  const payload = (await response.json().catch(() => null)) as {
    status?: string
    message?: string
    data?: { checkout_url?: string }
  } | null

  if (
    !response.ok ||
    payload?.status !== "success" ||
    !payload.data?.checkout_url
  ) {
    return NextResponse.json(
      {
        error:
          payload?.message ||
          "Could not start payment. Try again in a moment.",
      },
      { status: 502 },
    )
  }

  return NextResponse.json({
    checkoutUrl: payload.data.checkout_url,
    txRef,
    amount,
    currency: plan.currency,
  })
}
