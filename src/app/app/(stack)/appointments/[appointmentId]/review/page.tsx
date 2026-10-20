import { AppTopBar } from "@/components/app/app-top-bar"
import { ApiForm } from "@/components/app/api-form"
import { StackBackButton } from "@/components/app/stack-back-button"
import { fetchPatientAppointments } from "@/lib/api/doctor-practice"

export default async function AppointmentReviewPage({
  params,
}: {
  params: Promise<{ appointmentId: string }>
}) {
  const { appointmentId } = await params
  const items = await fetchPatientAppointments()
  const item = items.find((a) => a.id === appointmentId)

  return (
    <>
      <AppTopBar
        title="Appointment"
        leading={<StackBackButton fallbackHref="/app/appointments" />}
      />
      <div className="flex flex-col gap-4 px-4 py-5">
        {!item ? (
          <p className="text-sm text-muted-foreground">Appointment not found.</p>
        ) : (
          <>
            <div className="rounded-2xl border border-border bg-card px-4 py-4">
              <p className="text-sm font-semibold">{item.serviceName}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.patientName}</p>
              <p className="mt-2 text-sm">
                {item.scheduledAt
                  ? item.scheduledAt
                  : "—"}
              </p>
              <p className="mt-1 text-xs uppercase text-primary">{item.status}</p>
              {item.amount > 0 ? (
                <p className="mt-2 text-sm font-medium">
                  {item.amount.toLocaleString()} {item.currency}
                </p>
              ) : null}
            </div>
            {item.status.toLowerCase() !== "cancelled" &&
            item.status.toLowerCase() !== "completed" ? (
              <ApiForm
                path={`appointments/${appointmentId}/cancel`}
                method="POST"
                redirectTo="/app/appointments"
                submitLabel="Cancel appointment"
                body={{}}
              />
            ) : null}
          </>
        )}
      </div>
    </>
  )
}
