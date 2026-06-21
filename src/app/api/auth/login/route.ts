import { NextResponse } from "next/server"

import { getApiBaseUrl } from "@/lib/api-backend"
import { loginUser } from "@/lib/auth-login"
import { clientErrorStatus, clientSafeError } from "@/lib/client-safe-error"
import {
  checkRateLimit,
  clientIp,
  rateLimitResponse,
} from "@/lib/rate-limit"
import { isValidEthiopianPhone } from "@/lib/register-validation"

export const maxDuration = 30

export async function POST(request: Request) {
  const limit = checkRateLimit(`login:${clientIp(request)}`, {
    max: 15,
    windowMs: 15 * 60 * 1000,
  })
  if (!limit.allowed) {
    return rateLimitResponse(limit.retryAfterSec ?? 60)
  }
  let body: { phoneNumber?: string; password?: string }
  try {
    body = (await request.json()) as { phoneNumber?: string; password?: string }
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const phoneNumber = body.phoneNumber?.trim() ?? ""
  const password = body.password?.trim() ?? ""

  if (!phoneNumber) {
    return NextResponse.json({ error: "Phone number is required." }, { status: 400 })
  }
  if (!password) {
    return NextResponse.json({ error: "Password is required." }, { status: 400 })
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
    const result = await loginUser(phoneNumber, password)
    if (!result.businessId) {
      return NextResponse.json(
        {
          error:
            "Signed in, but no business is linked to this account. Use the mobile app once, or contact support to link your business.",
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      userId: result.userId,
      businessId: result.businessId,
      businesses: result.businesses,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      role: result.role,
      userName: result.userName,
    })
  } catch (error) {
    console.error("[auth/login]", getApiBaseUrl(), error)
    return NextResponse.json(
      {
        error: clientSafeError(
          error,
          "Login failed. Check your phone and password, then try again."
        ),
      },
      { status: clientErrorStatus(error, 401) }
    )
  }
}
