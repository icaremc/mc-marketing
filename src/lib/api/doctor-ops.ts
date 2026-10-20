import { authedFetch } from "@/lib/api/authed"
import { resolveMediaUrl } from "@/lib/api/media"
import { listFromBody, num, str } from "@/lib/api/list"
import { objectFrom } from "@/lib/api/parse"

export type DoctorService = {
  id: string
  name: string
  description: string
  price: number
  currency: string
  isActive: boolean
  durationMinutes: number
}

export type DoctorSlot = {
  id: string
  dayOfWeek: number | null
  startTime: string
  endTime: string
  date: string | null
}

export function parseService(row: Record<string, unknown>): DoctorService {
  return {
    id: str(row, "id"),
    name: str(row, "name") || "Service",
    description: str(row, "description"),
    price: num(row, "price") ?? 0,
    currency: str(row, "currency", "ETB"),
    isActive: row.is_active !== false,
    durationMinutes: num(row, "duration_minutes") ?? 30,
  }
}

export async function fetchDoctorServices() {
  const result = await authedFetch("/doctor/services")
  if (!result.ok) return [] as DoctorService[]
  return listFromBody(result.data, "services")
    .map(parseService)
    .filter((s) => s.id)
}

export async function fetchDoctorSlots() {
  const result = await authedFetch("/doctor/slots")
  if (!result.ok) return [] as DoctorSlot[]
  return listFromBody(result.data, "slots").map((row) => ({
    id: str(row, "id"),
    dayOfWeek: num(row, "day_of_week"),
    startTime: str(row, "start_time") || str(row, "from_time"),
    endTime: str(row, "end_time") || str(row, "to_time"),
    date: str(row, "date") || null,
  }))
}

export async function fetchDoctorPayoutMethods() {
  const result = await authedFetch("/doctor/payout-methods")
  if (!result.ok) return [] as Record<string, unknown>[]
  return listFromBody(result.data, "payout_methods")
}

export async function fetchDoctorPayouts() {
  const result = await authedFetch("/doctor/payouts")
  if (!result.ok) return [] as Record<string, unknown>[]
  return listFromBody(result.data, "payouts")
}

export async function fetchDoctorReferrals() {
  const result = await authedFetch("/doctor/referrals")
  if (!result.ok) return [] as Record<string, unknown>[]
  return listFromBody(result.data, "referrals")
}

export async function fetchDoctorHospitals() {
  const result = await authedFetch("/doctor/hospitals")
  if (!result.ok) return [] as Record<string, unknown>[]
  return listFromBody(result.data, "hospitals")
}

export async function fetchDoctorReviews() {
  const result = await authedFetch("/doctor/reviews")
  if (!result.ok) return [] as Record<string, unknown>[]
  return listFromBody(result.data, "reviews")
}

export async function fetchDoctorWalletHistory() {
  const wallet = await authedFetch("/doctor/wallet")
  const payouts = await fetchDoctorPayouts()
  const root = objectFrom(wallet.ok ? wallet.data : null) ?? {}
  return {
    balance: num(root, "balance") ?? num(root, "available_balance") ?? 0,
    currency: str(root, "currency", "ETB"),
    payouts: payouts.map((row) => ({
      id: str(row, "id"),
      amount: num(row, "amount") ?? 0,
      status: str(row, "status"),
      createdAt: str(row, "created_at"),
    })),
  }
}

export { resolveMediaUrl, str, num }
