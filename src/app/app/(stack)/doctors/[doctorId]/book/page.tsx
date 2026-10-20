import { AppTopBar } from "@/components/app/app-top-bar"
import { BookAppointmentForm } from "@/components/app/book-appointment-form"
import { StackBackButton } from "@/components/app/stack-back-button"
import { fetchDoctorDetail } from "@/lib/api/doctors"

export default async function BookDoctorPage({
  params,
}: {
  params: Promise<{ doctorId: string }>
}) {
  const { doctorId } = await params
  const detail = await fetchDoctorDetail(doctorId)

  return (
    <>
      <AppTopBar
        title="Book"
        leading={
          <StackBackButton fallbackHref={`/app/doctors/${doctorId}`} />
        }
      />
      <div className="px-4 py-5">
        {!detail ? (
          <p className="text-sm text-muted-foreground">Doctor not found.</p>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              Booking with {detail.doctor.name}
            </p>
            <BookAppointmentForm
              doctorId={doctorId}
              services={detail.services}
              slots={detail.slots}
            />
          </>
        )}
      </div>
    </>
  )
}
