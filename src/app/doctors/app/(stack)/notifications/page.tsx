import { AppTopBar } from "@/components/app/app-top-bar"
import { EmptyState } from "@/components/app/empty-state"
import { ListCard } from "@/components/app/list-card"
import { StackBackButton } from "@/components/app/stack-back-button"
import { fetchNotifications } from "@/lib/api/notifications"

export default async function DoctorNotificationsPage() {
  const items = await fetchNotifications("doctor")
  return (
    <>
      <AppTopBar title="Notifications" leading={<StackBackButton fallbackHref="/doctors/app" />} />
      <div className="flex flex-col gap-2 px-4 py-4">
        {items.length === 0 ? (
          <EmptyState>No notifications yet.</EmptyState>
        ) : (
          items.map((item) => (
            <ListCard
              key={item.id}
              title={item.title}
              subtitle={item.body}
              meta={item.createdAt ? new Date(item.createdAt).toLocaleString() : undefined}
            />
          ))
        )}
      </div>
    </>
  )
}
