import { ACTIVATION_TOKEN_STORAGE_KEY } from "@/lib/activation-redirect"
import { getSiteUrl } from "@/lib/site-url"

export const CHECKOUT_USER_ID_KEY = "tinaverify_checkout_user_id"
export const CHECKOUT_BUSINESS_ID_KEY = "tinaverify_checkout_business_id"
export const PENDING_TX_REF_KEY = "tinaverify_pending_tx_ref"

export function buildWebPaymentReturnUrl(): string {
  return `${getSiteUrl()}/payments/return`
}

export function buildWebPaymentCancelUrl(
  userId: string,
  businessId: string
): string {
  const query = new URLSearchParams({ business_id: businessId })
  return `${getSiteUrl()}/${userId}/cancel?${query.toString()}`
}

export function storeCheckoutContext(params: {
  userId: string
  businessId: string
  txRef?: string
}): void {
  if (typeof window === "undefined") return
  sessionStorage.setItem(CHECKOUT_USER_ID_KEY, params.userId)
  sessionStorage.setItem(CHECKOUT_BUSINESS_ID_KEY, params.businessId)
  if (params.txRef?.trim()) {
    sessionStorage.setItem(PENDING_TX_REF_KEY, params.txRef.trim())
  }
}

export function readCheckoutContext(): {
  userId: string | null
  businessId: string | null
  token: string | null
  pendingTxRef: string | null
} {
  if (typeof window === "undefined") {
    return {
      userId: null,
      businessId: null,
      token: null,
      pendingTxRef: null,
    }
  }
  return {
    userId: sessionStorage.getItem(CHECKOUT_USER_ID_KEY),
    businessId: sessionStorage.getItem(CHECKOUT_BUSINESS_ID_KEY),
    token: sessionStorage.getItem(ACTIVATION_TOKEN_STORAGE_KEY),
    pendingTxRef: sessionStorage.getItem(PENDING_TX_REF_KEY),
  }
}

export function buildSuccessRedirectPath(params: {
  userId: string
  businessId: string
  txRef: string
}): string {
  const query = new URLSearchParams({
    business_id: params.businessId,
    trx_ref: params.txRef,
  })
  return `/${params.userId}/success?${query.toString()}`
}
