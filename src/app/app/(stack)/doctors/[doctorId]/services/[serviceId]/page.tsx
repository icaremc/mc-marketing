import Link from "next/link"

import { AppTopBar } from "@/components/app/app-top-bar"
import { StackBackButton } from "@/components/app/stack-back-button"
import { fetchDoctorDetail } from "@/lib/api/doctors"

export default async function DoctorServicePage({
  params,
}: {
  params: Promise<{ doctorId: string; serviceId: string }>
}) {
  const { doctorId, serviceId } = await params
  const detail = await fetchDoctorDetail(doctorId)
  const service = detail?.services.find((s) => s.id === serviceId)

  return (
    <>
      <AppTopBar
        title={service?.name || "Service"}
        leading={
          <StackBackButton fallbackHref={`/app/doctors/${doctorId}`} />
        }
      />
      <div className="flex flex-col gap-4 px-4 py-5">
        {!service ? (
          <p className="text-sm text-muted-foreground">Service not found.</p>
        ) : (
          <>
            <p className="text-2xl font-semibold">
              {service.price.toLocaleString()} {service.currency}
            </p>
            <p className="text-sm text-muted-foreground">
              Offered by {detail?.doctor.name}
            </p>
            <Link
              href={`/app/doctors/${doctorId}/book`}
              className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
            >
              Book this service
            </Link>
          </>
        )}
      </div>
    </>
  )
}
