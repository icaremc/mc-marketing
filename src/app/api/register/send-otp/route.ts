import { NextResponse } from "next/server"

import { sendPhoneOtp } from "@/lib/phone-otp"
import { clientErrorStatus, clientSafeError } from "@/lib/client-safe-error"
import {
  checkRateLimit,
  clientIp,
  rateLimitResponse,
} from "@/lib/rate-limit"
import { isValidEthiopianPhone } from "@/lib/register-validation"

export const maxDuration = 30

export async function POST(request: Request) {
  const limit = checkRateLimit(`register-otp:${clientIp(request)}`, {
    max: 5,
    windowMs: 15 * 60 * 1000,
  })
  if (!limit.allowed) {
    return rateLimitResponse(limit.retryAfterSec ?? 60)
  }
  let phoneNumber: string
  try {
    const body = (await request.json()) as { phoneNumber?: string }
    phoneNumber = body.phoneNumber?.trim() ?? ""
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  if (!phoneNumber) {
    return NextResponse.json({ error: "Phone number is required." }, { status: 400 })
  }
  if (!isValidEthiopianPhone(phoneNumber)) {
    return NextResponse.json(
      {
        error:
          "Enter a valid Ethiopian phone: 09XXXXXXXX, 07XXXXXXXX, or +2519XXXXXXXX / +2517XXXXXXXX.",
      },
      { status: 400 }
    )
  }

  try {
    await sendPhoneOtp(phoneNumber)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[register/send-otp]", error)
    return NextResponse.json(
      {
        error: clientSafeError(
          error,
          "Could not send verification code. Please try again in a moment."
        ),
      },
      { status: clientErrorStatus(error) }
    )
  }
}
