import { cookies } from "next/headers"

const VERIFIED_PHONE = "mc_verified_phone"
const VERIFICATION_ID = "mc_verification_id"

export async function setPhoneVerifiedCookie(phoneE164: string, verificationId: string) {
  const jar = await cookies()
  const common = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 15,
  }
  jar.set(VERIFIED_PHONE, phoneE164, common)
  jar.set(VERIFICATION_ID, verificationId, common)
}

export async function getPhoneVerifiedCookie(): Promise<{
  phone: string
  verificationId: string
} | null> {
  const jar = await cookies()
  const phone = jar.get(VERIFIED_PHONE)?.value
  const verificationId = jar.get(VERIFICATION_ID)?.value
  if (!phone || !verificationId) return null
  return { phone, verificationId }
}

export async function clearPhoneVerifiedCookie() {
  const jar = await cookies()
  jar.delete(VERIFIED_PHONE)
  jar.delete(VERIFICATION_ID)
}
