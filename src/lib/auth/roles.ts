export type AppRole = "patient" | "doctor"

export const PATIENT_APP_PREFIX = "/app"
export const DOCTOR_APP_PREFIX = "/doctors/app"

export function normalizeRoles(input: {
  role?: string | null
  roles?: string[] | null
}): AppRole[] {
  const raw = [
    ...(input.roles ?? []),
    ...(input.role ? [input.role] : []),
  ]
    .map((r) => r.trim().toLowerCase())
    .filter(Boolean)

  const out: AppRole[] = []
  if (raw.some((r) => r === "patient" || r === "mother")) out.push("patient")
  if (raw.some((r) => r === "doctor")) out.push("doctor")
  return out
}

export function pickActiveRole(
  roles: AppRole[],
  preferred?: string | null,
): AppRole | null {
  if (preferred === "patient" || preferred === "doctor") {
    if (roles.includes(preferred)) return preferred
  }
  if (roles.includes("patient")) return "patient"
  if (roles.includes("doctor")) return "doctor"
  return null
}

export function loginPathForRole(role: AppRole, next?: string): string {
  const base = role === "doctor" ? "/doctors/login" : "/login"
  if (!next) return base
  return `${base}?next=${encodeURIComponent(next)}`
}
