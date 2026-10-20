import { AppTopBar } from "@/components/app/app-top-bar"
import { ApiForm } from "@/components/app/api-form"
import { StackBackButton } from "@/components/app/stack-back-button"

export default function NewServicePage() {
  return (
    <>
      <AppTopBar title="New service" leading={<StackBackButton fallbackHref="/doctors/app/services" />} />
      <div className="px-4 py-5">
        <ApiForm path="doctor/services" redirectTo="/doctors/app/services" submitLabel="Create">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Name</span>
            <input name="name" required className="h-10 rounded-md border border-input px-3" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Description</span>
            <textarea name="description" rows={3} className="rounded-md border border-input px-3 py-2" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Price (ETB)</span>
            <input name="price" type="number" min="0" step="1" required className="h-10 rounded-md border border-input px-3" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Duration (minutes)</span>
            <input name="duration_minutes" type="number" defaultValue={30} className="h-10 rounded-md border border-input px-3" />
          </label>
        </ApiForm>
      </div>
    </>
  )
}
