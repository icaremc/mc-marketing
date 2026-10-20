import Link from "next/link"

import { AppTopBar } from "@/components/app/app-top-bar"
import { EmptyState } from "@/components/app/empty-state"
import { ListCard } from "@/components/app/list-card"
import { StackBackButton } from "@/components/app/stack-back-button"
import { fetchDoctorServices } from "@/lib/api/doctor-ops"

export default async function DoctorServicesPage() {
  const services = await fetchDoctorServices()
  return (
    <>
      <AppTopBar
        title="Services"
        leading={<StackBackButton fallbackHref="/doctors/app/profile" />}
        actions={
          <Link href="/doctors/app/services/new" className="text-sm font-semibold text-primary">
            Add
          </Link>
        }
      />
      <div className="flex flex-col gap-2 px-4 py-4">
        {services.length === 0 ? (
          <EmptyState>No services yet. Add your first offering.</EmptyState>
        ) : (
          services.map((service) => (
            <ListCard
              key={service.id}
              href={`/doctors/app/services/${service.id}`}
              title={service.name}
              subtitle={`${service.price.toLocaleString()} ${service.currency} · ${service.durationMinutes} min`}
              trailing={
                !service.isActive ? (
                  <span className="text-[10px] uppercase text-muted-foreground">Off</span>
                ) : null
              }
            />
          ))
        )}
      </div>
    </>
  )
}
