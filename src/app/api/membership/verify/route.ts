import { NextResponse } from "next/server"

import {
  bearerToken,
  fetchChapaConfig,
  fetchMembershipPlan,
  isUuid,
  supabaseWithToken,
} from "@/lib/membership"

export const maxDuration = 30

async function verifyChapa(txRef: string, secretKey: string): Promise<{
  ok: boolean
  amountPaid: number
}> {
  const response = await fetch(
    `https://api.chapa.co/v1/transaction/verify/${encodeURIComponent(txRef)}`,
    {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
    },
  )
  if (!response.ok) return { ok: false, amountPaid: 0 }
  const payload = (await response.json()) as {
    status?: string
    data?: { status?: string; amount?: number | string }
  }
  if (payload.status !== "success" || payload.data?.status !== "success") {
    return { ok: false, amountPaid: 0 }
  }
  const raw = payload.data.amount
  const amountPaid =
    typeof raw === "number" ? raw : Number.parseFloat(String(raw ?? "")) || 0
  return { ok: true, amountPaid }
}

export async function POST(request: Request) {
  const token = bearerToken(request)
  if (!token) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 })
  }

  let body: { userId?: string; txRef?: string }
  try {
    body = (await request.json()) as { userId?: string; txRef?: string }
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const userId = body.userId?.trim() ?? ""
  const txRef = body.txRef?.trim() ?? ""
  if (!isUuid(userId) || txRef.length < 8) {
    return NextResponse.json({ error: "Invalid payment details." }, { status: 400 })
  }

  const supabase = supabaseWithToken(token)
  if (!supabase) {
    return NextResponse.json({ error: "Service unavailable." }, { status: 503 })
  }

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user || userData.user.id !== userId) {
    return NextResponse.json({ error: "Session does not match account." }, { status: 403 })
  }

  const chapa = await fetchChapaConfig()
  if (!chapa) {
    return NextResponse.json({ error: "Payment not configured." }, { status: 503 })
  }

  const verified = await verifyChapa(txRef, chapa.secretKey)
  if (!verified.ok) {
    return NextResponse.json(
      { error: "Payment not completed yet. Wait a moment and try again." },
      { status: 402 },
    )
  }

  const plan = await fetchMembershipPlan()
  // RPC requires at least the yearly plan amount (gateway fee may be included).
  const amountForRpc = Math.max(verified.amountPaid, plan.yearlyPrice)

  const { data, error } = await supabase.rpc("activate_app_subscription", {
    p_tx_ref: txRef,
    p_amount_paid: amountForRpc,
    p_payment_method: "chapa",
  })

  if (error) {
    return NextResponse.json(
      { error: error.message || "Could not activate membership." },
      { status: 500 },
    )
  }

  return NextResponse.json({
    ok: true,
    subscriptionId: data,
    endsHint: true,
  })
}

/** Chapa may POST callbacks without a user bearer token — acknowledge only. */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const txRef = url.searchParams.get("trx_ref") ?? url.searchParams.get("tx_ref")
  return NextResponse.json({ received: true, txRef })
}
