import { NextResponse } from "next/server"

import { backendFetch } from "@/lib/backend"
import { verifyChapaPayment } from "@/lib/chapa"
import {
  authMe,
  bearerToken,
  fetchChapaConfig,
  isUuid,
} from "@/lib/membership"

export const maxDuration = 30

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms))
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

  const me = await authMe(token)
  if (!me || me.id !== userId) {
    return NextResponse.json({ error: "Session does not match account." }, { status: 403 })
  }

  for (let attempt = 0; attempt < 4; attempt++) {
    const sub = await backendFetch<{ id?: string; status?: string } | null>(
      "/subscriptions/app",
      { token },
    )
    if (sub.ok && sub.data && sub.data.status === "active") {
      return NextResponse.json({
        ok: true,
        subscriptionId: sub.data.id ?? null,
        endsHint: true,
      })
    }
    if (attempt < 3) await sleep(800)
  }

  const chapa = await fetchChapaConfig()
  if (!chapa) {
    return NextResponse.json({ error: "Payment not configured." }, { status: 503 })
  }

  const verified = await verifyChapaPayment({
    secretKey: chapa.secretKey,
    txRef,
  })
  if (!verified.ok) {
    return NextResponse.json(
      { error: "Payment not completed yet. Wait a moment and try again." },
      { status: 402 },
    )
  }

  // ponytail: activate via webhook handler when Chapa→BE webhook is slow/missing
  await backendFetch("/payments/chapa/webhook", {
    method: "POST",
    json: {
      tx_ref: txRef,
      status: "success",
      amount: String(verified.amount),
      meta: { kind: "app_subscription", user_id: userId },
    },
  })

  const sub = await backendFetch<{ id?: string; status?: string } | null>(
    "/subscriptions/app",
    { token },
  )
  if (sub.ok && sub.data && sub.data.status === "active") {
    return NextResponse.json({
      ok: true,
      subscriptionId: sub.data.id ?? null,
      endsHint: true,
    })
  }

  return NextResponse.json(
    { error: "Could not activate membership." },
    { status: 500 },
  )
}

/** Chapa may POST callbacks without a user bearer token — acknowledge only. */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const txRef = url.searchParams.get("trx_ref") ?? url.searchParams.get("tx_ref")
  return NextResponse.json({ received: true, txRef })
}
