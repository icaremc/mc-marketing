import { NextResponse } from "next/server"

import { getBearerToken } from "@/lib/api-auth"
import { parseActivationIds, parseAccessToken } from "@/lib/activation"
import { hasActiveSubscription } from "@/lib/subscription-status"
import { isUuid } from "@/lib/uuid"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const businessId = url.searchParams.get("business_id") ?? undefined
  const userId = url.searchParams.get("user_id")?.trim() ?? ""
  if (!isUuid(userId)) {
    return NextResponse.json({ error: "Invalid user_id." }, { status: 400 })
  }
  const token = getBearerToken(request)

  const idsParsed = parseActivationIds(userId, businessId)
  if (!idsParsed.ok) {
    return NextResponse.json({ error: idsParsed.message }, { status: 400 })
  }

  const tokenParsed = parseAccessToken(token)
  if (!tokenParsed.ok) {
    return NextResponse.json({ error: tokenParsed.message }, { status: 401 })
  }

  try {
    const active = await hasActiveSubscription(
      tokenParsed.token,
      businessId!
    )
    return NextResponse.json({ active })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not check subscription."
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
