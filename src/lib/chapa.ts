const CHAPA_API = "https://api.chapa.co/v1"

/**
 * Chapa **secret** key (CHASECK… / CHASECK_TEST…).
 * Server-only — never use NEXT_PUBLIC_ (that exposes the key in the browser).
 */
export function getChapaSecretKey(): string | undefined {
  const key =
    process.env.CHAPA_API_KEY ??
    process.env.CHAPA_SECRET_KEY ??
    process.env.CHAPA_PRIVATE_KEY

  if (!key) return undefined

  if (key.startsWith("CHAPUBK")) {
    throw new Error(
      "CHAPA_API_KEY must be your secret key (CHASECK…), not the public key (CHAPUBK…). " +
        "Copy the Secret Key from the Chapa dashboard."
    )
  }

  return key
}

export function isChapaTestMode(): boolean {
  const key = getChapaSecretKey() ?? ""
  return key.includes("_TEST")
}

type ChapaInitializeResponse = {
  status?: string
  message?: string
  data?: {
    checkout_url?: string
  }
}

type ChapaVerifyResponse = {
  status?: string
  message?: string
  data?: {
    status?: string
    amount?: string
    currency?: string
    tx_ref?: string
    meta?: Record<string, string>
  }
}

export type ChapaPaymentMeta = {
  user_id: string
  business_id: string
  plan_id: string
}

export async function initializeChapaPayment(input: {
  amountEtb: number
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string
  txRef: string
  title: string
  description: string
  returnUrl: string
  callbackUrl: string
  meta: ChapaPaymentMeta
}): Promise<{ checkoutUrl: string }> {
  let secret: string | undefined
  try {
    secret = getChapaSecretKey()
  } catch (error) {
    throw error instanceof Error ? error : new Error("Invalid Chapa configuration.")
  }
  if (!secret) {
    throw new Error(
      "Payment is not configured. Set CHAPA_API_KEY (CHASECK…) in .env — server-only, no NEXT_PUBLIC_ prefix."
    )
  }

  const response = await fetch(`${CHAPA_API}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: String(input.amountEtb),
      currency: "ETB",
      email: input.email,
      first_name: input.firstName,
      last_name: input.lastName,
      phone_number: input.phoneNumber,
      tx_ref: input.txRef,
      callback_url: input.callbackUrl,
      return_url: input.returnUrl,
      customization: {
        title: input.title,
        description: input.description,
      },
      meta: input.meta,
    }),
  })

  const payload = (await response.json()) as ChapaInitializeResponse & {
    message?: string | Record<string, string[]>
  }
  const checkoutUrl = payload.data?.checkout_url

  if (!response.ok || !checkoutUrl) {
    throw new Error(formatChapaError(payload.message))
  }

  return { checkoutUrl }
}

export async function verifyChapaTransaction(
  txRef: string
): Promise<ChapaVerifyResponse["data"]> {
  const secret = getChapaSecretKey()
  if (!secret) {
    throw new Error("Payment verification is not configured.")
  }

  const response = await fetch(
    `${CHAPA_API}/transaction/verify/${encodeURIComponent(txRef)}`,
    {
      headers: {
        Authorization: `Bearer ${secret}`,
      },
      cache: "no-store",
    }
  )

  const payload = (await response.json()) as ChapaVerifyResponse
  if (!response.ok) {
    throw new Error(payload.message ?? "Could not verify payment.")
  }

  return payload.data
}

export function createTxRef(businessId: string): string {
  const suffix = businessId.replace(/-/g, "").slice(0, 8)
  return `tv-act-${suffix}-${Date.now()}`
}

/** Chapa requires an email (max 50 chars); derived from account id for app checkout links. */
export function chapaCheckoutEmail(userId: string): string {
  const local = userId.replace(/-/g, "").slice(0, 12)
  return `${local}@tinaverify.com`
}

function formatChapaError(
  message: string | Record<string, string[]> | undefined
): string {
  if (!message) return "Could not start payment."
  if (typeof message === "string") return message
  const parts = Object.entries(message).flatMap(([field, errors]) =>
    errors.map((err) => `${field}: ${err}`)
  )
  return parts.length > 0 ? parts.join(" ") : "Could not start payment."
}
