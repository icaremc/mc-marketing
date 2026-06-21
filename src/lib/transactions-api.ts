import { apiUrl } from "@/lib/api-backend"
import { authHeaders } from "@/lib/api-auth"
import { parseApiError } from "@/lib/api-errors"

export type TransactionRow = Record<string, unknown>

function toIsoStart(date: string): string {
  const v = date.trim()
  if (!v) return v
  if (v.includes("T")) return v.endsWith("Z") || v.includes("+") ? v : `${v}Z`
  return `${v}T00:00:00Z`
}

function toIsoEnd(date: string): string {
  const v = date.trim()
  if (!v) return v
  if (v.includes("T")) return v.endsWith("Z") || v.includes("+") ? v : `${v}Z`
  return `${v}T23:59:59Z`
}

export function defaultDateRange(): { start: string; end: string } {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  }
}

export async function listBusinessTransactions(
  accessToken: string,
  businessId: string,
  params: {
    startDate: string
    endDate: string
    createdBy?: string
  }
): Promise<TransactionRow[]> {
  const query = new URLSearchParams({
    start_date: toIsoStart(params.startDate),
    end_date: toIsoEnd(params.endDate),
  })
  if (params.createdBy?.trim()) {
    query.set("created_by", params.createdBy.trim())
  }

  const response = await fetch(
    `${apiUrl(`/api/v1/transactions/business/${encodeURIComponent(businessId)}`)}?${query}`,
    { headers: authHeaders(accessToken), cache: "no-store" }
  )

  if (!response.ok) {
    throw new Error(parseApiError(response.status, await response.text()))
  }

  const data = (await response.json()) as unknown
  if (!Array.isArray(data)) return []
  return data.filter(
    (row): row is TransactionRow =>
      typeof row === "object" && row !== null && !Array.isArray(row)
  )
}

export function transactionAmount(row: TransactionRow): number {
  const raw =
    row.amount ?? row.total_amount ?? row.transaction_amount ?? row.value
  const n = typeof raw === "number" ? raw : Number.parseFloat(String(raw ?? ""))
  return Number.isFinite(n) ? n : 0
}

export function transactionStatus(row: TransactionRow): string {
  return (
    row.status?.toString() ??
    row.payment_status?.toString() ??
    ""
  ).toLowerCase()
}

export function computeTransactionStats(rows: TransactionRow[]) {
  let totalAmount = 0
  let successCount = 0
  for (const row of rows) {
    totalAmount += transactionAmount(row)
    const status = transactionStatus(row)
    if (status === "success" || status === "verified" || status === "completed") {
      successCount += 1
    }
  }
  const count = rows.length
  const successRate = count > 0 ? Math.round((successCount / count) * 100) : 0
  return { count, totalAmount, successCount, successRate }
}
