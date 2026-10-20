import { AppTopBar } from "@/components/app/app-top-bar"
import { EmptyState } from "@/components/app/empty-state"
import { ListCard } from "@/components/app/list-card"
import { StackBackButton } from "@/components/app/stack-back-button"
import { fetchChildren } from "@/lib/api/children"

export default async function SettingsChildrenPage() {
  const children = await fetchChildren()
  return (
    <>
      <AppTopBar title="Children" leading={<StackBackButton fallbackHref="/app/settings" />} />
      <div className="flex flex-col gap-2 px-4 py-4">
        {children.length === 0 ? (
          <EmptyState>No children on your account.</EmptyState>
        ) : (
          children.map((child) => (
            <ListCard
              key={child.id}
              title={child.name}
              subtitle={`${child.ageLabel} · ${child.gender}`}
              trailing={
                child.isActive ? (
                  <span className="text-[10px] font-semibold uppercase text-primary">Active</span>
                ) : null
              }
            />
          ))
        )}
      </div>
    </>
  )
}
