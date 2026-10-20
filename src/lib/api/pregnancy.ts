import { authedFetch } from "@/lib/api/authed"
import { backendFetch } from "@/lib/backend"
import { resolveMediaUrl } from "@/lib/api/media"
import { listFromBody, num, str } from "@/lib/api/list"
import { objectFrom } from "@/lib/api/parse"

export type Pregnancy = {
  id: string
  lmpDate: string
  edd: string | null
  status: string
  weekNumber: number
  dayNumber: number
  weekDays: number
  trimester: number
}

export type CmsWeek = {
  id: string
  weekNumber: number
  trimester: number
  title: string
  summary: string
  imageUrl: string
}

function gestationFromLmp(lmpDate: string) {
  const lmp = new Date(lmpDate)
  if (Number.isNaN(lmp.getTime())) {
    return { weekNumber: 0, dayNumber: 0, weekDays: 0, trimester: 1 }
  }
  const dayNumber = Math.max(
    1,
    Math.floor((Date.now() - lmp.getTime()) / 86_400_000) + 1,
  )
  const weekNumber = Math.max(1, Math.min(42, Math.floor((dayNumber - 1) / 7) + 1))
  // Flutter: currentDayInWeek = display.days + 1 → 1…7
  const weekDays = ((dayNumber - 1) % 7) + 1
  const trimester = weekNumber <= 13 ? 1 : weekNumber <= 27 ? 2 : 3
  return { weekNumber, dayNumber, weekDays, trimester }
}

export function parsePregnancy(row: Record<string, unknown>): Pregnancy | null {
  const lmp = str(row, "lmp_date") || str(row, "lnmp")
  if (!lmp) return null
  const g = gestationFromLmp(lmp)
  return {
    id: str(row, "id"),
    lmpDate: lmp,
    edd: str(row, "edd") || null,
    status: str(row, "status", "active"),
    ...g,
  }
}

export async function fetchPregnancies(): Promise<Pregnancy[]> {
  const result = await authedFetch("/pregnancies")
  if (!result.ok) return []
  return listFromBody(result.data, "pregnancies")
    .map(parsePregnancy)
    .filter((p): p is Pregnancy => !!p?.id)
}

export async function fetchActivePregnancy(): Promise<Pregnancy | null> {
  const list = await fetchPregnancies()
  return (
    list.find((p) => p.status.toLowerCase() === "active") ?? list[0] ?? null
  )
}

export async function fetchPregnancyWeeks(lang = "en"): Promise<CmsWeek[]> {
  const result = await backendFetch("/cms/pregnancy-weeks", {
    searchParams: { lang },
  })
  if (!result.ok) return []
  return listFromBody(result.data)
    .map((row) => {
      const translation = objectFrom(row.translation) ?? {}
      return {
        id: str(row, "id"),
        weekNumber: num(row, "week_number") ?? 0,
        trimester: num(row, "trimester") ?? 1,
        title: str(translation, "title") || `Week ${num(row, "week_number") ?? ""}`,
        summary:
          str(translation, "summary") ||
          str(translation, "short_description") ||
          str(translation, "description"),
        imageUrl: resolveMediaUrl(str(row, "image_url") || undefined),
      }
    })
    .filter((w) => w.weekNumber > 0)
    .sort((a, b) => a.weekNumber - b.weekNumber)
}

export async function fetchPregnancyLogs(pregnancyId?: string) {
  const result = await authedFetch("/pregnancy-logs", {
    searchParams: pregnancyId ? { pregnancy_id: pregnancyId } : undefined,
  })
  if (!result.ok) return [] as Record<string, unknown>[]
  return listFromBody(result.data, "logs")
}
