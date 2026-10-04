import { NextResponse } from "next/server"

import { backendFetch, sessionFromTokenOut, type TokenOut } from "@/lib/backend"
import {
  formatE164EthiopiaPhone,
  isValidEthiopianLocalPhone,
} from "@/lib/phone"
import { setSessionCookies } from "@/lib/session"

type Body = {
  phone?: string
  password?: string
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
  if (!phone) {
    return NextResponse.json({ error: "Invalid phone number." }, { status: 400 })
  }

  const taken = await backendFetch<{ taken: boolean }>("/auth/phone-taken", {
    searchParams: { phone, role: "patient" },
  })
  if (taken.ok && taken.data.taken === false) {
    return NextResponse.json(
      {
        error: "No account found for this phone number. Please register first.",
        code: "not_registered",
      },
      { status: 401 },
    )
  }

  const result = await backendFetch<TokenOut>("/auth/patient/login", {
    method: "POST",
    form: { username: phone, password },
  })

  if (!result.ok || !result.data.access_token || !result.data.refresh_token) {
    return NextResponse.json(
      {
        error: "Invalid phone or password. Try again, or reset your password in the app.",
        code: "invalid_credentials",
      },
      { status: 401 },
    )
  }

  await setSessionCookies(sessionFromTokenOut(result.data))
  return NextResponse.json({ ok: true })
}
