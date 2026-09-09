const ETHIOPIA_DIAL = "+251"
const LOCAL_LENGTH = 9

export function normalizeEthiopianLocalDigits(input: string): string {
  let digits = input.replace(/\D/g, "")
  if (digits.startsWith("251")) digits = digits.slice(3)
  while (digits.startsWith("0")) digits = digits.slice(1)
  return digits
}

export function isValidEthiopianLocalPhone(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false
  const digits = normalizeEthiopianLocalDigits(trimmed)
  if (
    digits.length !== LOCAL_LENGTH ||
    !(digits.startsWith("9") || digits.startsWith("7"))
  ) {
    return false
  }
  return (
    /^\+251[79]\d{8}$/.test(trimmed) ||
    /^0[79]\d{8}$/.test(trimmed) ||
    /^[79]\d{8}$/.test(trimmed)
  )
}

export function formatE164EthiopiaPhone(input: string): string {
  const digits = normalizeEthiopianLocalDigits(input)
  if (!digits || !isValidEthiopianLocalPhone(input)) return ""
  return `${ETHIOPIA_DIAL}${digits}`
}

/** Supabase auth email when phone provider is disabled — matches mc-app. */
export function authEmailFromPhone(e164Phone: string): string {
  const digits = e164Phone.replace(/\D/g, "")
  if (!digits) return ""
  return `${digits}@gmail.com`
}

/** Digits-only recipient for SMS gateway (e.g. 251912345678). */
export function smsGatewayRecipient(raw: string): string | null {
  const digits = raw.replace(/\D/g, "")
  if (digits.length < 9) return null
  if (digits.startsWith("251") && digits.length >= 12) return digits.slice(0, 12)
  if (digits.startsWith("0") && digits.length >= 10) {
    return `251${digits.slice(1, 10)}`
  }
  if (
    digits.length === LOCAL_LENGTH &&
    (digits.startsWith("9") || digits.startsWith("7"))
  ) {
    return `251${digits}`
  }
  return digits.length >= 12 ? digits.slice(0, 12) : digits
}

/** Local 10-digit number for Chapa (`0912…` / `0712…`). */
export function formatChapaPhone(input: string): string {
  const local = normalizeEthiopianLocalDigits(input)
  if (
    local.length === LOCAL_LENGTH &&
    (local.startsWith("9") || local.startsWith("7"))
  ) {
    return `0${local}`
  }
  return ""
}

export function displayPhone(e164: string): string {
  const value = e164.trim()
  if (!value) return ""
  return value.startsWith("+") ? value : `+${value}`
}

