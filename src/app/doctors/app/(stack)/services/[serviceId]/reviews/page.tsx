import { AppTopBar } from "@/components/app/app-top-bar"
import { EmptyState } from "@/components/app/empty-state"
import { ListCard } from "@/components/app/list-card"
import { StackBackButton } from "@/components/app/stack-back-button"
import { fetchDoctorReviews } from "@/lib/api/doctor-ops"

export default async function ServiceReviewsPage({
  params,
}: {
  params: Promise<{ serviceId: string }>
}) {
  const { serviceId } = await params
  const reviews = await fetchDoctorReviews()
  return (
    <>
      <AppTopBar
        title="Reviews"
        leading={<StackBackButton fallbackHref={`/doctors/app/services/${serviceId}`} />}
      />
      <div className="flex flex-col gap-2 px-4 py-4">
        {reviews.length === 0 ? (
          <EmptyState>No reviews yet.</EmptyState>
        ) : (
          reviews.map((row, i) => (
            <ListCard
              key={String(row.id ?? i)}
              title={`${row.rating != null ? `★ ${row.rating}` : "Review"}`}
              subtitle={String(row.comment ?? row.body ?? "")}
              meta={
                row.created_at
                  ? new Date(String(row.created_at)).toLocaleDateString()
                  : undefined
              }
            />
          ))
        )}
      </div>
    </>
  )
}
