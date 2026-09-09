export type ChapaInitResult =
  | { ok: true; checkoutUrl: string; txRef: string }
  | { ok: false; error: string }

export type ChapaVerifyResult =
  | { ok: true; amount: number; currency: string; status: string }
  | { ok: false; error: string }

function chapaError(body: string): string {
  try {
    const decoded = JSON.parse(body) as {
      message?: string | Record<string, unknown>
      data?: Record<string, unknown>
    }
    if (typeof decoded.message === "string" && decoded.message.trim()) {
      return decoded.message
    }
    if (decoded.message && typeof decoded.message === "object") {
      const first = Object.values(decoded.message)[0]
      if (Array.isArray(first) && first[0]) return String(first[0])
      if (first != null) return String(first)
    }
  } catch {
    // ignore
  }
  return "Could not open Chapa checkout."
}

export function generateTxRef(userId: string): string {
  const fragment = userId.replace(/-/g, "").slice(0, 10)
  const rnd = Math.random().toString(36).slice(2, 8)
  return `icare_${fragment}_${Date.now()}_${rnd}`
}

function customize(value: string, max: number): string {
  let cleaned = value
    .replace(/·/g, "-")
    .replace(/[^A-Za-z0-9._\- ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  if (!cleaned) cleaned = "iCare MC"
  return cleaned.length <= max ? cleaned : cleaned.slice(0, max).trim()
}

export async function initializeChapaPayment(input: {
  secretKey: string
  amount: number
  currency: string
  email: string
  phone: string
  firstName: string
  lastName: string
  txRef: string
  returnUrl: string
  title?: string
  description?: string
}): Promise<ChapaInitResult> {
  const payload: Record<string, unknown> = {
    amount: input.amount.toFixed(2),
    currency: input.currency,
    email: input.email,
    first_name: input.firstName || "Member",
    last_name: input.lastName || "iCare",
    tx_ref: input.txRef,
    return_url: input.returnUrl,
    customization: {
      title: customize(input.title ?? "Yearly plan", 16),
      description: customize(input.description ?? "iCare MC membership", 50),
    },
  }
  if (input.phone) payload.phone_number = input.phone

  const response = await fetch("https://api.chapa.co/v1/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  const body = await response.text()
  if (!response.ok) return { ok: false, error: chapaError(body) }

  try {
    const decoded = JSON.parse(body) as {
      status?: string
      data?: { checkout_url?: string }
    }
    const url = decoded.data?.checkout_url
    if (decoded.status !== "success" || !url) {
      return { ok: false, error: chapaError(body) }
    }
    return { ok: true, checkoutUrl: url, txRef: input.txRef }
  } catch {
    return { ok: false, error: "Could not open Chapa checkout." }
  }
}

export async function verifyChapaPayment(input: {
  secretKey: string
  txRef: string
}): Promise<ChapaVerifyResult> {
  const response = await fetch(
    `https://api.chapa.co/v1/transaction/verify/${encodeURIComponent(input.txRef)}`,
    {
      headers: { Authorization: `Bearer ${input.secretKey}` },
    },
  )
  const body = await response.text()
  if (!response.ok) return { ok: false, error: chapaError(body) }

  try {
    const decoded = JSON.parse(body) as {
      status?: string
      data?: { status?: string; amount?: number | string; currency?: string }
    }
    const status = decoded.data?.status?.toLowerCase() ?? ""
    if (decoded.status !== "success" || status !== "success") {
      return { ok: false, error: "Payment not completed yet." }
    }
    const amount = Number(decoded.data?.amount ?? 0)
    return {
      ok: true,
      amount,
      currency: decoded.data?.currency ?? "ETB",
      status,
    }
  } catch {
    return { ok: false, error: "Could not verify payment." }
  }
}
