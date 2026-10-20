"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export function LogoutButton({
  redirectTo = "/login",
}: {
  redirectTo?: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  return (
    <button
      type="button"
      disabled={loading}
      className="w-full rounded-xl border border-border bg-card px-4 py-3 text-left text-sm font-medium text-destructive disabled:opacity-60"
      onClick={() => {
        void (async () => {
          setLoading(true)
          try {
            await fetch("/api/auth/logout", { method: "POST" })
            router.push(redirectTo)
            router.refresh()
          } finally {
            setLoading(false)
          }
        })()
      }}
    >
      {loading ? "Signing out…" : "Sign out"}
    </button>
  )
}
