import { NextResponse } from "next/server"

import { getBearerToken } from "@/lib/api-auth"
import { parseActivationIds, parseAccessToken } from "@/lib/activation"
import {
  CUSTOM_MIN_AMOUNT_ETB,
  CUSTOM_MIN_CREDITS,
} from "@/lib/pricing-constants"
import {
  payCustomSubscriptionCheckout,
  paySubscriptionCheckout,
} from "@/lib/subscription"

type CheckoutBody = {
  userId?: string
  businessId?: string
  planId?: string
  mode?: "plan" | "custom"
  amount?: number
  credits?: number
}

export async function POST(request: Request) {
  let body: CheckoutBody
  try {
    body = (await request.json()) as CheckoutBody
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const userId = body.userId ?? ""
  const businessId = body.businessId
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
    if (body.mode === "custom") {
      const amount = body.amount
      const credits = body.credits
      if (
        typeof amount !== "number" ||
        amount < CUSTOM_MIN_AMOUNT_ETB ||
        typeof credits !== "number" ||
        credits < CUSTOM_MIN_CREDITS
      ) {
        return NextResponse.json(
          {
            error: `Custom subscription requires at least ${CUSTOM_MIN_CREDITS.toLocaleString()} credits (${CUSTOM_MIN_AMOUNT_ETB.toLocaleString()} ETB).`,
          },
          { status: 400 }
        )
      }

      const result = await payCustomSubscriptionCheckout(
        tokenParsed.token,
        businessId!,
        amount,
        credits
      )
      return NextResponse.json({
        checkoutUrl: result.checkoutUrl,
        txRef: result.txRef,
      })
    }

    const planId = body.planId?.trim() ?? ""
    if (!planId) {
      return NextResponse.json(
        { error: "Select a subscription plan." },
        { status: 400 }
      )
    }

    const result = await paySubscriptionCheckout(
      tokenParsed.token,
      businessId!,
      planId
    )
    return NextResponse.json({
      checkoutUrl: result.checkoutUrl,
      txRef: result.txRef,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not start payment."
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
