import { NextResponse } from "next/server"

import {
  authEmailFromPhone,
  formatE164EthiopiaPhone,
  isValidEthiopianLocalPhone,
} from "@/lib/phone"
import { setSessionCookies } from "@/lib/session"
import { getSupabase } from "@/lib/supabase"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

type Body = {
  phone?: string
  password?: string
}

async function accountExistsForPhone(phoneE164: string): Promise<boolean | null> {
  const admin = getSupabaseAdmin()
  if (admin) {
    try {
      const digits = phoneE164.replace(/\D/g, "")
      const last9 = digits.slice(-9)
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
    } catch {
      // fall through
    }
  }

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
    // ignore
  }
  return null
}

export async function POST(request: Request) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const phoneRaw = body.phone?.trim() ?? ""
  const password = body.password ?? ""

  if (!isValidEthiopianLocalPhone(phoneRaw)) {
    return NextResponse.json(
      { error: "Enter a valid Ethiopian mobile number." },
      { status: 400 },
    )
  }
  if (!password) {
    return NextResponse.json({ error: "Enter your password." }, { status: 400 })
  }

  const phone = formatE164EthiopiaPhone(phoneRaw)
  const email = authEmailFromPhone(phone)
  const anon = getSupabase()
  if (!anon || !email || !phone) {
    return NextResponse.json({ error: "Auth is not configured." }, { status: 503 })
  }

  const { data, error } = await anon.auth.signInWithPassword({ email, password })
  if (error || !data.session || !data.user) {
    const exists = await accountExistsForPhone(phone)
    if (exists === false) {
      return NextResponse.json(
        {
          error: "No account found for this phone number. Please register first.",
          code: "not_registered",
        },
        { status: 401 },
      )
    }
    return NextResponse.json(
      {
        error: "Invalid phone or password. Try again, or reset your password in the app.",
        code: "invalid_credentials",
      },
      { status: 401 },
    )
  }

  await setSessionCookies({
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresAt: data.session.expires_at ?? Math.floor(Date.now() / 1000) + 3600,
  })

  return NextResponse.json({ ok: true })
}
