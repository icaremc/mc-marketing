"use client"

import { ApiForm } from "@/components/app/api-form"

export function BookAppointmentForm({
  doctorId,
  services,
  slots,
}: {
  doctorId: string
  services: { id: string; name: string; price: number; currency: string }[]
  slots: { id: string; dayOfWeek: number; startTime: string; endTime: string }[]
}) {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <ApiForm
      path="appointments"
      redirectTo="/app/appointments"
      submitLabel="Book"
      body={() => ({ doctor_id: doctorId })}
    >
      <input type="hidden" name="doctor_id" value={doctorId} />
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Date</span>
        <input
          type="date"
          name="appointment_date"
          required
          className="h-10 rounded-md border border-input px-3"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Time slot</span>
        <select
          name="time_slot"
          required
          className="h-10 rounded-md border border-input px-3"
          defaultValue=""
        >
          <option value="" disabled>
            Select time
          </option>
          {slots.length === 0 ? (
            <option value="09:00-09:30">09:00-09:30</option>
          ) : (
            slots.map((slot) => (
              <option key={slot.id} value={slot.startTime}>
                {dayNames[slot.dayOfWeek] ?? "Day"} · {slot.startTime}
                {slot.endTime ? `–${slot.endTime}` : ""}
              </option>
            ))
          )}
        </select>
      </label>
      {services.length > 0 ? (
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Service</span>
          <select
            name="service_id"
            className="h-10 rounded-md border border-input px-3"
            defaultValue={services[0]?.id}
          >
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} · {service.price} {service.currency}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Note</span>
        <textarea
          name="note"
          rows={3}
          className="rounded-md border border-input px-3 py-2"
          placeholder="Optional note for the doctor"
        />
      </label>
    </ApiForm>
  )
}
