import { resolveMediaUrl } from "@/lib/api/media"
import { objectFrom, rowsFrom } from "@/lib/api/parse"
import { backendFetch } from "@/lib/backend"

export type DoctorListItem = {
  id: string
  name: string
  specialty: string
  hospital: string
  avatarUrl: string
  rating: number | null
  verified: boolean
}

export type DoctorCategory = {
  id: string
  name: string
  sortOrder: number
}

function parseDoctor(row: Record<string, unknown>): DoctorListItem {
  const first = String(row.first_name ?? "")
  const last = String(row.last_name ?? "")
  const combined = `${first} ${last}`.trim()
  return {
    id: String(row.id ?? ""),
    name: String(row.full_name ?? row.name ?? (combined || "Doctor")),
    specialty: String(row.specialty ?? row.speciality ?? ""),
    hospital: String(row.hospital ?? row.hospital_name ?? ""),
    avatarUrl: resolveMediaUrl(
      typeof row.avatar_url === "string"
        ? row.avatar_url
        : typeof row.photo_url === "string"
          ? row.photo_url
          : "",
    ),
    rating:
      typeof row.rating === "number"
        ? row.rating
        : typeof row.average_rating === "number"
          ? row.average_rating
          : null,
    verified: row.is_verified === true || row.verified === true,
  }
}

export async function fetchDoctors(options?: {
  categoryId?: string
  verifiedOnly?: boolean
}): Promise<DoctorListItem[]> {
  const result = await backendFetch("/doctors", {
    searchParams: {
      category_id: options?.categoryId,
      verified_only: String(options?.verifiedOnly ?? true),
    },
  })
  if (!result.ok) return []
  return rowsFrom(result.data, "doctors")
    .map(parseDoctor)
    .filter((d) => d.id)
}

export async function fetchDoctorCategories(): Promise<DoctorCategory[]> {
  const result = await backendFetch("/doctors/categories")
  if (!result.ok) return []
  return rowsFrom(result.data, "categories")
    .filter((row) => row.is_active !== false)
    .map((row) => ({
      id: String(row.id ?? ""),
      name: String(row.name ?? ""),
      sortOrder: Number(row.sort_order ?? 0),
    }))
    .filter((c) => c.id && c.name)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
}

export type DoctorSlotPublic = {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
}

export async function fetchDoctorDetail(doctorId: string): Promise<{
  doctor: DoctorListItem
  services: { id: string; name: string; price: number; currency: string }[]
  slots: DoctorSlotPublic[]
} | null> {
  const result = await backendFetch(`/doctors/${doctorId}`)
  if (!result.ok) return null
  const doctorRow =
    objectFrom(result.data, "doctor") ?? objectFrom(result.data)
  if (!doctorRow?.id) return null
  const services = rowsFrom(result.data, "services").map((row) => ({
    id: String(row.id ?? ""),
    name: String(row.name ?? row.title ?? "Service"),
    price: Number(row.price ?? row.amount ?? 0),
    currency: String(row.currency ?? "ETB"),
  }))
  const slots = rowsFrom(result.data, "slots").map((row) => ({
    id: String(row.id ?? ""),
    dayOfWeek: Number(row.day_of_week ?? row.weekday ?? 0),
    startTime: String(row.start_time ?? row.from_time ?? ""),
    endTime: String(row.end_time ?? row.to_time ?? ""),
  }))
  return {
    doctor: parseDoctor(doctorRow),
    services: services.filter((s) => s.id),
    slots: slots.filter((s) => s.id && s.startTime),
  }
}
