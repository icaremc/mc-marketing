import { NextResponse } from "next/server"

import { getBearerToken } from "@/lib/api-auth"
import { parseAccessToken } from "@/lib/activation"
import { verifyChapaPayment } from "@/lib/subscription"
import { verifyChapaTransaction } from "@/lib/chapa"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const txRef = searchParams.get("trx_ref") ?? searchParams.get("tx_ref")
  const token = getBearerToken(request) ?? undefined

  if (!txRef) {
    return NextResponse.json({ error: "Missing transaction reference." }, { status: 400 })
  }

  const tokenParsed = parseAccessToken(token ?? undefined)

  try {
    if (tokenParsed.ok) {
      const data = await verifyChapaPayment(tokenParsed.token, txRef)
      const status = (
        data.status ??
        data.payment_status ??
        (data.data as Record<string, unknown> | undefined)?.status
      )?.toString()
      const paid = status?.toLowerCase() === "success"
      return NextResponse.json({ paid, status: status ?? "unknown" })
    }

    const data = await verifyChapaTransaction(txRef)
    const paid = data?.status === "success"
    return NextResponse.json({
      paid,
      status: data?.status ?? "unknown",
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not verify payment."
    return NextResponse.json({ error: message }, { status: 502 })
  }
}

export async function POST(request: Request) {
  return GET(request)
}
