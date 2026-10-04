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
  return "Could not verify payment."
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
