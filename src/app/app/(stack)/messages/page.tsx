import { AppTopBar } from "@/components/app/app-top-bar"
import { EmptyState } from "@/components/app/empty-state"
import { ListCard } from "@/components/app/list-card"
import { StackBackButton } from "@/components/app/stack-back-button"
import { fetchConversations } from "@/lib/api/chat"

export default async function MessagesPage() {
  const items = await fetchConversations("patient")
  return (
    <>
      <AppTopBar title="Messages" leading={<StackBackButton fallbackHref="/app" />} />
      <div className="flex flex-col gap-2 px-4 py-4">
        {items.length === 0 ? (
          <EmptyState>No conversations yet. Message a doctor after booking.</EmptyState>
        ) : (
          items.map((item) => (
            <ListCard
              key={item.id}
              href={`/app/messages/${item.id}`}
              title={item.title}
              subtitle={item.preview}
              meta={item.updatedAt ? new Date(item.updatedAt).toLocaleString() : undefined}
              trailing={
                item.unread > 0 ? (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    {item.unread}
                  </span>
                ) : null
              }
            />
          ))
        )}
      </div>
    </>
  )
}
