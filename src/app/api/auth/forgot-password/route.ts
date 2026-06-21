import { NextResponse } from "next/server"

import { forgotPassword } from "@/lib/auth-login"
import { isValidEthiopianPhone } from "@/lib/register-validation"

export async function POST(request: Request) {
  let body: { phoneNumber?: string }
  try {
    body = (await request.json()) as { phoneNumber?: string }
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const phoneNumber = body.phoneNumber?.trim() ?? ""
  if (!phoneNumber) {
    return NextResponse.json({ error: "Phone number is required." }, { status: 400 })
  }
  if (!isValidEthiopianPhone(phoneNumber)) {
    return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 })
  }

  try {
    const message = await forgotPassword(phoneNumber)
    return NextResponse.json({ message })
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : "Could not send reset instructions."
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
