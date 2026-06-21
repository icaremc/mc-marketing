/** Same rules as Flutter `PhoneUtils.normalizeEthiopianPhone`. */
export function normalizeEthiopianPhone(input: string): string {
  const v = input.replace(/\s/g, "").trim()
  if (!v) return v
  if (v.startsWith("+251")) return v
  if ((v.startsWith("09") || v.startsWith("07")) && v.length === 10) {
    return `+251${v.slice(1)}`
  }
  return v
}
