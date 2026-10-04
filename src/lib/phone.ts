/** Phone helpers aligned with icare_mc `phone_format.dart`. */

const ETHIOPIA_DIAL = "+251"
const LOCAL_LENGTH = 9

export function normalizeEthiopianLocalDigits(input: string): string {
  let digits = input.replace(/\D/g, "")
  if (digits.startsWith("251")) digits = digits.slice(3)
  while (digits.startsWith("0")) digits = digits.slice(1)
  return digits
}

export function isValidEthiopianLocalPhone(
  value: string | null | undefined,
): boolean {
  const trimmed = (value ?? "").trim()
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

export function displayPhone(e164: string): string {
  const value = e164.trim()
  if (!value) return ""
  return value.startsWith("+") ? value : `+${value}`
}
