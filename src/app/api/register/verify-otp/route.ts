import { NextResponse } from "next/server"

import { clientErrorStatus, clientSafeError } from "@/lib/client-safe-error"
import { verifyPhoneOtp } from "@/lib/phone-otp"
import {
  checkRateLimit,
  clientIp,
  rateLimitResponse,
} from "@/lib/rate-limit"
import { isValidEthiopianPhone } from "@/lib/register-validation"

export async function POST(request: Request) {
  const limit = checkRateLimit(`register-verify:${clientIp(request)}`, {
    max: 20,
    windowMs: 15 * 60 * 1000,
  })
  if (!limit.allowed) {
    return rateLimitResponse(limit.retryAfterSec ?? 60)
  }
  let phoneNumber: string
  let otp: string
  try {
    const body = (await request.json()) as { phoneNumber?: string; otp?: string }
    phoneNumber = body.phoneNumber?.trim() ?? ""
    otp = body.otp?.trim() ?? ""
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  if (!phoneNumber) {
    return NextResponse.json({ error: "Phone number is required." }, { status: 400 })
  }
  if (!isValidEthiopianPhone(phoneNumber)) {
    return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 })
  }
  if (!/^\d{6}$/.test(otp)) {
    return NextResponse.json({ error: "Enter the 6-digit code from your phone." }, { status: 400 })
  }

  try {
    await verifyPhoneOtp(phoneNumber, otp)
    return NextResponse.json({ verified: true })
  } catch (error) {
    console.error("[register/verify-otp]", error)
    return NextResponse.json(
      { error: clientSafeError(error, "Could not verify code.") },
      { status: clientErrorStatus(error, 400) }
    )
  }
}
