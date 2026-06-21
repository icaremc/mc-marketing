"use client"

import * as React from "react"

import { useRequireSession } from "@/store/useSession"
import {
  computeTransactionStats,
  defaultDateRange,
} from "@/lib/transactions-api"

export function useDashboardStats() {
  const session = useRequireSession()
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [stats, setStats] = React.useState({
    count: 0,
    totalAmount: 0,
    successRate: 0,
  })

  const reload = React.useCallback(async () => {
    if (!session) return
    setLoading(true)
    setError(null)
    const range = defaultDateRange()
    try {
      const response = await fetch(
        `/api/transactions?business_id=${encodeURIComponent(session.businessId)}&start_date=${range.start}&end_date=${range.end}`,
        { headers: { Authorization: `Bearer ${session.accessToken}` } }
      )
      const data = (await response.json()) as {
        transactions?: Record<string, unknown>[]
        error?: string
      }
      if (!response.ok) {
        throw new Error(data.error ?? "Could not load stats.")
      }
      const rows = data.transactions ?? []
      setStats(computeTransactionStats(rows))
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Could not load stats."
      )
    } finally {
      setLoading(false)
    }
  }, [session])

  React.useEffect(() => {
    reload()
  }, [reload])

  return { loading, error, stats, reload }
}
