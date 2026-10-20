import { AppTopBar } from "@/components/app/app-top-bar"
import { ApiForm } from "@/components/app/api-form"
import { StackBackButton } from "@/components/app/stack-back-button"
import { fetchDoctorAppointments } from "@/lib/api/doctor-practice"

export default async function DoctorAppointmentReviewPage({
  params,
}: {
  params: Promise<{ appointmentId: string }>
}) {
  const { appointmentId } = await params
  const items = await fetchDoctorAppointments()
  const item = items.find((a) => a.id === appointmentId)

  return (
    <>
      <AppTopBar
        title="Appointment"
        leading={<StackBackButton fallbackHref="/doctors/app/appointments" />}
      />
      <div className="flex flex-col gap-4 px-4 py-5">
        {!item ? (
          <p className="text-sm text-muted-foreground">Not found.</p>
        ) : (
          <>
            <div className="rounded-2xl border border-border bg-card px-4 py-4">
              <p className="text-sm font-semibold">{item.patientName}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.serviceName}</p>
              <p className="mt-2 text-sm">
                {item.scheduledAt || "—"}
              </p>
              <p className="mt-1 text-xs uppercase text-primary">{item.status}</p>
            </div>
            <ApiForm
              path={`doctor/appointments/${appointmentId}/status`}
              method="POST"
              redirectTo="/doctors/app/appointments"
              submitLabel="Mark completed"
              body={{ status: "completed" }}
            />
            <ApiForm
              path={`doctor/appointments/${appointmentId}/status`}
              method="POST"
              redirectTo="/doctors/app/appointments"
              submitLabel="Cancel"
              body={{ status: "cancelled" }}
            />
          </>
        )}
      </div>
    </>
  )
}
