import { getSupabase, isSupabaseConfigured } from "@/lib/supabase"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export type MembershipSettings = {
  enabled: boolean
  yearlyPrice: number
  currency: string
  durationDays: number
  requireForAppAccess: boolean
}

export type ChapaSettings = {
  enable: boolean
  isActive: boolean
  publicKey: string
  secretKey: string
  feePercent: number
}

const DEFAULT_MEMBERSHIP: MembershipSettings = {
  enabled: true,
  yearlyPrice: 1000,
  currency: "ETB",
  durationDays: 365,
  requireForAppAccess: true,
}

function readNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback
}

function readString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value.trim() : fallback
}

function parseData(raw: unknown): Record<string, unknown> {
  if (!raw) return {}
  if (typeof raw === "string") {
    try {
      return (JSON.parse(raw) as Record<string, unknown>) ?? {}
    } catch {
      return {}
    }
  }
  if (typeof raw === "object") return raw as Record<string, unknown>
  return {}
}

export function parseMembershipSettings(raw: unknown): MembershipSettings {
  const data = parseData(raw)
  return {
    enabled: readBoolean(data.enabled, DEFAULT_MEMBERSHIP.enabled),
    yearlyPrice: readNumber(data.yearlyPrice ?? data.yearly_price, DEFAULT_MEMBERSHIP.yearlyPrice),
    currency: readString(data.currency, DEFAULT_MEMBERSHIP.currency).toUpperCase() || "ETB",
    durationDays: Math.max(
      1,
      Math.round(readNumber(data.durationDays ?? data.duration_days, DEFAULT_MEMBERSHIP.durationDays)),
    ),
    requireForAppAccess: readBoolean(
      data.requireForAppAccess ?? data.require_for_app_access,
      DEFAULT_MEMBERSHIP.requireForAppAccess,
    ),
  }
}

export async function fetchMembershipSettings(): Promise<MembershipSettings> {
  if (!isSupabaseConfigured()) return { ...DEFAULT_MEMBERSHIP }
  const client = getSupabase()
  if (!client) return { ...DEFAULT_MEMBERSHIP }
  try {
    const { data } = await client
      .from("app_settings")
      .select("data")
      .eq("id", "subscription")
      .maybeSingle()
    return parseMembershipSettings(data?.data)
  } catch {
    return { ...DEFAULT_MEMBERSHIP }
  }
}

const DEFAULT_CHAPA_FEE_PERCENT = 2.5

function resolveChapaFromSettings(raw: unknown): ChapaSettings | null {
  const root = parseData(raw)
  const chapa = parseData(root.chapa)
  if (Object.keys(chapa).length === 0) return null

  // Marketing site is live — use production Chapa keys. Override with CHAPA_SANDBOX=true for test keys.
  const useSandbox =
    process.env.CHAPA_SANDBOX === "true" || process.env.CHAPA_SANDBOX === "1"

  const flavor = parseData(useSandbox ? chapa.staging : chapa.production)
  const secretKey =
    readString(flavor.secretKey, "") || readString(chapa.secretKey, "")
  const publicKey =
    readString(flavor.publicKey, "") || readString(chapa.publicKey, "")
  if (!secretKey) return null

  // Prefer flavor fee, then top-level; default 2.5% (Chapa Ethiopia rate used by the app).
  const feePercent = readNumber(
    flavor.feePercent ?? chapa.feePercent,
    DEFAULT_CHAPA_FEE_PERCENT,
  )

  return {
    enable: readBoolean(
      flavor.enable ?? chapa.enable,
      true,
    ),
    isActive: readBoolean(
      flavor.isActive ?? chapa.isActive,
      true,
    ),
    publicKey,
    secretKey,
    feePercent: feePercent > 0 ? feePercent : DEFAULT_CHAPA_FEE_PERCENT,
  }
}

export async function fetchChapaSettings(): Promise<ChapaSettings | null> {
  const envSecret = process.env.CHAPA_SECRET_KEY?.trim()
  const envPublic = process.env.CHAPA_PUBLIC_KEY?.trim()
  if (envSecret) {
    return {
      enable: true,
      isActive: true,
      publicKey: envPublic ?? "",
      secretKey: envSecret,
      feePercent:
        Number.parseFloat(process.env.CHAPA_FEE_PERCENT ?? "") ||
        DEFAULT_CHAPA_FEE_PERCENT,
    }
  }

  const admin = getSupabaseAdmin()
  if (!admin) return null
  try {
    const { data } = await admin
      .from("app_settings")
      .select("data")
      .eq("id", "payment")
      .maybeSingle()
    return resolveChapaFromSettings(data?.data)
  } catch {
    return null
  }
}

export function checkoutTotal(baseAmount: number, feePercent: number): number {
  return Math.round((baseAmount + (baseAmount * feePercent) / 100) * 100) / 100
}
