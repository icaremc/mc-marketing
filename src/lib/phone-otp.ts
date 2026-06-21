import { apiUrl } from "@/lib/api-backend"
import { ApiRequestError } from "@/lib/api-request-error"
import { parseApiError } from "@/lib/api-errors"
import { normalizeEthiopianPhone } from "@/lib/phone-utils"

export async function sendPhoneOtp(phoneNumber: string): Promise<void> {
  const response = await fetch(apiUrl("/api/v1/users/phone/send-otp"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      phone_number: normalizeEthiopianPhone(phoneNumber),
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    const message = parseApiError(response.status, await response.text())
    throw new ApiRequestError(message, response.status)
  }
}

export async function verifyPhoneOtp(
  phoneNumber: string,
  otp: string
): Promise<boolean> {
  const response = await fetch(apiUrl("/api/v1/users/phone/verify-otp"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      phone_number: normalizeEthiopianPhone(phoneNumber),
      otp: otp.trim(),
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    const message = parseApiError(response.status, await response.text())
    throw new ApiRequestError(message, response.status)
  }

  const raw = (await response.text()).trim()
  if (!raw) return true

  try {
    const data = JSON.parse(raw) as { verified?: boolean }
    if (data.verified === false) {
      throw new ApiRequestError(
        "Invalid verification code. Please try again.",
        400
      )
    }
    return true
  } catch (error) {
    if (error instanceof ApiRequestError) throw error
    return true
  }
}
