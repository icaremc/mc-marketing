export const ACTIVATION_TOKEN_STORAGE_KEY = "tinaverify_activation_token"

export function buildActivationPath(params: {
  userId: string
  businessId: string
  /** @deprecated Store with storeActivationToken() — never put tokens in URLs */
  token?: string
}): string {
  const query = new URLSearchParams({
    business_id: params.businessId,
  })
  return `/${params.userId}?${query.toString()}`
}

export function storeActivationToken(token: string): void {
  if (typeof window === "undefined") return
  sessionStorage.setItem(ACTIVATION_TOKEN_STORAGE_KEY, token)
}

export function buildLoginPath(params?: {
  userId?: string
  businessId?: string
  registered?: boolean
  phone?: string
}): string {
  const query = new URLSearchParams()
  if (params?.userId) query.set("userId", params.userId)
  if (params?.businessId) query.set("business_id", params.businessId)
  if (params?.registered) query.set("registered", "1")
  if (params?.phone?.trim()) query.set("phone", params.phone.trim())
  const qs = query.toString()
  return qs ? `/login?${qs}` : "/login"
}

export function buildSuccessPath(params: {
  userId: string
  businessId: string
  alreadyActive?: boolean
}): string {
  const query = new URLSearchParams({
    business_id: params.businessId,
  })
  if (params.alreadyActive) query.set("already_active", "1")
  return `/${params.userId}/success?${query.toString()}`
}

export function buildDashboardPath(): string {
  return "/dashboard"
}
