import { createClient, type SupabaseClient } from "@supabase/supabase-js"

import { siteConfig } from "@/lib/brand"
import { getServiceSupabase, getSupabase } from "@/lib/supabase"

export const ACTIVATION_TOKEN_KEY = "icare_mc_activation_token"

export function appLoginDeepLink(): string {
  return siteConfig.appLoginDeepLink
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim(),
  )
}

export function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization")?.trim() ?? ""
  if (!header.toLowerCase().startsWith("bearer ")) return null
  const token = header.slice(7).trim()
  return token.length > 20 ? token : null
}

/** Authed Supabase client for a user access token (server routes). */
export function supabaseWithToken(accessToken: string): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  if (!url || !anonKey) return null
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

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

export type MembershipPlan = {
  enabled: boolean
  yearlyPrice: number
  currency: string
  durationDays: number
  feePercent: number
}

export async function fetchMembershipPlan(): Promise<MembershipPlan> {
  const chapa = await fetchChapaConfig()
  const defaults: MembershipPlan = {
    enabled: true,
    yearlyPrice: 1000,
    currency: "ETB",
    durationDays: 365,
    feePercent: chapa?.feePercent ?? 3.5,
  }

  const supabase = getServiceSupabase() ?? getSupabase()
  if (!supabase) return defaults

  const { data, error } = await supabase
    .from("app_settings")
    .select("data")
    .eq("id", "subscription")
    .maybeSingle()

  if (error || !data?.data) return defaults
  const raw = asRecord(data.data)
  if (!raw) return defaults

  const priceRaw = raw.yearlyPrice ?? raw.yearly_price
  const daysRaw = raw.durationDays ?? raw.duration_days

  return {
    enabled: raw.enabled !== false,
    yearlyPrice:
      typeof priceRaw === "number"
        ? priceRaw
        : Number.parseFloat(String(priceRaw ?? "")) || 1000,
    currency:
      typeof raw.currency === "string" && raw.currency.trim()
        ? raw.currency.trim()
        : "ETB",
    durationDays:
      typeof daysRaw === "number"
        ? daysRaw
        : Number.parseInt(String(daysRaw ?? ""), 10) || 365,
    feePercent: chapa?.feePercent ?? 3.5,
  }
}

export type ChapaConfig = {
  enable: boolean
  isActive: boolean
  isSandbox: boolean
  publicKey: string
  secretKey: string
  feePercent: number
}

/**
 * Reads Chapa settings from admin `app_settings` id=payment.
 * Matches Flutter PaymentSettings: prefer chapaProduction / chapa.production,
 * fall back to top-level chapa (legacy).
 */
export async function fetchChapaConfig(): Promise<ChapaConfig | null> {
  const envSecret = process.env.CHAPA_SECRET_KEY?.trim()
  const envPublic = process.env.CHAPA_PUBLIC_KEY?.trim()
  const envFee = Number.parseFloat(process.env.CHAPA_FEE_PERCENT ?? "")

  const supabase = getServiceSupabase() ?? getSupabase()
  if (supabase) {
    const { data } = await supabase
      .from("app_settings")
      .select("data")
      .eq("id", "payment")
      .maybeSingle()

    const root = asRecord(data?.data)
    if (root) {
      const topChapa = asRecord(root.chapa)
      const nestedProduction = asRecord(topChapa?.production)
      const topProduction = asRecord(root.chapaProduction)
      const production = topProduction ?? nestedProduction ?? topChapa

      if (production) {
        const secretKey = String(
          production.secretKey ?? topChapa?.secretKey ?? envSecret ?? "",
        ).trim()
        const publicKey = String(
          production.publicKey ?? topChapa?.publicKey ?? envPublic ?? "",
        ).trim()
        const feePercent = readNumber(
          production.feePercent ?? topChapa?.feePercent,
          envFee > 0 ? envFee : 3.5,
        )
        const enable = readBoolean(
          production.enable ?? topChapa?.enable,
          true,
        )
        const isActive = readBoolean(
          production.isActive ?? topChapa?.isActive,
          true,
        )
        const isSandbox = readBoolean(
          production.isSandbox ?? topChapa?.isSandbox,
          false,
        )

        if (secretKey && publicKey) {
          return {
            enable,
            isActive,
            isSandbox,
            publicKey,
            secretKey,
            feePercent: feePercent > 0 ? feePercent : 3.5,
          }
        }
      }
    }
  }

  if (envSecret && envPublic) {
    return {
      enable: true,
      isActive: true,
      isSandbox: false,
      publicKey: envPublic,
      secretKey: envSecret,
      feePercent: envFee > 0 ? envFee : 3.5,
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
