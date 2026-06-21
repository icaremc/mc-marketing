/** Display labels and API path slugs for receipt verification. */
export const PAYMENT_METHODS = [
  { slug: "cbe", label: "CBE" },
  { slug: "dashen", label: "DASHEN" },
  { slug: "awash", label: "AWASH" },
  { slug: "abysinya", label: "ABYSINIA" },
  { slug: "telebirr", label: "TELEBIRR" },
  { slug: "cbebirr", label: "CBEBIRR" },
] as const

export type PaymentMethodSlug = (typeof PAYMENT_METHODS)[number]["slug"]

export const DEFAULT_PAYMENT_METHOD: PaymentMethodSlug = "cbe"

export function normalizePaymentMethodSlug(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ""

  const byLabel = PAYMENT_METHODS.find(
    (m) => m.label === trimmed.toUpperCase()
  )
  if (byLabel) return byLabel.slug

  const lower = trimmed.toLowerCase()
  const bySlug = PAYMENT_METHODS.find((m) => m.slug === lower)
  return bySlug?.slug ?? lower
}

export function paymentMethodNeedsWalletFields(slug: string): boolean {
  const normalized = normalizePaymentMethodSlug(slug)
  return normalized === "telebirr" || normalized === "cbebirr"
}
