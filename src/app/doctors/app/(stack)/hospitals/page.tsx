import { AppTopBar } from "@/components/app/app-top-bar"
import { EmptyState } from "@/components/app/empty-state"
import { ListCard } from "@/components/app/list-card"
import { StackBackButton } from "@/components/app/stack-back-button"
import { fetchDoctorHospitals } from "@/lib/api/doctor-ops"
import { str } from "@/lib/api/list"

export default async function HospitalsPage() {
  const hospitals = await fetchDoctorHospitals()
  return (
    <>
      <AppTopBar title="Hospitals" leading={<StackBackButton fallbackHref="/doctors/app/profile" />} />
      <div className="flex flex-col gap-2 px-4 py-4">
        {hospitals.length === 0 ? (
          <EmptyState>No affiliated hospitals.</EmptyState>
        ) : (
          hospitals.map((row, i) => (
            <ListCard
              key={str(row, "id") || String(i)}
              title={str(row, "name") || "Hospital"}
              subtitle={str(row, "city") || str(row, "location")}
            />
          ))
        )}
      </div>
    </>
  )
}
