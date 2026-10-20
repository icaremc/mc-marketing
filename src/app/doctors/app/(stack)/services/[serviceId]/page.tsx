import Link from "next/link"

import { AppTopBar } from "@/components/app/app-top-bar"
import { ApiForm } from "@/components/app/api-form"
import { StackBackButton } from "@/components/app/stack-back-button"
import { fetchDoctorServices } from "@/lib/api/doctor-ops"

export default async function DoctorServiceDetailPage({
  params,
}: {
  params: Promise<{ serviceId: string }>
}) {
  const { serviceId } = await params
  const services = await fetchDoctorServices()
  const service = services.find((s) => s.id === serviceId)

  return (
    <>
      <AppTopBar
        title={service?.name || "Service"}
        leading={<StackBackButton fallbackHref="/doctors/app/services" />}
      />
      <div className="flex flex-col gap-4 px-4 py-5">
        {!service ? (
          <p className="text-sm text-muted-foreground">Service not found.</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">{service.description || "No description."}</p>
            <p className="text-xl font-semibold">
              {service.price.toLocaleString()} {service.currency}
            </p>
            <Link
              href={`/doctors/app/services/${serviceId}/reviews`}
              className="text-sm font-medium text-primary"
            >
              View reviews →
            </Link>
            <ApiForm
              path={`doctor/services/${serviceId}`}
              method="PATCH"
              redirectTo="/doctors/app/services"
              submitLabel="Update"
            >
              <input name="name" defaultValue={service.name} className="h-10 rounded-md border border-input px-3 text-sm" />
              <input name="price" type="number" defaultValue={service.price} className="h-10 rounded-md border border-input px-3 text-sm" />
              <select name="is_active" defaultValue={service.isActive ? "true" : "false"} className="h-10 rounded-md border border-input px-3 text-sm">
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </ApiForm>
          </>
        )}
      </div>
    </>
  )
}
