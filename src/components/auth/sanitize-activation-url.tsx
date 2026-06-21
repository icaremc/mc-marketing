"use client"

import * as React from "react"

import { storeActivationToken } from "@/lib/activation-redirect"

const SENSITIVE_PARAMS = ["token", "access_token"] as const

/**
 * Moves auth tokens from the URL into sessionStorage and strips them from the
 * address bar (history, referrers, analytics).
 */
export function SanitizeActivationUrl() {
  React.useEffect(() => {
    const url = new URL(window.location.href)
    const token =
      url.searchParams.get("token") ?? url.searchParams.get("access_token")
    if (!token?.trim()) return

    storeActivationToken(token.trim())

    for (const key of SENSITIVE_PARAMS) {
      url.searchParams.delete(key)
    }

    const next =
      url.pathname +
      (url.searchParams.toString() ? `?${url.searchParams}` : "") +
      url.hash
    window.history.replaceState({}, "", next)
  }, [])

  return null
}
