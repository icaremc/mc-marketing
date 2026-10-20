import { readFile } from "node:fs/promises"
import path from "node:path"

type LmsPoint = { given: number; l: number; m: number; s: number }
type Sex = "male" | "female"
type Indicator = "wfa" | "hfa"

let rawCache: Record<string, unknown> | null = null

async function loadTables() {
  if (rawCache) return rawCache
  const file = path.join(process.cwd(), "public", "who_lms.json")
  const text = await readFile(file, "utf8")
  rawCache = JSON.parse(text) as Record<string, unknown>
  return rawCache
}

function table(indicator: Indicator, sex: Sex): LmsPoint[] {
  const raw = rawCache
  if (!raw) return []
  const block = raw[indicator]
  if (!block || typeof block !== "object") return []
  const list = (block as Record<string, unknown>)[sex]
  if (!Array.isArray(list)) return []
  const out: LmsPoint[] = []
  for (const row of list) {
    if (!Array.isArray(row) || row.length < 4) continue
    out.push({
      given: Number(row[0]),
      l: Number(row[1]),
      m: Number(row[2]),
      s: Number(row[3]),
    })
  }
  return out
}

function interpolate(points: LmsPoint[], given: number): LmsPoint | null {
  if (points.length === 0) return null
  const minG = points[0].given
  const maxG = points[points.length - 1].given
  if (given < minG || given > maxG) return null
  if (points.length === 1 || given === minG) return points[0]
  if (given === maxG) return points[points.length - 1]
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]
    const b = points[i + 1]
    if (given >= a.given && given <= b.given) {
      if (b.given === a.given) return a
      const t = (given - a.given) / (b.given - a.given)
      return {
        given,
        l: a.l + (b.l - a.l) * t,
        m: a.m + (b.m - a.m) * t,
        s: a.s + (b.s - a.s) * t,
      }
    }
  }
  return null
}

function zScore(measurement: number, l: number, m: number, s: number) {
  if (measurement <= 0 || m <= 0 || s <= 0) return null
  if (Math.abs(l) < 1e-9) return Math.log(measurement / m) / s
  return (Math.pow(measurement / m, l) - 1) / (l * s)
}

function valueAtZ(z: number, l: number, m: number, s: number) {
  if (m <= 0 || s <= 0) return null
  if (Math.abs(l) < 1e-9) return m * Math.exp(s * z)
  const inside = 1 + l * s * z
  if (inside <= 0) return null
  return m * Math.pow(inside, 1 / l)
}

export async function ensureWhoLoaded() {
  await loadTables()
}

export function whoZ(
  indicator: Indicator,
  sex: Sex,
  given: number,
  measurement: number,
) {
  const lms = interpolate(table(indicator, sex), given)
  if (!lms) return null
  return zScore(measurement, lms.l, lms.m, lms.s)
}

export function whoBand(indicator: Indicator, sex: Sex, given: number) {
  const lms = interpolate(table(indicator, sex), given)
  if (!lms) return { low: null as number | null, median: null as number | null, high: null as number | null }
  return {
    low: valueAtZ(-2, lms.l, lms.m, lms.s),
    median: lms.m,
    high: valueAtZ(2, lms.l, lms.m, lms.s),
  }
}
