import type { RegisterPayload } from "@/lib/register"

export function buildRegisterPayload(input: {
  phoneNumber: string
  password: string
  username?: string
  referralCode?: string
  businessName?: string
  branchName?: string
  branchAddress?: string
}): RegisterPayload {
  const username = input.username?.trim()
  const businessName = input.businessName?.trim() ?? ""

  return {
    phoneNumber: input.phoneNumber,
    password: input.password,
    username: username || undefined,
    referralCode: input.referralCode?.trim() || undefined,
    businessName,
    branchName: input.branchName?.trim() ?? "",
    branchAddress: input.branchAddress?.trim() ?? "",
  }
}

/** @deprecated Use buildRegisterPayload — kept for imports during transition */
export const buildDefaultRegisterPayload = buildRegisterPayload
