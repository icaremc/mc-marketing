import { authedFetch } from "@/lib/api/authed"
import { backendFetch } from "@/lib/backend"
import { resolveMediaUrl } from "@/lib/api/media"
import { listFromBody, num, str } from "@/lib/api/list"

export type Child = {
  id: string
  name: string
  birthDate: string
  gender: string
  isActive: boolean
  photoUrl: string
  ageLabel: string
}

function ageLabel(birthDate: string): string {
  const birth = new Date(birthDate)
  if (Number.isNaN(birth.getTime())) return ""
  const months =
    (Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30.4375)
  if (months < 1) return `${Math.max(0, Math.floor(months * 30))}d`
  if (months < 24) return `${Math.floor(months)} mo`
  return `${Math.floor(months / 12)}y ${Math.floor(months % 12)}mo`
}

export function parseChild(row: Record<string, unknown>): Child | null {
  const birthDate = str(row, "birth_date")
  if (!birthDate) return null
  const id = str(row, "id") || str(row, "local_id")
  return {
    id,
    name: str(row, "name") || "Child",
    birthDate,
    gender: str(row, "gender", "male"),
    isActive: row.is_active === true,
    photoUrl: resolveMediaUrl(str(row, "photo_url") || undefined),
    ageLabel: ageLabel(birthDate),
  }
}

export async function fetchChildren(): Promise<Child[]> {
  const result = await authedFetch("/children")
  if (!result.ok) return []
  return listFromBody(result.data, "children")
    .map(parseChild)
    .filter((c): c is Child => !!c?.id)
}

export async function fetchChildMeasurements(childId?: string) {
  const result = await authedFetch("/child-measurements", {
    searchParams: childId ? { child_id: childId } : undefined,
  })
  if (!result.ok) return [] as Record<string, unknown>[]
  return listFromBody(result.data, "measurements")
}

export async function fetchChildMilestones(childId?: string) {
  const result = await authedFetch("/child-milestones", {
    searchParams: childId ? { child_id: childId } : undefined,
  })
  if (!result.ok) return [] as Record<string, unknown>[]
  return listFromBody(result.data, "milestones")
}

export async function fetchChildVaccines(childId?: string) {
  const result = await authedFetch("/child-vaccines", {
    searchParams: childId ? { child_id: childId } : undefined,
  })
  if (!result.ok) return [] as Record<string, unknown>[]
  return listFromBody(result.data, "vaccines")
}

export async function fetchChildFollowups(childId?: string) {
  const result = await authedFetch("/child-followups", {
    searchParams: childId ? { child_id: childId } : undefined,
  })
  if (!result.ok) return [] as Record<string, unknown>[]
  return listFromBody(result.data, "followups")
}

export async function fetchVaccineSchedule(lang = "en") {
  const result = await backendFetch("/cms/vaccine-schedule", {
    searchParams: { lang },
  })
  if (!result.ok) return [] as Record<string, unknown>[]
  return listFromBody(result.data)
}

export async function fetchGrowthPeriods(lang = "en") {
  const result = await backendFetch("/cms/child-growth-periods", {
    searchParams: { lang },
  })
  if (!result.ok) return [] as Record<string, unknown>[]
  return listFromBody(result.data)
}

export { num, str }
