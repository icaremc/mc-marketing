import type { BranchEditRecord } from "@/components/dashboard/edit-branch-sheet"

export type StaffRole = {
  id: string
  name: string
}

const ALLOWED_CREATE_ROLE_NAMES = new Set(["manager", "associates"])

export function parseStaffRoles(raw: unknown): StaffRole[] {
  if (!Array.isArray(raw)) return []
  const roles: StaffRole[] = []
  for (const item of raw) {
    if (!item || typeof item !== "object") continue
    const row = item as Record<string, unknown>
    const id = row.id?.toString().trim()
    const name = row.name?.toString().trim()
    if (!id || !name) continue
    const key = name.toLowerCase()
    if (!ALLOWED_CREATE_ROLE_NAMES.has(key)) continue
    roles.push({ id, name })
  }
  return roles.sort((a, b) => a.name.localeCompare(b.name))
}

export function roleNameFromEmployee(row: Record<string, unknown>): string {
  const direct = row.role_name ?? row.roleName
  if (direct) return String(direct)
  const role = row.role
  if (role && typeof role === "object" && !Array.isArray(role)) {
    const name = (role as Record<string, unknown>).name
    if (name) return String(name)
  }
  return ""
}

export function branchNameForEmployee(
  row: Record<string, unknown>,
  branches: BranchEditRecord[]
): string {
  const bid = (
    row.branch_id ??
    row.branchId ??
    (row.branch as Record<string, unknown> | undefined)?.id
  )
    ?.toString()
    .trim()
  if (!bid) return ""
  return branches.find((b) => b.id === bid)?.name ?? ""
}

export function employeeDisplayName(row: Record<string, unknown>): string {
  const user = row.user
  if (user && typeof user === "object" && !Array.isArray(user)) {
    const u = user as Record<string, unknown>
    const first = u.first_name ?? u.firstName
    const last = u.last_name ?? u.lastName
    const combined = [first, last]
      .filter((p) => p != null && String(p).trim())
      .map((p) => String(p).trim())
      .join(" ")
    if (combined) return combined
    if (u.name) return String(u.name)
    if (u.username) return String(u.username)
  }
  return (
    row.name?.toString() ??
    row.full_name?.toString() ??
    row.phone_number?.toString() ??
    row.phone?.toString() ??
    "Team member"
  )
}

export function employeePhone(row: Record<string, unknown>): string {
  const user = row.user
  if (user && typeof user === "object" && !Array.isArray(user)) {
    const phone = (user as Record<string, unknown>).phone_number ??
      (user as Record<string, unknown>).phone
    if (phone) return String(phone)
  }
  return row.phone_number?.toString() ?? row.phone?.toString() ?? ""
}

export function extractTemporaryPassword(
  created: Record<string, unknown>
): string | null {
  const v =
    created.temporary_password ??
    created.temporaryPassword ??
    created.temp_password ??
    created.tempPassword
  if (typeof v === "string" && v.trim()) return v.trim()
  return null
}

export function filterEmployees(
  rows: Record<string, unknown>[],
  options: {
    branchId?: string
    roleId?: string
    query?: string
  }
): Record<string, unknown>[] {
  const branchId = options.branchId?.trim()
  const roleId = options.roleId?.trim()
  const q = options.query?.trim().toLowerCase()

  return rows.filter((row) => {
    if (branchId) {
      const bid = (
        row.branch_id ??
        row.branchId ??
        (row.branch as Record<string, unknown> | undefined)?.id
      )
        ?.toString()
        .trim()
      if (bid !== branchId) return false
    }
    if (roleId) {
      const rid = (
        row.role_id ??
        row.roleId ??
        (row.role as Record<string, unknown> | undefined)?.id
      )
        ?.toString()
        .trim()
      if (rid !== roleId) return false
    }
    if (q) {
      const haystack = [
        employeeDisplayName(row),
        employeePhone(row),
        roleNameFromEmployee(row),
      ]
        .join(" ")
        .toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })
}
