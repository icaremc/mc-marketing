import { NextResponse } from "next/server"

import { getBearerToken } from "@/lib/api-auth"
import { parseAccessToken } from "@/lib/activation"
import {
  getCreditsPerEtb,
  listSubscriptionPlans,
} from "@/lib/subscription"

export async function GET(request: Request) {
  const token = getBearerToken(request) ?? undefined

  const parsed = parseAccessToken(token ?? undefined)
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.message }, { status: 401 })
  }

  try {
    const [plans, creditsPerEtb] = await Promise.all([
      listSubscriptionPlans(parsed.token),
      getCreditsPerEtb(parsed.token),
    ])

    if (plans.length === 0) {
      return NextResponse.json(
        { error: "No subscription plans are available." },
        { status: 404 }
      )
    }

    return NextResponse.json({ plans, creditsPerEtb })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load plans."
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
