import { resolveMediaUrl } from "@/lib/api/media"
import { objectFrom, rowsFrom } from "@/lib/api/parse"
import { authedFetch } from "@/lib/api/authed"

export type DoctorMe = {
  id: string
  name: string
  specialty: string
  phone: string
  avatarUrl: string
  verified: boolean
  referralCode: string
}

export type DoctorAppointment = {
  id: string
  patientName: string
  status: string
  scheduledAt: string
  serviceName: string
  amount: number
  currency: string
}

export function parseDoctorMe(body: unknown): DoctorMe | null {
  const json = objectFrom(body)
  if (!json?.id) return null
  const first = String(json.first_name ?? "")
  const last = String(json.last_name ?? "")
  return {
    id: String(json.id),
    name: String(
      json.full_name ?? json.name ?? (`${first} ${last}`.trim() || "Doctor"),
    ),
    specialty: String(json.specialty ?? json.speciality ?? ""),
    phone: String(json.phone ?? ""),
    avatarUrl: resolveMediaUrl(
      typeof json.avatar_url === "string"
        ? json.avatar_url
        : typeof json.photo_url === "string"
          ? json.photo_url
          : "",
    ),
    verified: json.is_verified === true || json.verified === true,
    referralCode: String(json.referral_code ?? ""),
  }
}

export async function fetchDoctorMe(): Promise<DoctorMe | null> {
  const result = await authedFetch("/doctor/me")
  if (!result.ok) return null
  return parseDoctorMe(result.data)
}

/** Flutter keeps appointment_date + time_slot separate; never glue them into ISO. */
function appointmentWhenLabel(row: Record<string, unknown>): string {
  const timeSlot = String(row.time_slot ?? "").trim()
  const dateRaw = String(
    row.appointment_date ??
      row.scheduled_at ??
      row.starts_at ??
      row.appointment_at ??
      "",
  ).trim()
  if (!dateRaw) return timeSlot
  const ms = Date.parse(dateRaw)
  if (Number.isNaN(ms)) {
    return [dateRaw, timeSlot].filter(Boolean).join(" · ")
  }
  const dateLabel = new Date(ms).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  return timeSlot ? `${dateLabel} · ${timeSlot}` : dateLabel
}

function parseAppointment(row: Record<string, unknown>): DoctorAppointment {
  const patient = objectFrom(row.patient) ?? objectFrom(row.patient_profile)
  const service = objectFrom(row.service) ?? objectFrom(row.doctor_service)
  return {
    id: String(row.id ?? ""),
    patientName: String(
      patient?.full_name ??
        row.patient_name ??
        row.patient_full_name ??
        row.doctor_name ??
        objectFrom(row.doctor)?.full_name ??
        objectFrom(row.doctor)?.name ??
        "Appointment",
    ),
    status: String(row.status ?? "pending"),
    scheduledAt: appointmentWhenLabel(row),
    serviceName: String(
      service?.name ?? row.service_name ?? row.title ?? "Consultation",
    ),
    amount: Number(row.amount_paid ?? row.amount ?? row.price ?? 0),
    currency: String(row.currency ?? "ETB"),
  }
}

export async function fetchDoctorAppointments(): Promise<DoctorAppointment[]> {
  const result = await authedFetch("/doctor/appointments")
  if (!result.ok) return []
  return rowsFrom(result.data, "appointments")
    .map(parseAppointment)
    .filter((a) => a.id)
}

export async function fetchDoctorWallet(): Promise<{
  balance: number
  currency: string
} | null> {
  const result = await authedFetch("/doctor/wallet")
  if (!result.ok) return null
  const json = objectFrom(result.data) ?? objectFrom(result.data, "wallet")
  if (!json) return null
  return {
    balance: Number(json.balance ?? json.available_balance ?? 0),
    currency: String(json.currency ?? "ETB"),
  }
}

export async function fetchPatientAppointments(): Promise<DoctorAppointment[]> {
  const result = await authedFetch("/appointments")
  if (!result.ok) return []
  return rowsFrom(result.data, "appointments")
    .map(parseAppointment)
    .filter((a) => a.id)
}

export async function fetchAppSubscription(): Promise<{
  active: boolean
  endsAt: string | null
} | null> {
  const result = await authedFetch("/subscriptions/app")
  if (!result.ok) return null
  const json = objectFrom(result.data) ?? objectFrom(result.data, "subscription")
  if (!json) return { active: false, endsAt: null }
  const status = String(json.status ?? "").toLowerCase()
  return {
    active: status === "active" || json.active === true,
    endsAt: typeof json.ends_at === "string" ? json.ends_at : null,
  }
}
