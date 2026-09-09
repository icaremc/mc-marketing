import { NextResponse } from "next/server"

import { verifyChapaPayment } from "@/lib/chapa"
import { getSessionTokens } from "@/lib/session"
import { fetchChapaSettings, fetchMembershipSettings } from "@/lib/subscription-settings"
import { getSupabaseWithToken } from "@/lib/supabase-admin"

type Body = { txRef?: string }

export async function POST(request: Request) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const txRef = body.txRef?.trim() ?? ""
  if (txRef.length < 8) {
    return NextResponse.json({ error: "Missing payment reference." }, { status: 400 })
  }

  const session = await getSessionTokens()
  if (!session) {
    return NextResponse.json({ error: "Please register or sign in first." }, { status: 401 })
  }

  const userClient = getSupabaseWithToken(session.accessToken)
  if (!userClient) {
    return NextResponse.json({ error: "Auth is not configured." }, { status: 503 })
  }

  const { data: userData, error: userError } = await userClient.auth.getUser()
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Session expired. Please register again." }, { status: 401 })
  }

  const chapa = await fetchChapaSettings()
  if (!chapa?.secretKey) {
    return NextResponse.json({ error: "Payment is not configured." }, { status: 503 })
  }

  const verified = await verifyChapaPayment({
    secretKey: chapa.secretKey,
    txRef,
  })
  if (!verified.ok) {
    return NextResponse.json({ error: verified.error }, { status: 400 })
  }

  const plan = await fetchMembershipSettings()
  const amountPaid = Math.max(verified.amount, plan.yearlyPrice)

  const { data: subscriptionId, error: rpcError } = await userClient.rpc(
    "activate_app_subscription",
    {
      p_tx_ref: txRef,
      p_amount_paid: amountPaid,
      p_payment_method: "chapa",
    },
  )

  if (rpcError) {
    return NextResponse.json(
      { error: rpcError.message || "Could not activate subscription." },
      { status: 400 },
    )
  }

  return NextResponse.json({
    ok: true,
    subscriptionId,
    amount: amountPaid,
    currency: verified.currency,
  })
}
