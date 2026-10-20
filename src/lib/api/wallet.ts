import { authedFetch } from "@/lib/api/authed"
import { listFromBody, num, str } from "@/lib/api/list"
import { objectFrom } from "@/lib/api/parse"

export async function fetchPatientWallet() {
  const result = await authedFetch("/wallet")
  if (!result.ok) return null
  const root = objectFrom(result.data) ?? {}
  const wallet = objectFrom(root.wallet) ?? root
  const transactions = listFromBody(
    { data: root.transactions ?? listFromBody(result.data, "transactions") },
  )
  return {
    balance: num(wallet, "balance") ?? num(wallet, "available_balance") ?? 0,
    currency: str(wallet, "currency", "ETB"),
    transactions: transactions.map((row) => ({
      id: str(row, "id"),
      amount: num(row, "amount") ?? 0,
      type: str(row, "type") || str(row, "direction"),
      note: str(row, "note") || str(row, "description"),
      createdAt: str(row, "created_at"),
    })),
  }
}
