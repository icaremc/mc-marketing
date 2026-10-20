import { AppTopBar } from "@/components/app/app-top-bar"
import { ApiForm } from "@/components/app/api-form"
import { StackBackButton } from "@/components/app/stack-back-button"
import { fetchPatientProfile } from "@/lib/api/profile"

export default async function BabySettingsPage() {
  const profile = await fetchPatientProfile()
  return (
    <>
      <AppTopBar title="Baby preferences" leading={<StackBackButton fallbackHref="/app/settings" />} />
      <div className="px-4 py-5">
        <ApiForm path="me/profile" method="PATCH" redirectTo="/app/settings" submitLabel="Save">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Tracking focus</span>
            <select
              name="user_tracking_type"
              defaultValue={profile?.userTrackingType ?? "baby"}
              className="h-10 rounded-md border border-input px-3"
            >
              <option value="pregnancy">Pregnancy</option>
              <option value="baby">Baby</option>
              <option value="both">Both</option>
            </select>
          </label>
        </ApiForm>
      </div>
    </>
  )
}
