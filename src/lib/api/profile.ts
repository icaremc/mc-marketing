import { resolveMediaUrl } from "@/lib/api/media"
import { objectFrom } from "@/lib/api/parse"
import { authedFetch } from "@/lib/api/authed"
import type { PatientTrackingType } from "@/lib/app/patient-nav"

export type PatientProfile = {
  id: string
  fullName: string
  phone: string
  locale: string
  location: string
  hospital: string
  accountType: string
  userTrackingType: PatientTrackingType | null
  avatarUrl: string
  darkMode: boolean
  notificationsEnabled: boolean
  onboardingComplete: boolean
}

function parseTracking(raw: unknown): PatientTrackingType | null {
  const value = String(raw ?? "").toLowerCase()
  if (value === "pregnancy" || value === "baby" || value === "both") return value
  return null
}

export function parsePatientProfile(body: unknown): PatientProfile | null {
  const json = objectFrom(body) ?? objectFrom(body, "profile")
  if (!json) return null
  return {
    id: String(json.id ?? ""),
    fullName: String(json.full_name ?? ""),
    phone: String(json.phone ?? ""),
    locale: String(json.locale ?? "en"),
    location: String(json.location ?? ""),
    hospital: String(json.hospital ?? ""),
    accountType: String(json.account_type ?? "Mother"),
    userTrackingType: parseTracking(json.user_tracking_type),
    avatarUrl: resolveMediaUrl(
      typeof json.avatar_url === "string" ? json.avatar_url : "",
    ),
    darkMode: json.dark_mode === true,
    notificationsEnabled: json.notifications_enabled !== false,
    onboardingComplete: json.onboarding_complete === true,
  }
}

export async function fetchPatientProfile(): Promise<PatientProfile | null> {
  const result = await authedFetch("/me/profile")
  if (!result.ok) return null
  return parsePatientProfile(result.data)
}
