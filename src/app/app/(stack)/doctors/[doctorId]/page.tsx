import Link from "next/link"

import { FeatureScreen } from "@/components/app/feature-screen"
import { StackBackButton } from "@/components/app/stack-back-button"
import { fetchDoctorDetail } from "@/lib/api/doctors"

export default async function DoctorDetailPage({
  params,
}: {
  params: Promise<{ doctorId: string }>
}) {
  const { doctorId } = await params
  const detail = await fetchDoctorDetail(doctorId)

  if (!detail) {
    return (
      <FeatureScreen
        title="Doctor"
        summary="Could not load this doctor."
        leading={<StackBackButton fallbackHref="/app/doctors" />}
        links={[{ href: "/app/doctors", label: "Back to doctors" }]}
      />
    )
  }

  const { doctor, services } = detail

  return (
    <FeatureScreen
      title={doctor.name}
      eyebrow={doctor.specialty || "Doctor"}
      summary={
        doctor.hospital
          ? `${doctor.hospital}${doctor.verified ? " · Verified" : ""}`
          : doctor.verified
            ? "Verified doctor"
            : "Doctor profile"
      }
      leading={<StackBackButton fallbackHref="/app/doctors" />}
    >
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Services
        </p>
        {services.length === 0 ? (
          <p className="text-sm text-muted-foreground">No services listed.</p>
        ) : (
          services.map((service) => (
            <Link
              key={service.id}
              href={`/app/doctors/${doctor.id}/services/${service.id}`}
              className="rounded-xl border border-border bg-card px-4 py-3"
            >
              <p className="text-sm font-medium">{service.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {service.price.toLocaleString()} {service.currency}
              </p>
            </Link>
          ))
        )}
        <Link
          href={`/app/doctors/${doctor.id}/book`}
          className="mt-2 rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
        >
          Book appointment
        </Link>
      </div>
    </FeatureScreen>
  )
}
