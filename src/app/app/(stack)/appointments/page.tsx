import Link from "next/link"

import { AppTopBar } from "@/components/app/app-top-bar"
import { EmptyState } from "@/components/app/empty-state"
import { ListCard } from "@/components/app/list-card"
import { StackBackButton } from "@/components/app/stack-back-button"
import { fetchPatientAppointments } from "@/lib/api/doctor-practice"

export default async function AppointmentsPage() {
  const items = await fetchPatientAppointments()
  return (
    <>
      <AppTopBar title="Appointments" leading={<StackBackButton fallbackHref="/app" />} />
      <div className="flex flex-col gap-3 px-4 py-4">
        <Link
          href="/app/doctors"
          className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
        >
          Book a doctor
        </Link>
        {items.length === 0 ? (
          <EmptyState>No appointments yet.</EmptyState>
        ) : (
          items.map((item) => (
            <ListCard
              key={item.id}
              href={`/app/appointments/${item.id}/review`}
              title={item.patientName || item.serviceName}
              subtitle={item.serviceName}
              meta={
                item.scheduledAt
                  ? item.scheduledAt
                  : item.status
              }
              trailing={
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
                  {item.status}
                </span>
              }
            />
          ))
        )}
      </div>
    </>
  )
}
