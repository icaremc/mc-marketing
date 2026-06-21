/** OpenAPI `BankNameEnum` — same values as the mobile app and backend. */
export const ALLOWED_BANK_NAMES = [
  "CBE",
  "DASHEN",
  "AWASH",
  "ABYSINIA",
  "TELEBIRR",
  "CBEBIRR",
] as const

export type AllowedBankName = (typeof ALLOWED_BANK_NAMES)[number]

export const DEFAULT_BANK_NAME: AllowedBankName = "CBE"
