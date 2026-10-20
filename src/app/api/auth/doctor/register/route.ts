import { NextResponse } from "next/server"

import { backendFetch, sessionFromTokenOut, type TokenOut } from "@/lib/backend"
import { formatE164EthiopiaPhone } from "@/lib/phone"
import { clearPhoneVerifiedCookie, getPhoneVerifiedCookie } from "@/lib/otp-session"
import { setSessionCookies } from "@/lib/session"

type Body = {
  firstName?: string
  lastName?: string
  phone?: string
  password?: string
  confirmPassword?: string
  specialty?: string
}

export async function POST(request: Request) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const firstName = body.firstName?.trim() ?? ""
  const lastName = body.lastName?.trim() ?? ""
  const phoneRaw = body.phone?.trim() ?? ""
  const password = body.password ?? ""
  const confirmPassword = body.confirmPassword ?? ""
  const specialty = body.specialty?.trim() || "General"

  if (firstName.length < 1 || lastName.length < 1) {
    return NextResponse.json(
      { error: "Enter your first and last name." },
      { status: 400 },
    )
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

  const result = await backendFetch<TokenOut>("/auth/doctor/signup", {
    method: "POST",
    json: {
      phone,
      password,
      otp: verified.otp,
      first_name: firstName,
      last_name: lastName,
      specialty,
    },
  })

  if (!result.ok || !result.data.access_token || !result.data.refresh_token) {
    const message = (!result.ok ? result.message : "Could not create account.").toLowerCase()
    if (message.includes("already") || message.includes("registered")) {
      return NextResponse.json(
        { error: "An account with this phone already exists. Sign in instead." },
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

  await setSessionCookies(sessionFromTokenOut(result.data, "doctor"))
  await clearPhoneVerifiedCookie()

  return NextResponse.json({
    ok: true,
    role: "doctor",
    user: { id: result.data.user_id, phone },
  })
}
