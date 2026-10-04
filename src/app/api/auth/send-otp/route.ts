import { NextResponse } from "next/server"

import { backendFetch } from "@/lib/backend"
import {
  formatE164EthiopiaPhone,
  isValidEthiopianLocalPhone,
} from "@/lib/phone"

type Body = {
  fullName?: string
  phone?: string
  referralCode?: string
  acceptedTerms?: boolean
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

  const taken = await backendFetch<{ taken: boolean }>("/auth/phone-taken", {
    searchParams: { phone, role: "patient" },
  })
  if (!taken.ok) {
    return NextResponse.json(
      { error: "Could not check this phone number. Please try again." },
      { status: 503 },
    )
  }
  if (taken.data.taken) {
    return NextResponse.json(
      { error: "An account with this phone already exists. Please sign in." },
      { status: 409 },
    )
  }

  const otp = await backendFetch<{ ok?: boolean; detail?: string | null }>(
    "/auth/patient/otp",
    { method: "POST", json: { phone } },
  )
  if (!otp.ok) {
    return NextResponse.json(
      { error: otp.message || "Could not send verification code." },
      { status: otp.status >= 400 ? otp.status : 400 },
    )
  }
  if (otp.data?.ok === false) {
    return NextResponse.json(
      {
        error:
          otp.data.detail === "Phone already registered"
            ? "An account with this phone already exists. Please sign in."
            : otp.data.detail || "Could not send verification code.",
      },
      { status: 409 },
    )
  }

  return NextResponse.json({
    ok: true,
    phone,
    // ponytail: backend verifies OTP at signup; this id only satisfies the existing UI step
    verificationId: "backend",
  })
}
