import { AppTopBar } from "@/components/app/app-top-bar"
import { ApiForm } from "@/components/app/api-form"
import { StackBackButton } from "@/components/app/stack-back-button"
import { fetchPatientProfile } from "@/lib/api/profile"

export default async function ProfileEditPage() {
  const profile = await fetchPatientProfile()
  return (
    <>
      <AppTopBar title="Edit profile" leading={<StackBackButton fallbackHref="/app/profile" />} />
      <div className="px-4 py-5">
        <ApiForm path="me/profile" method="PATCH" redirectTo="/app/profile" submitLabel="Save profile">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Full name</span>
            <input name="full_name" defaultValue={profile?.fullName ?? ""} required className="h-10 rounded-md border border-input px-3" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Location</span>
            <input name="location" defaultValue={profile?.location ?? ""} className="h-10 rounded-md border border-input px-3" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Hospital</span>
            <input name="hospital" defaultValue={profile?.hospital ?? ""} className="h-10 rounded-md border border-input px-3" />
          </label>
        </ApiForm>
      </div>
    </>
  )
}
