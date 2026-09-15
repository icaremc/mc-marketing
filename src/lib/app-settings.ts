import { getServiceSupabase, getSupabase } from "@/lib/supabase"

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value) return null
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown
      return parsed && typeof parsed === "object"
        ? (parsed as Record<string, unknown>)
        : null
    } catch {
      return null
    }
  }
  if (typeof value === "object") return value as Record<string, unknown>
  return null
}

function readString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback
}

function readBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback
}

function readNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

async function fetchAppSettingsRow(
  id: string,
): Promise<Record<string, unknown> | null> {
  // Prefer service role — payment keys are admin-managed and may be RLS-restricted.
  const supabase = getServiceSupabase() ?? getSupabase()
  if (!supabase) return null

  const { data, error } = await supabase
    .from("app_settings")
    .select("data")
    .eq("id", id)
    .maybeSingle()

  if (error || !data) {
    console.error(`[app-settings] failed to load id=${id}`, error?.message)
    return null
  }
  return asRecord(data.data)
}

export type SubscriptionPlanSettings = {
  enabled: boolean
  yearlyPrice: number
  currency: string
  durationDays: number
  requireForAppAccess: boolean
  source: "app_settings" | "defaults"
}

export async function fetchSubscriptionPlanSettings(): Promise<SubscriptionPlanSettings> {
  const defaults: SubscriptionPlanSettings = {
    enabled: true,
    yearlyPrice: 1000,
    currency: "ETB",
    durationDays: 365,
    requireForAppAccess: true,
    source: "defaults",
  }

  const raw = await fetchAppSettingsRow("subscription")
  if (!raw) return defaults

  const priceRaw = raw.yearlyPrice ?? raw.yearly_price
  const daysRaw = raw.durationDays ?? raw.duration_days
  const requireRaw = raw.requireForAppAccess ?? raw.require_for_app_access

  return {
    enabled: raw.enabled !== false,
    yearlyPrice: readNumber(priceRaw, 1000),
    currency: readString(raw.currency, "ETB") || "ETB",
    durationDays: Math.max(1, Math.trunc(readNumber(daysRaw, 365))),
    requireForAppAccess: requireRaw !== false,
    source: "app_settings",
  }
}

export type ChapaPaymentSettings = {
  name: string
  enable: boolean
  isActive: boolean
  isSandbox: boolean
  publicKey: string
  secretKey: string
  feePercent: number
}

function parseChapaBlock(raw: Record<string, unknown> | null): ChapaPaymentSettings | null {
  if (!raw) return null
  return {
    name: readString(raw.name, "Chapa") || "Chapa",
    enable: raw.enable === true,
    isActive: raw.isActive === true,
    isSandbox: raw.isSandbox === true,
    publicKey: readString(raw.publicKey),
    secretKey: readString(raw.secretKey),
    feePercent: readNumber(raw.feePercent, 3.5),
  }
}

/**
 * Overlay flavor-specific fields (matches Flutter ChapaPaymentSettings.overlay).
 * Secrets are never copied from [defaults] unless inheritKeys is true.
 */
function overlayChapa(
  defaults: ChapaPaymentSettings,
  raw: Record<string, unknown>,
  inheritKeys: boolean,
): ChapaPaymentSettings {
  const parsed = parseChapaBlock(raw) ?? defaults
  return {
    name:
      parsed.name.trim() && parsed.name !== "Chapa" ? parsed.name : defaults.name,
    enable: Object.prototype.hasOwnProperty.call(raw, "enable")
      ? parsed.enable
      : defaults.enable,
    isActive: Object.prototype.hasOwnProperty.call(raw, "isActive")
      ? parsed.isActive
      : defaults.isActive,
    isSandbox: Object.prototype.hasOwnProperty.call(raw, "isSandbox")
      ? parsed.isSandbox
      : defaults.isSandbox,
    publicKey: parsed.publicKey
      ? parsed.publicKey
      : inheritKeys
        ? defaults.publicKey
        : "",
    secretKey: parsed.secretKey
      ? parsed.secretKey
      : inheritKeys
        ? defaults.secretKey
        : "",
    feePercent:
      Object.prototype.hasOwnProperty.call(raw, "feePercent") &&
      parsed.feePercent > 0
        ? parsed.feePercent
        : defaults.feePercent,
  }
}

function isUsable(chapa: ChapaPaymentSettings): boolean {
  return (
    chapa.enable &&
    chapa.isActive &&
    chapa.publicKey.length > 0 &&
    chapa.secretKey.length > 0 &&
    !chapa.publicKey.includes("your-") &&
    !chapa.secretKey.includes("your-")
  )
}

export type ResolvedChapaConfig = ChapaPaymentSettings & {
  source: "app_settings" | "env"
}

/**
 * Production Chapa keys from admin `app_settings` id=payment.
 * Same resolution as Flutter production flavor:
 * chapaProduction ?? chapa.production (overlay) ?? legacy chapa.
 */
export async function fetchProductionChapaConfig(): Promise<ResolvedChapaConfig | null> {
  const envSecret = process.env.CHAPA_SECRET_KEY?.trim() ?? ""
  const envPublic = process.env.CHAPA_PUBLIC_KEY?.trim() ?? ""
  const envFee = Number.parseFloat(process.env.CHAPA_FEE_PERCENT ?? "")
  const envSandbox =
    (process.env.CHAPA_SANDBOX ?? "").trim().toLowerCase() === "true"

  const root = await fetchAppSettingsRow("payment")
  if (root) {
    const topChapaRaw = asRecord(root.chapa)
    const base = parseChapaBlock(topChapaRaw)
    const nestedProduction = asRecord(topChapaRaw?.production)
    const topProduction = asRecord(root.chapaProduction)

    let production: ChapaPaymentSettings | null = null
    if (topProduction) {
      production = parseChapaBlock(topProduction)
    } else if (nestedProduction && base) {
      production = overlayChapa(base, nestedProduction, true)
    } else {
      production = base
    }

    if (production && isUsable(production)) {
      return { ...production, source: "app_settings" }
    }

    // Keys present but toggled off / incomplete — try env fallback below.
    if (production && (production.publicKey || production.secretKey)) {
      console.warn(
        "[app-settings] payment.chapa found but not usable (enable/isActive/keys).",
      )
    }
  } else if (!getServiceSupabase()) {
    console.warn(
      "[app-settings] SUPABASE_SERVICE_ROLE_KEY missing — cannot read payment settings reliably.",
    )
  }

  if (envSecret && envPublic && !envSecret.includes("your-") && !envPublic.includes("your-")) {
    return {
      name: "Chapa",
      enable: true,
      isActive: true,
      isSandbox: envSandbox,
      publicKey: envPublic,
      secretKey: envSecret,
      feePercent: envFee > 0 ? envFee : 3.5,
      source: "env",
    }
  }

  return null
}

export function checkoutTotal(amount: number, feePercent: number): number {
  const fee = Math.round(amount * (feePercent / 100) * 100) / 100
  return Math.round((amount + fee) * 100) / 100
}

export function gatewayFee(amount: number, feePercent: number): number {
  return Math.round(amount * (feePercent / 100) * 100) / 100
}
