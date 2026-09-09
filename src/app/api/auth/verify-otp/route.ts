import { NextResponse } from "next/server"

import { formatE164EthiopiaPhone, isValidEthiopianLocalPhone } from "@/lib/phone"
import { setPhoneVerifiedCookie } from "@/lib/otp-session"
import { verifySmsOtp } from "@/lib/sms-otp"

type Body = {
  phone?: string
  code?: string
  verificationId?: string
}

export async function POST(request: Request) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const phoneRaw = body.phone?.trim() ?? ""
  const code = body.code?.trim() ?? ""
  const verificationId = body.verificationId?.trim() ?? ""

  if (!isValidEthiopianLocalPhone(phoneRaw) && !phoneRaw.startsWith("+251")) {
    return NextResponse.json({ error: "Invalid phone number." }, { status: 400 })
  }
  const phone =
    formatE164EthiopiaPhone(phoneRaw) ||
    (phoneRaw.startsWith("+251") ? phoneRaw : "")
  if (!phone) {
    return NextResponse.json({ error: "Invalid phone number." }, { status: 400 })
  }
  if (!/^\d{4,8}$/.test(code)) {
    return NextResponse.json({ error: "Enter the verification code." }, { status: 400 })
  }
  if (!verificationId) {
    return NextResponse.json({ error: "Missing verification session." }, { status: 400 })
  }

  const result = await verifySmsOtp({ phoneE164: phone, code, verificationId })
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  await setPhoneVerifiedCookie(phone, verificationId)
  return NextResponse.json({ ok: true, phone })
}
