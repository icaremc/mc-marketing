import { smsGatewayRecipient } from "@/lib/phone"

type SmsResult = { ok: true; verificationId: string } | { ok: false; error: string }
type SmsVerifyResult = { ok: true } | { ok: false; error: string }

function smsBaseUrl(): string | null {
  const sms = process.env.SMS_API_BASE_URL?.trim()
  if (sms && !sms.includes("your-")) {
    return sms.endsWith("/") ? sms.slice(0, -1) : sms
  }
  const push = process.env.PUSH_API_BASE_URL?.trim()
  if (push && !push.includes("your-")) {
    return push.endsWith("/") ? push.slice(0, -1) : push
  }
  // Same default as mc-app/.env.example
  return "https://betegna-ai.vercel.app"
}

function smsHeaders(): HeadersInit {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  const apiKey = process.env.SMS_API_KEY?.trim()
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`
  return headers
}

function readVerificationId(body: Record<string, unknown> | null): string | null {
  if (!body) return null
  const top =
    body.verification_id ?? body.verificationId ?? body.id
  if (top != null && String(top)) return String(top)
  const response = body.response
  if (response && typeof response === "object") {
    const nested = response as Record<string, unknown>
    const id = nested.verification_id ?? nested.verificationId ?? nested.id
    if (id != null && String(id)) return String(id)
  }
  return null
}

function readError(body: Record<string, unknown> | null, status: number): string {
  const detail = body?.detail
  if (typeof detail === "string" && detail.trim()) return detail.trim()
  if (typeof body?.error === "string" && body.error.trim()) return body.error.trim()
  if (typeof body?.message === "string" && body.message.trim()) return body.message.trim()
  return `SMS request failed (${status}).`
}

function isSuccess(status: number, body: Record<string, unknown> | null): boolean {
  if (status < 200 || status >= 300) return false
  if (!body) return true
  if (typeof body.success === "boolean") return body.success
  if (typeof body.ok === "boolean") return body.ok
  return true
}

export async function sendSmsOtp(phoneE164: string): Promise<SmsResult> {
  const base = smsBaseUrl()
  if (!base) {
    return { ok: false, error: "SMS service is not configured." }
  }
  const recipient = smsGatewayRecipient(phoneE164) ?? phoneE164
  try {
    const response = await fetch(`${base}/sms/send-otp`, {
      method: "POST",
      headers: smsHeaders(),
      body: JSON.stringify({
        recipient,
        code_length: 4,
        code_type: 0,
        ttl: 300,
        message_prefix: "Your verification code is ",
        message_postfix: "",
      }),
    })
    const raw = await response.text()
    let body: Record<string, unknown> | null = null
    try {
      body = raw ? (JSON.parse(raw) as Record<string, unknown>) : null
    } catch {
      body = null
    }
    if (!isSuccess(response.status, body)) {
      return { ok: false, error: readError(body, response.status) }
    }
    const verificationId = readVerificationId(body)
    if (!verificationId) {
      return { ok: false, error: "Could not start verification. Please try again." }
    }
    return { ok: true, verificationId }
  } catch {
    return {
      ok: false,
      error: "Could not send verification code. Check your connection.",
    }
  }
}

export async function verifySmsOtp(input: {
  phoneE164: string
  code: string
  verificationId: string
}): Promise<SmsVerifyResult> {
  const base = smsBaseUrl()
  if (!base) {
    return { ok: false, error: "SMS service is not configured." }
  }
  const recipient = smsGatewayRecipient(input.phoneE164) ?? input.phoneE164
  try {
    const response = await fetch(`${base}/sms/verify-otp`, {
      method: "POST",
      headers: smsHeaders(),
      body: JSON.stringify({
        recipient,
        code: input.code.trim(),
        verification_id: input.verificationId,
      }),
    })
    const raw = await response.text()
    let body: Record<string, unknown> | null = null
    try {
      body = raw ? (JSON.parse(raw) as Record<string, unknown>) : null
    } catch {
      body = null
    }
    if (!isSuccess(response.status, body)) {
      return {
        ok: false,
        error: readError(body, response.status) || "That code is incorrect or expired.",
      }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: "Could not verify the code. Check your connection." }
  }
}
