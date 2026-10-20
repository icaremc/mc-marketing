import { AppTopBar } from "@/components/app/app-top-bar"
import { ApiForm } from "@/components/app/api-form"
import { EmptyState } from "@/components/app/empty-state"
import { ListCard } from "@/components/app/list-card"
import { StackBackButton } from "@/components/app/stack-back-button"
import { fetchDoctorSlots } from "@/lib/api/doctor-ops"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default async function AvailabilityPage() {
  const slots = await fetchDoctorSlots()
  return (
    <>
      <AppTopBar title="Availability" leading={<StackBackButton fallbackHref="/doctors/app/profile" />} />
      <div className="flex flex-col gap-4 px-4 py-5">
        {slots.length === 0 ? (
          <EmptyState>No slots yet. Add weekly availability below.</EmptyState>
        ) : (
          <div className="flex flex-col gap-2">
            {slots.map((slot) => (
              <ListCard
                key={slot.id}
                title={`${slot.dayOfWeek != null ? DAYS[slot.dayOfWeek] ?? "Day" : slot.date || "Slot"} · ${slot.startTime}${slot.endTime ? `–${slot.endTime}` : ""}`}
              />
            ))}
          </div>
        )}
        <ApiForm path="doctor/slots" redirectTo="/doctors/app/availability" submitLabel="Add slot">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Day of week</span>
            <select name="day_of_week" className="h-10 rounded-md border border-input px-3" defaultValue="1">
              {DAYS.map((day, i) => (
                <option key={day} value={i}>{day}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Start</span>
            <input name="start_time" type="time" required className="h-10 rounded-md border border-input px-3" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">End</span>
            <input name="end_time" type="time" required className="h-10 rounded-md border border-input px-3" />
          </label>
        </ApiForm>
      </div>
    </>
  )
}
