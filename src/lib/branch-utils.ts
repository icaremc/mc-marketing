import type { BranchEditRecord } from "@/components/dashboard/edit-branch-sheet"

function readBool(value: unknown): boolean {
  return value === true || value === "true" || value === 1
}

export function parseBranchFromApi(row: Record<string, unknown>): BranchEditRecord | null {
  const id = row.id?.toString().trim()
  if (!id) return null

  return {
    id,
    name: row.name?.toString().trim() || "Branch",
    address: (row.address ?? row.city)?.toString().trim() ?? "",
    is_head_quarter: readBool(row.is_head_quarter ?? row.isHeadQuarter),
    is_archived: readBool(row.is_archived ?? row.isArchived),
  }
}
