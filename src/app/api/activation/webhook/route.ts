import { NextResponse } from "next/server"

import { verifyChapaTransaction } from "@/lib/chapa"

export async function POST(request: Request) {
  const secret = process.env.CHAPA_WEBHOOK_SECRET?.trim()
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Webhook not configured." },
        { status: 503 }
      )
    }
  } else {
    const signature = request.headers.get("chapa-signature")
    if (signature !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  let payload: { tx_ref?: string; status?: string }
  try {
    payload = (await request.json()) as { tx_ref?: string; status?: string }
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const txRef = payload.tx_ref
  if (!txRef) {
    return NextResponse.json({ error: "Missing tx_ref" }, { status: 400 })
  }

  try {
    const data = await verifyChapaTransaction(txRef)
    if (data?.status === "success" && data.meta) {
      const apiBase = process.env.TINA_VERIFY_API_URL?.replace(/\/$/, "")
      if (apiBase && data.meta.user_id && data.meta.business_id) {
        const headers: HeadersInit = {
          "Content-Type": "application/json",
          Accept: "application/json",
        }
        const apiKey = process.env.TINA_VERIFY_API_KEY
        if (apiKey) {
          headers.Authorization = `Bearer ${apiKey}`
        }

        await fetch(
          `${apiBase}/users/${data.meta.user_id}/businesses/${data.meta.business_id}/activate`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              plan_id: data.meta.plan_id,
              tx_ref: txRef,
              source: "chapa_webhook",
            }),
          }
        )
      }
    }

    return NextResponse.json({ received: true })
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
