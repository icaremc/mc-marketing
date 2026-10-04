import { cookies } from "next/headers"

const VERIFIED_PHONE = "mc_verified_phone"
const OTP_CODE = "mc_otp_code"

export async function setPhoneVerifiedCookie(phoneE164: string, otp: string) {
  const jar = await cookies()
  const common = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 15,
  }
  jar.set(VERIFIED_PHONE, phoneE164, common)
  jar.set(OTP_CODE, otp, common)
}

export async function getPhoneVerifiedCookie(): Promise<{
  phone: string
  otp: string
} | null> {
  const jar = await cookies()
  const phone = jar.get(VERIFIED_PHONE)?.value
  const otp = jar.get(OTP_CODE)?.value
  if (!phone || !otp) return null
  return { phone, otp }
}

export async function clearPhoneVerifiedCookie() {
  const jar = await cookies()
  jar.delete(VERIFIED_PHONE)
  jar.delete(OTP_CODE)
}
