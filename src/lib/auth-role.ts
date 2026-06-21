export type AppRole = "owner" | "manager" | "verifier"

export function parseAppRole(value: unknown): AppRole | null {
  if (value == null) return null

  const values = Array.isArray(value) ? value : [value]
  for (const item of values) {
    const normalized = item?.toString().trim().toLowerCase()
    if (!normalized) continue
    if (normalized === "owner" || normalized === "admin" || normalized === "superadmin" || normalized === "super_admin") {
      return "owner"
    }
    if (normalized === "manager") return "manager"
    if (normalized === "verifier" || normalized === "associate" || normalized === "associates") {
      return "verifier"
    }
  }
  return null
}

export function roleDisplayName(role: AppRole): string {
  switch (role) {
    case "owner":
      return "Owner"
    case "manager":
      return "Manager"
    case "verifier":
      return "Associate"
  }
}

export function dashboardHomePath(role: AppRole): string {
  return "/dashboard"
}
