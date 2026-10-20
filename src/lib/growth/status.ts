import { ensureWhoLoaded, whoBand, whoZ } from "@/lib/growth/who"

export type GrowthLevel =
  | "normal"
  | "underweight"
  | "stunting"
  | "overweight"
  | "high"
  | "unknown"

export type GrowthMetric = {
  level: GrowthLevel
  label: string
  isConcern: boolean
  value: number
  zScore: number | null
}

const LABELS: Record<GrowthLevel, string> = {
  normal: "Normal",
  underweight: "Underweight",
  stunting: "Stunting",
  overweight: "Overweight",
  high: "Above range",
  unknown: "No reference",
}

function fromZ(
  z: number | null,
  value: number,
  belowNeg2: GrowthLevel,
  abovePos2: GrowthLevel,
): GrowthMetric {
  if (z == null) {
    return { level: "unknown", label: LABELS.unknown, isConcern: false, value, zScore: null }
  }
  let level: GrowthLevel = "normal"
  if (z < -2) level = belowNeg2
  else if (z > 2) level = abovePos2
  return {
    level,
    label: LABELS[level],
    isConcern: level !== "normal" && level !== "unknown",
    value,
    zScore: z,
  }
}

export async function weightForAge(
  sex: "male" | "female",
  ageMonths: number,
  weightKg: number,
): Promise<GrowthMetric> {
  await ensureWhoLoaded()
  const z = whoZ("wfa", sex, ageMonths, weightKg)
  whoBand("wfa", sex, ageMonths)
  return fromZ(z, weightKg, "underweight", "overweight")
}

export async function heightForAge(
  sex: "male" | "female",
  ageMonths: number,
  heightCm: number,
): Promise<GrowthMetric> {
  await ensureWhoLoaded()
  const z = whoZ("hfa", sex, ageMonths, heightCm)
  return fromZ(z, heightCm, "stunting", "high")
}

/** Flutter EN clinical recs for home advice box (young + older condensed). */
export function adviceFor(level: GrowthLevel, metric: "weight" | "height", ageMonths: number) {
  const young = ageMonths < 6
  if (metric === "weight") {
    if (level === "overweight") {
      return young
        ? "Discuss pregnancy weight gain and blood sugar with a health worker. Do not restrict the newborn’s milk feeds; continue breastfeeding or prescribed feeds as advised."
        : "Focus on balanced meals, limit sugary drinks and ultra-processed snacks, encourage daily active play, and review growth with a health worker."
    }
    if (level === "underweight") {
      return young
        ? "Mothers can reduce risks by attending regular prenatal care, eating a balanced diet, avoiding harmful substances, and managing chronic conditions under medical supervision."
        : "Offer frequent, nutrient-rich meals and snacks; continue breastfeeding if still nursing; treat illness early; and see a health worker for assessment and follow-up."
    }
  }
  if (metric === "height") {
    if (level === "stunting") {
      return young
        ? "Mothers are advised to maintain good prenatal care, balanced nutrition, and avoid harmful substances to support fetal growth. Recheck length and discuss with a health worker."
        : "Improve diet quality (protein, micronutrients), prevent and treat infections, and get a clinical assessment for growth and development."
    }
    if (level === "high") {
      return "Usually no action is needed if the child is well. Ask a health worker if height rose very suddenly or other symptoms appear."
    }
  }
  return null
}
