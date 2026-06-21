export type VerifyResultRow = Record<string, unknown>

const TRANSACTION_KEYS = new Set([
  "id",
  "reference_number",
  "reference",
  "amount",
  "status",
  "currency",
  "sender_name",
  "receiver_name",
  "error_message",
])

function mapLooksLikeTransaction(map: VerifyResultRow): boolean {
  return [...TRANSACTION_KEYS].some((key) => key in map)
}

/** Flatten nested verify API payloads (same keys as mobile app). */
export function normalizeVerifyResult(
  raw: unknown
): VerifyResultRow | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null
  const root = raw as VerifyResultRow

  let nested: VerifyResultRow | null = null
  for (const key of [
    "transaction",
    "existing_transaction",
    "existingTransaction",
    "data",
    "payment",
    "result",
  ]) {
    const v = root[key]
    if (v && typeof v === "object" && !Array.isArray(v)) {
      nested = v as VerifyResultRow
      break
    }
  }

  const detail = root.detail
  if (!nested && detail && typeof detail === "object" && !Array.isArray(detail)) {
    const detailMap = detail as VerifyResultRow
    for (const key of [
      "transaction",
      "existing_transaction",
      "existingTransaction",
      "data",
    ]) {
      const v = detailMap[key]
      if (v && typeof v === "object" && !Array.isArray(v)) {
        nested = v as VerifyResultRow
        break
      }
    }
    if (!nested && mapLooksLikeTransaction(detailMap)) {
      nested = detailMap
    }
  }

  if (nested) return { ...root, ...nested }
  if (mapLooksLikeTransaction(root)) return root
  return Object.keys(root).length > 0 ? root : null
}

function pickString(data: VerifyResultRow | null, keys: string[]): string {
  if (!data) return ""
  for (const key of keys) {
    const v = data[key]
    if (v == null || v === "") continue
    if (typeof v === "object") continue
    const s = String(v).trim()
    if (s) return s
  }
  return ""
}

export type ParsedVerifyResult = {
  raw: VerifyResultRow
  referenceNumber: string
  amount: string
  currency: string
  amountLabel: string
  status: string
  statusLabel: string
  tone: "success" | "error" | "pending" | "neutral"
  senderName: string
  senderAccount: string
  receiverName: string
  receiverAccount: string
  errorMessage: string
  transactionId: string
  receiptUrl: string
}

function formatStatusLabel(status: string): string {
  const s = status.toLowerCase()
  if (!s) return "Verification result"
  if (
    s.includes("verified") ||
    s === "success" ||
    s === "completed" ||
    s === "successful"
  ) {
    return "Payment verified"
  }
  if (
    s.includes("failed") ||
    s.includes("error") ||
    s.includes("declined") ||
    s.includes("rejected")
  ) {
    return "Verification failed"
  }
  if (s.includes("pending") || s.includes("processing")) {
    return "Verification pending"
  }
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function resolveTone(status: string): ParsedVerifyResult["tone"] {
  const s = status.toLowerCase()
  if (!s) return "neutral"
  if (
    s.includes("verified") ||
    s === "success" ||
    s === "completed" ||
    s === "successful"
  ) {
    return "success"
  }
  if (
    s.includes("failed") ||
    s.includes("error") ||
    s.includes("declined") ||
    s.includes("rejected") ||
    s.includes("unverified")
  ) {
    return "error"
  }
  if (s.includes("pending") || s.includes("processing")) {
    return "pending"
  }
  return "neutral"
}

function formatAmount(amount: string, currency: string): string {
  if (!amount) return ""
  const n = Number.parseFloat(amount.replace(/,/g, ""))
  const formatted = Number.isFinite(n)
    ? n.toLocaleString(undefined, {
        minimumFractionDigits: n % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      })
    : amount
  const cur = currency.trim().toUpperCase()
  return cur ? `${formatted} ${cur}` : formatted
}

export function parseVerifyResult(raw: unknown): ParsedVerifyResult | null {
  const data = normalizeVerifyResult(raw)
  if (!data) return null

  const referenceNumber = pickString(data, [
    "reference_number",
    "referenceNumber",
    "reference",
    "payment_reference",
    "paymentReference",
    "telebirr_reference",
    "telebirr_id",
    "external_id",
  ])
  const amount = pickString(data, ["amount", "total_amount"])
  const currency = pickString(data, ["currency"]) || "ETB"
  const status = pickString(data, ["status", "transaction_status"])
  const senderName = pickString(data, ["sender_name", "payer_name"])
  const senderAccount = pickString(data, ["sender_account", "payer_account"])
  const receiverName = pickString(data, ["receiver_name", "payee_name"])
  const receiverAccount = pickString(data, [
    "receiver_account",
    "payee_account",
  ])
  const errorMessage = pickString(data, [
    "error_message",
    "errorMessage",
    "message",
    "error",
  ])
  const transactionId = pickString(data, [
    "existing_transaction_id",
    "transaction_id",
    "transactionId",
    "id",
  ])
  const receiptUrl = pickString(data, ["receipt_url", "receiptUrl"])

  const amountLabel = formatAmount(amount, currency)

  return {
    raw: data,
    referenceNumber,
    amount,
    currency,
    amountLabel,
    status,
    statusLabel: formatStatusLabel(status),
    tone: resolveTone(status),
    senderName,
    senderAccount,
    receiverName,
    receiverAccount,
    errorMessage:
      errorMessage && errorMessage !== status ? errorMessage : "",
    transactionId,
    receiptUrl,
  }
}
