export function isValidEthiopianPhone(input: string): boolean {
  const v = input.replace(/\s/g, "").trim()
  const local = /^(09|07)\d{8}$/
  const intl = /^\+251(9|7)\d{8}$/
  return local.test(v) || intl.test(v)
}

/** Phone, OTP, and password — used on final submit (confirm already checked on step 2). */
export function validateRegisterAccountFields(payload: {
  phoneNumber: string
  password: string
  otpVerified?: boolean
}): string | null {
  const phone = payload.phoneNumber.trim()
  if (!phone) return "Phone number is required."
  if (!isValidEthiopianPhone(phone)) {
    return "Enter a valid Ethiopian phone: 09XXXXXXXX, 07XXXXXXXX, or +2519XXXXXXXX / +2517XXXXXXXX."
  }

  if (payload.otpVerified !== true) {
    return "Verify your phone number with the code we sent before continuing."
  }

  const password = payload.password.trim()
  if (!password) return "Password is required."
  if (password.length < 6) return "Password must be at least 6 characters."

  return null
}

/** Step 2 only — includes confirm-password match. */
export function validateRegisterAccountStep(payload: {
  phoneNumber: string
  password: string
  confirmPassword?: string
  otpVerified?: boolean
}): string | null {
  const base = validateRegisterAccountFields(payload)
  if (base) return base

  const password = payload.password.trim()
  const confirm = payload.confirmPassword?.trim() ?? ""
  if (!confirm) return "Please confirm your password."
  if (confirm !== password) return "Passwords do not match."

  return null
}

export function validateRegisterBusinessStep(payload: {
  businessName?: string
  branchName?: string
  branchAddress?: string
}): string | null {
  const businessName = payload.businessName?.trim() ?? ""
  if (!businessName) return "Business name is required."
  if (businessName.length < 2) return "Business name is too short."

  const branchName = payload.branchName?.trim() ?? ""
  if (!branchName) return "Branch name is required."
  if (branchName.length < 2) return "Branch name is too short."

  const branchAddress = payload.branchAddress?.trim() ?? ""
  if (!branchAddress) return "Branch address is required."

  return null
}

export function validateRegisterPayload(payload: {
  phoneNumber: string
  password: string
  otpVerified?: boolean
  businessName?: string
  branchName?: string
  branchAddress?: string
}): string | null {
  return (
    validateRegisterAccountFields(payload) ??
    validateRegisterBusinessStep(payload)
  )
}
