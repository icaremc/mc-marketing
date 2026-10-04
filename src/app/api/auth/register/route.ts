import { NextResponse } from "next/server"

import { backendFetch, sessionFromTokenOut, type TokenOut } from "@/lib/backend"
import { formatE164EthiopiaPhone } from "@/lib/phone"
import { clearPhoneVerifiedCookie, getPhoneVerifiedCookie } from "@/lib/otp-session"
import { setSessionCookies } from "@/lib/session"

type Body = {
  fullName?: string
  phone?: string
  password?: string
  confirmPassword?: string
  referralCode?: string
}

export async function POST(request: Request) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const fullName = body.fullName?.trim() ?? ""
  const phoneRaw = body.phone?.trim() ?? ""
  const password = body.password ?? ""
  const confirmPassword = body.confirmPassword ?? ""
  const referralCode =
    body.referralCode?.trim().toUpperCase().replace(/\s+/g, "") || null

  if (fullName.length < 2) {
    return NextResponse.json({ error: "Enter your full name." }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 },
    )
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match." }, { status: 400 })
  }

  const phone =
    formatE164EthiopiaPhone(phoneRaw) ||
    (phoneRaw.startsWith("+251") ? phoneRaw : "")
  if (!phone) {
    return NextResponse.json({ error: "Invalid phone number." }, { status: 400 })
  }

  const verified = await getPhoneVerifiedCookie()
  if (!verified || verified.phone !== phone || !verified.otp) {
    return NextResponse.json(
      { error: "Verify your phone number first." },
      { status: 403 },
    )
  }

  const result = await backendFetch<TokenOut>("/auth/patient/signup", {
    method: "POST",
    json: {
      phone,
      password,
      otp: verified.otp,
      full_name: fullName,
      account_type: "Mother",
      referral_code: referralCode,
    },
  })

  if (!result.ok || !result.data.access_token || !result.data.refresh_token) {
    const message = (!result.ok ? result.message : "Could not create account.").toLowerCase()
    if (message.includes("already") || message.includes("registered")) {
      return NextResponse.json(
        {
          error:
            "An account with this phone already exists. Sign in, or use another number.",
        },
        { status: 409 },
      )
    }
    if (message.includes("otp") || message.includes("invalid")) {
      return NextResponse.json(
        { error: "That verification code is incorrect or expired. Request a new one." },
        { status: 400 },
      )
    }
    return NextResponse.json(
      { error: !result.ok ? result.message : "Could not create account." },
      { status: result.status >= 400 ? result.status : 400 },
    )
  }

  await setSessionCookies(sessionFromTokenOut(result.data))
  await clearPhoneVerifiedCookie()

  return NextResponse.json({
    ok: true,
    user: {
      id: result.data.user_id,
      fullName,
      phone,
    },
  })
}
