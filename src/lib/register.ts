import { apiUrl } from "@/lib/api-backend"
import { normalizeEthiopianPhone } from "@/lib/phone-utils"

export type RegisterPayload = {
  phoneNumber: string
  username?: string
  password: string
  referralCode?: string
  businessName: string
  branchName: string
  branchAddress: string
}

export type RegisterResult = {
  userId: string
  businessId: string
  branchId: string
  accessToken: string
}

type ApiError = Error & { statusCode?: number; isTinDuplicate?: boolean }

function parseApiError(
  statusCode: number,
  raw: string
): { message: string; isTinDuplicate: boolean } {
  let message: string | undefined
  const lower = raw.toLowerCase()

  try {
    const decoded = JSON.parse(raw) as {
      detail?: string | Array<{ msg?: string }>
      message?: string
      error?: string
    }
    const detail = decoded.detail
    if (typeof detail === "string") message = detail
    if (!message && Array.isArray(detail) && detail.length > 0) {
      const lines = detail
        .map((item) => item.msg)
        .filter((msg): msg is string => typeof msg === "string")
      if (lines.length > 0) message = lines.join("\n")
    }
    message ??= decoded.message ?? decoded.error
  } catch {
    // ignore JSON parse errors
  }

  const looksLikeHtml =
    raw.startsWith("<!doctype html") ||
    raw.startsWith("<html") ||
    raw.includes("</html>")

  if (
    statusCode >= 500 ||
    looksLikeHtml ||
    lower.includes("internal server error")
  ) {
    return {
      message:
        "Server error while creating your account. Please try again in a moment.",
      isTinDuplicate: false,
    }
  }

  if (statusCode === 403) {
    if (lower.includes("otp")) {
      return {
        message:
          message ??
          "Verify your phone number with the code we sent before finishing registration.",
        isTinDuplicate: false,
      }
    }
    return {
      message: message ?? "Not allowed. Check your details and try again.",
      isTinDuplicate: false,
    }
  }

  if (statusCode === 409 || lower.includes("already exists")) {
    const isTinDuplicate =
      lower.includes("tin") || lower.includes("tin_number")
    if (isTinDuplicate) {
      return { message: "TIN number already exists.", isTinDuplicate: true }
    }
    return {
      message: message ?? "An account with these details already exists.",
      isTinDuplicate: false,
    }
  }

  return {
    message: message ?? (raw.trim() || `Registration failed (${statusCode})`),
    isTinDuplicate: false,
  }
}

async function readApiFailure(response: Response): Promise<ApiError> {
  const raw = await response.text()
  const { message, isTinDuplicate } = parseApiError(response.status, raw)
  const error = new Error(message) as ApiError
  error.statusCode = response.status
  error.isTinDuplicate = isTinDuplicate
  return error
}

async function retry<T>(fn: () => Promise<T>, attempts = 2): Promise<T> {
  let lastError: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (i < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 450))
      }
    }
  }
  throw lastError
}

async function registerUser(payload: RegisterPayload): Promise<{
  accessToken: string
  userId: string
}> {
  const body: Record<string, unknown> = {
    phone_number: normalizeEthiopianPhone(payload.phoneNumber),
    password: payload.password.trim(),
  }

  const username = payload.username?.trim()
  if (username) body.username = username

  const referral = payload.referralCode?.trim()
  if (referral) body.referral_code = referral

  const response = await fetch(apiUrl("/api/v1/users"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  })

  if (!response.ok) throw await readApiFailure(response)

  const data = (await response.json()) as {
    access_token?: string
    user?: { id?: string }
  }

  const accessToken = data.access_token
  const userId = data.user?.id

  if (!accessToken || !userId) {
    throw new Error("Invalid response from server.")
  }

  return { accessToken, userId }
}

async function createBusiness(
  accessToken: string,
  name: string
): Promise<{ id: string }> {
  const response = await fetch(apiUrl("/api/v1/business"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      name: name.trim(),
    }),
  })

  if (!response.ok) throw await readApiFailure(response)

  const data = (await response.json()) as { id?: string }
  if (!data.id) throw new Error("Invalid business response.")
  return { id: data.id }
}

async function createBranch(
  accessToken: string,
  businessId: string,
  name: string,
  address: string
): Promise<{ id: string }> {
  const response = await fetch(apiUrl("/api/v1/branches"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      business_id: businessId,
      name: name.trim(),
      address: address.trim(),
      is_head_quarter: true,
    }),
  })

  if (!response.ok) throw await readApiFailure(response)

  const data = (await response.json()) as { id?: string }
  if (!data.id) throw new Error("Invalid branch response.")
  return { id: data.id }
}

async function deleteBusiness(
  accessToken: string,
  businessId: string
): Promise<void> {
  await fetch(apiUrl(`/api/v1/business/${encodeURIComponent(businessId)}`), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  }).catch(() => undefined)
}

async function deleteUser(accessToken: string, userId: string): Promise<void> {
  await fetch(apiUrl(`/api/v1/users/${encodeURIComponent(userId)}`), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  }).catch(() => undefined)
}

/** Mirrors Flutter `AuthController.signUp` — 3 API calls with rollback. */
export async function registerBusiness(
  payload: RegisterPayload
): Promise<RegisterResult> {
  let createdUserId: string | undefined
  let createdBusinessId: string | undefined
  let accessToken: string | undefined

  try {
    const user = await registerUser(payload)
    createdUserId = user.userId
    accessToken = user.accessToken

    const business = await retry(() =>
      createBusiness(accessToken!, payload.businessName)
    )
    createdBusinessId = business.id

    const branch = await retry(() =>
      createBranch(
        accessToken!,
        business.id,
        payload.branchName,
        payload.branchAddress
      )
    )

    return {
      userId: createdUserId,
      businessId: createdBusinessId,
      branchId: branch.id,
      accessToken: accessToken!,
    }
  } catch (error) {
    if (accessToken && createdBusinessId) {
      await deleteBusiness(accessToken, createdBusinessId)
    }
    if (accessToken && createdUserId) {
      await deleteUser(accessToken, createdUserId)
    }

    if (error instanceof Error) {
      throw error
    }

    throw new Error("Registration failed. Please try again.")
  }
}
