import { NextResponse } from "next/server"

import { buildRegisterPayload } from "@/lib/register-defaults"
import { clientSafeError } from "@/lib/client-safe-error"
import {
  checkRateLimit,
  clientIp,
  rateLimitResponse,
} from "@/lib/rate-limit"
import { registerBusiness, type RegisterPayload } from "@/lib/register"
import { validateRegisterPayload } from "@/lib/register-validation"

type RegisterRequestBody = Partial<RegisterPayload> & { otpVerified?: boolean }

export async function POST(request: Request) {
  const limit = checkRateLimit(`register:${clientIp(request)}`, {
    max: 8,
    windowMs: 60 * 60 * 1000,
  })
  if (!limit.allowed) {
    return rateLimitResponse(limit.retryAfterSec ?? 120)
  }
  let body: RegisterRequestBody
  try {
    body = (await request.json()) as RegisterRequestBody
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const payload = buildRegisterPayload({
    phoneNumber: body.phoneNumber ?? "",
    username: body.username,
    password: body.password ?? "",
    referralCode: body.referralCode,
    businessName: body.businessName,
    branchName: body.branchName,
    branchAddress: body.branchAddress,
  })

  const validationError = validateRegisterPayload({
    phoneNumber: payload.phoneNumber,
    password: payload.password,
    otpVerified: body.otpVerified === true,
    businessName: payload.businessName,
    branchName: payload.branchName,
    branchAddress: payload.branchAddress,
  })
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  try {
    const result = await registerBusiness(payload)
    return NextResponse.json({
      userId: result.userId,
      businessId: result.businessId,
      branchId: result.branchId,
    })
  } catch (error) {
    return NextResponse.json(
      { error: clientSafeError(error, "Registration failed. Please try again.") },
      { status: 502 }
    )
  }
}
