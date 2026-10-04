import { NextResponse } from "next/server"

import { backendFetch } from "@/lib/backend"
import { verifyChapaPayment } from "@/lib/chapa"
import { getSessionTokens } from "@/lib/session"
import { fetchChapaSettings } from "@/lib/subscription-settings"

type Body = { txRef?: string }

type MeOut = { id: string }
type AppSub = { status?: string; id?: string } | null

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

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

  for (let attempt = 0; attempt < 4; attempt++) {
    const sub = await backendFetch<AppSub>("/subscriptions/app", {
      token: session.accessToken,
    })
    if (sub.ok && sub.data && typeof sub.data === "object" && sub.data.status === "active") {
      return NextResponse.json({
        ok: true,
        subscriptionId: sub.data.id ?? null,
      })
    }
    if (attempt < 3) await sleep(800)
  }

  const chapa = await fetchChapaSettings()
  if (!chapa?.secretKey) {
    return NextResponse.json(
      { error: "Payment received, but membership is still activating. Open the app in a moment." },
      { status: 202 },
    )
  }

  const verified = await verifyChapaPayment({
    secretKey: chapa.secretKey,
    txRef,
  })
  if (!verified.ok) {
    return NextResponse.json({ error: verified.error }, { status: 400 })
  }

  const me = await backendFetch<MeOut>("/auth/me", { token: session.accessToken })
  if (me.ok && me.data.id) {
    // ponytail: activate via webhook handler when Chapa→BE webhook is slow/missing
    await backendFetch("/payments/chapa/webhook", {
      method: "POST",
      json: {
        tx_ref: txRef,
        status: "success",
        amount: String(verified.amount),
        meta: { kind: "app_subscription", user_id: me.data.id },
      },
    })
  }

  const sub = await backendFetch<AppSub>("/subscriptions/app", {
    token: session.accessToken,
  })
  if (sub.ok && sub.data && typeof sub.data === "object" && sub.data.status === "active") {
    return NextResponse.json({
      ok: true,
      subscriptionId: sub.data.id ?? null,
      amount: verified.amount,
      currency: verified.currency,
    })
  }

  return NextResponse.json(
    {
      error:
        "Payment succeeded, but membership is still activating. Open the app shortly — it should appear automatically.",
    },
    { status: 202 },
  )
}
