import {
  fetchChildMeasurements,
  fetchChildMilestones,
  fetchChildren,
  fetchChildVaccines,
  fetchGrowthPeriods,
  fetchVaccineSchedule,
  num,
  str,
  type Child,
} from "@/lib/api/children"
import { adviceFor, heightForAge, weightForAge, type GrowthMetric } from "@/lib/growth/status"
import { objectFrom } from "@/lib/api/parse"

export type HomeGrowthAdvice = { metricLabel: string; text: string }

export type HomeBabyHealth = {
  child: Child
  weight: GrowthMetric | null
  height: GrowthMetric | null
  weightLabel: string | null
  heightLabel: string | null
  needsAttention: boolean
  advice: HomeGrowthAdvice[]
  milestones: {
    hasMissed: boolean
    alertText: string | null
    bullets: string[]
    emptyText: string
  }
  vaccines: {
    show: boolean
    title: string
    names: string
    urgent: boolean
  }
}

function ageMonths(birthDate: string, at = new Date()) {
  const birth = new Date(birthDate)
  if (Number.isNaN(birth.getTime())) return null
  const days = (at.getTime() - birth.getTime()) / 86_400_000
  return days / 30.4375
}

function ageDays(birthDate: string) {
  const birth = new Date(birthDate)
  if (Number.isNaN(birth.getTime())) return 0
  return Math.floor((Date.now() - birth.getTime()) / 86_400_000)
}

function sexOf(child: Child): "male" | "female" {
  return child.gender.toLowerCase().startsWith("f") ? "female" : "male"
}

function latestMeasurement(rows: Record<string, unknown>[]) {
  if (rows.length === 0) return null
  const sorted = [...rows].sort((a, b) => {
    const da = Date.parse(str(a, "measured_at") || str(a, "created_at") || "0")
    const db = Date.parse(str(b, "measured_at") || str(b, "created_at") || "0")
    return da - db
  })
  return sorted[sorted.length - 1]
}

export async function buildHomeBabyHealth(): Promise<HomeBabyHealth | null> {
  const children = await fetchChildren()
  const child = children.find((c) => c.isActive) ?? children[0]
  if (!child) return null

  const [measurements, milestones, vaccines, schedule, periods] =
    await Promise.all([
      fetchChildMeasurements(child.id),
      fetchChildMilestones(child.id),
      fetchChildVaccines(child.id),
      fetchVaccineSchedule(),
      fetchGrowthPeriods(),
    ])

  const latest = latestMeasurement(measurements)
  const months = ageMonths(child.birthDate)
  const sex = sexOf(child)
  let weight: GrowthMetric | null = null
  let height: GrowthMetric | null = null
  const weightKg = latest ? num(latest, "weight_kg") : null
  const heightCm = latest ? num(latest, "height_cm") : null

  if (months != null && weightKg != null) {
    weight = await weightForAge(sex, months, weightKg)
  }
  if (months != null && heightCm != null) {
    height = await heightForAge(sex, months, heightCm)
  }

  const advice: HomeGrowthAdvice[] = []
  if (months != null && weight?.isConcern) {
    const text = adviceFor(weight.level, "weight", months)
    if (text) advice.push({ metricLabel: "Weight", text })
  }
  if (months != null && height?.isConcern) {
    const text = adviceFor(height.level, "height", months)
    if (text) advice.push({ metricLabel: "Height", text })
  }

  const notYet = new Set(
    milestones
      .filter((row) => row.status === "not_yet" || row.attained === false || row.not_yet === true)
      .map((row) => str(row, "item_text") || str(row, "text") || str(row, "title"))
      .filter(Boolean),
  )

  const stageLabels: string[] = []
  const missedBullets: string[] = []
  for (const period of periods) {
    const translation = objectFrom(period.translation) ?? {}
    const title = str(translation, "title") || str(period, "title") || str(period, "label")
    if (title) stageLabels.push(title)
    const items = Array.isArray(period.items)
      ? period.items
      : Array.isArray(translation.items)
        ? translation.items
        : []
    for (const item of items) {
      if (!item || typeof item !== "object") continue
      const rec = item as Record<string, unknown>
      const text = str(rec, "text") || str(rec, "title")
      if (!text) continue
      if (notYet.has(text) || notYet.size === 0) {
        // Prefer explicit not-yet list when present
      }
    }
  }

  // Prefer API milestone rows marked not attained
  for (const row of milestones) {
    const text = str(row, "item_text") || str(row, "text") || str(row, "title") || str(row, "name")
    const missed =
      row.status === "not_yet" ||
      row.attained === false ||
      row.not_yet === true ||
      str(row, "status").toLowerCase() === "missed"
    if (missed && text) missedBullets.push(text)
  }

  const stage =
    stageLabels[0] ||
    (months != null && months < 1 ? "Newborn" : months != null ? `${Math.floor(months)} mo` : "this age")

  const hasMissed = missedBullets.length > 0
  const milestonesOut = {
    hasMissed,
    alertText: hasMissed
      ? `${missedBullets.length} milestone(s) at ${stage} not yet attained – check with a health worker if concerned`
      : null,
    bullets: (hasMissed ? missedBullets : []).slice(0, 2),
    emptyText: "Open Follow-up to track milestones for this age.",
  }

  // Vaccines: schedule vs received records
  const received = new Set(
    vaccines
      .filter((row) => row.received === true || row.is_given === true || str(row, "status").toLowerCase() === "given")
      .map((row) => (str(row, "code") || str(row, "vaccine_code") || str(row, "name")).toLowerCase()),
  )
  const days = ageDays(child.birthDate)
  const overdue: string[] = []
  const due: string[] = []
  for (const row of schedule) {
    const code = str(row, "code") || str(row, "vaccine_code")
    const name =
      str(row, "display_name") ||
      str(objectFrom(row.translation) ?? {}, "title") ||
      str(row, "name") ||
      code
    if (!name) continue
    const key = (code || name).toLowerCase()
    if (received.has(key) || received.has(name.toLowerCase())) continue
    const from =
      num(row, "eligible_from_days") ??
      num(row, "from_days") ??
      (num(row, "age_weeks") != null ? Math.round(num(row, "age_weeks")! * 7) : null)
    const until = num(row, "eligible_until_days") ?? num(row, "until_days")
    if (from == null) continue
    if (days < from) continue
    if (until != null && days > until) {
      if (days - until <= 30) overdue.push(name)
    } else {
      due.push(name)
    }
  }

  const underFive = days < 5 * 365
  const urgent = overdue.length + due.length > 0
  const vaccineTitle =
    overdue.length > 0
      ? `${overdue.length} overdue vaccine(s)`
      : due.length > 0
        ? `${due.length} vaccine(s) due now`
        : "No vaccines due right now for this age."

  return {
    child,
    weight,
    height,
    weightLabel: weightKg != null ? `${Number(weightKg).toFixed(1)} kg` : null,
    heightLabel: heightCm != null ? `${Number(heightCm).toFixed(1)} cm` : null,
    needsAttention: Boolean(weight?.isConcern || height?.isConcern),
    advice,
    milestones: milestonesOut,
    vaccines: {
      show: underFive && urgent,
      title: vaccineTitle,
      names: [...overdue, ...due].slice(0, 3).join(", "),
      urgent,
    },
  }
}
