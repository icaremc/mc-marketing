import { AppTopBar } from "@/components/app/app-top-bar"
import { fetchDoctorAppointments } from "@/lib/api/doctor-practice"

export default async function DoctorAppointmentsPage() {
  const appointments = await fetchDoctorAppointments()

  return (
    <>
      <AppTopBar title="Appointments" />
      <div className="flex flex-col gap-3 px-4 py-4">
        {appointments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            No appointments yet.
          </div>
        ) : (
          appointments.map((item) => (
            <a
              key={item.id}
              href={`/doctors/app/appointments/${item.id}/review`}
              className="rounded-2xl border border-border bg-card px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{item.patientName}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.serviceName}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.scheduledAt
                      ? item.scheduledAt
                      : "—"}
                  </p>
                </div>
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
                  {item.status}
                </span>
              </div>
            </a>
          ))
        )}
      </div>
    </>
  )
}
