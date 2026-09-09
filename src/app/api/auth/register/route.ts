import { NextResponse } from "next/server"

import {
  authEmailFromPhone,
  formatE164EthiopiaPhone,
} from "@/lib/phone"
import { clearPhoneVerifiedCookie, getPhoneVerifiedCookie } from "@/lib/otp-session"
import { setSessionCookies } from "@/lib/session"
import { getSupabase } from "@/lib/supabase"
import { getSupabaseAdmin, getSupabaseWithToken } from "@/lib/supabase-admin"

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
  if (!verified || verified.phone !== phone) {
    return NextResponse.json(
      { error: "Verify your phone number first." },
      { status: 403 },
    )
  }

  const email = authEmailFromPhone(phone)
  const anon = getSupabase()
  const admin = getSupabaseAdmin()
  if (!anon || !admin || !email) {
    return NextResponse.json(
      { error: "Auth is not configured on this site." },
      { status: 503 },
    )
  }

  const authData = {
    full_name: fullName,
    phone,
    user_tracking_type: "pregnancy",
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: authData,
  })

  if (createError || !created.user) {
    const message = createError?.message?.toLowerCase() ?? ""
    if (message.includes("already") || message.includes("registered")) {
      return NextResponse.json(
        {
          error:
            "An account with this phone already exists. Sign in, or use another number.",
        },
        { status: 409 },
      )
    }
    return NextResponse.json(
      { error: createError?.message ?? "Could not create account." },
      { status: 400 },
    )
  }

  const { data: signedIn, error: signInError } = await anon.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError || !signedIn.session || !signedIn.user) {
    return NextResponse.json(
      { error: signInError?.message ?? "Account created, but sign-in failed. Try again." },
      { status: 500 },
    )
  }

  const profile: Record<string, unknown> = {
    id: signedIn.user.id,
    full_name: fullName,
    phone,
    account_type: "mother",
    user_tracking_type: "pregnancy",
    updated_at: new Date().toISOString(),
  }
  if (referralCode) profile.referral_code_used = referralCode

  const { error: profileError } = await admin.from("profiles").upsert(profile)
  if (profileError && referralCode) {
    delete profile.referral_code_used
    await admin.from("profiles").upsert(profile)
  }

  if (referralCode) {
    try {
      const userClient = getSupabaseWithToken(signedIn.session.access_token)
      await userClient?.rpc("apply_doctor_referral_code", { p_code: referralCode })
    } catch {
      // best-effort; profile already stored code when column exists
    }
  }

  await setSessionCookies({
    accessToken: signedIn.session.access_token,
    refreshToken: signedIn.session.refresh_token,
    expiresAt: signedIn.session.expires_at ?? Math.floor(Date.now() / 1000) + 3600,
  })
  await clearPhoneVerifiedCookie()

  return NextResponse.json({
    ok: true,
    user: {
      id: signedIn.user.id,
      fullName,
      phone,
    },
  })
}
