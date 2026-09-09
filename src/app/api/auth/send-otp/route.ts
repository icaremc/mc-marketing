import { NextResponse } from "next/server"

import {
  formatE164EthiopiaPhone,
  isValidEthiopianLocalPhone,
} from "@/lib/phone"
import { sendSmsOtp } from "@/lib/sms-otp"
import { getSupabase } from "@/lib/supabase"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

type Body = {
  fullName?: string
  phone?: string
  referralCode?: string
  acceptedTerms?: boolean
}

async function isPhoneTaken(phoneE164: string): Promise<boolean | null> {
  const anon = getSupabase()
  if (!anon) return null

  try {
    const { data, error } = await anon.functions.invoke("phone-check", {
      body: { phone: phoneE164 },
    })
    if (
      !error &&
      data &&
      typeof data === "object" &&
      (data as { success?: boolean }).success === true &&
      typeof (data as { exists?: boolean }).exists === "boolean"
    ) {
      return (data as { exists: boolean }).exists
    }
  } catch {
    // fall through
  }

  const admin = getSupabaseAdmin()
  if (!admin) return null
  try {
    const digits = phoneE164.replace(/\D/g, "")
    const last9 = digits.length >= 9 ? digits.slice(-9) : digits
    const variants = [
      phoneE164,
      `+${digits}`,
      digits,
      `0${last9}`,
      last9,
      `+251${last9}`,
      `251${last9}`,
    ]
    for (const variant of variants) {
      const { data } = await admin
        .from("profiles")
        .select("id")
        .eq("phone", variant)
        .is("deleted_at", null)
        .maybeSingle()
      if (data) return true
    }
    return false
  } catch {
    return null
  }
}

async function referralAllowed(code: string): Promise<boolean> {
  const normalized = code.trim().toUpperCase().replace(/\s+/g, "")
  if (!normalized) return true
  const client = getSupabase() ?? getSupabaseAdmin()
  if (!client) return true
  try {
    const { data, error } = await client.rpc("lookup_doctor_referral_code", {
      p_code: normalized,
    })
    if (error) return true
    if (data && typeof data === "object" && "valid" in data) {
      return (data as { valid: boolean }).valid === true
    }
    return true
  } catch {
    return true
  }
}

export async function POST(request: Request) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!body.acceptedTerms) {
    return NextResponse.json(
      { error: "Please agree to the Terms of Service and Privacy Policy." },
      { status: 400 },
    )
  }

  const fullName = body.fullName?.trim() ?? ""
  const phoneRaw = body.phone?.trim() ?? ""
  const referralCode = body.referralCode?.trim() ?? ""

  if (fullName.length < 2) {
    return NextResponse.json({ error: "Enter your full name." }, { status: 400 })
  }
  if (!isValidEthiopianLocalPhone(phoneRaw)) {
    return NextResponse.json(
      { error: "Enter a valid Ethiopian mobile number (09… or 07…)." },
      { status: 400 },
    )
  }

  const phone = formatE164EthiopiaPhone(phoneRaw)
  if (!phone) {
    return NextResponse.json({ error: "Invalid phone number." }, { status: 400 })
  }

  if (!(await referralAllowed(referralCode))) {
    return NextResponse.json(
      { error: "That doctor referral code is not valid." },
      { status: 400 },
    )
  }

  const taken = await isPhoneTaken(phone)
  if (taken === true) {
    return NextResponse.json(
      { error: "An account with this phone already exists. Please sign in." },
      { status: 409 },
    )
  }
  if (taken === null) {
    return NextResponse.json(
      { error: "Could not check this phone number. Please try again." },
      { status: 503 },
    )
  }

  const result = await sendSmsOtp(phone)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({
    ok: true,
    phone,
    verificationId: result.verificationId,
  })
}
