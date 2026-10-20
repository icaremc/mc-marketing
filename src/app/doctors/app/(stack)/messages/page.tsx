import { AppTopBar } from "@/components/app/app-top-bar"
import { EmptyState } from "@/components/app/empty-state"
import { ListCard } from "@/components/app/list-card"
import { StackBackButton } from "@/components/app/stack-back-button"
import { fetchConversations } from "@/lib/api/chat"

export default async function DoctorMessagesPage() {
  const items = await fetchConversations("doctor")
  return (
    <>
      <AppTopBar title="Messages" leading={<StackBackButton fallbackHref="/doctors/app" />} />
      <div className="flex flex-col gap-2 px-4 py-4">
        {items.length === 0 ? (
          <EmptyState>No patient conversations yet.</EmptyState>
        ) : (
          items.map((item) => (
            <ListCard
              key={item.id}
              href={`/doctors/app/messages/${item.id}`}
              title={item.title}
              subtitle={item.preview}
              meta={item.updatedAt ? new Date(item.updatedAt).toLocaleString() : undefined}
            />
          ))
        )}
      </div>
    </>
  )
}
