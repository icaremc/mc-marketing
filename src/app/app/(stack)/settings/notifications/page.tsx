import { AppTopBar } from "@/components/app/app-top-bar"
import { ApiForm } from "@/components/app/api-form"
import { StackBackButton } from "@/components/app/stack-back-button"
import { fetchPatientProfile } from "@/lib/api/profile"

export default async function NotificationSettingsPage() {
  const profile = await fetchPatientProfile()
  return (
    <>
      <AppTopBar title="Notifications" leading={<StackBackButton fallbackHref="/app/settings" />} />
      <div className="px-4 py-5">
        <ApiForm path="me/profile" method="PATCH" redirectTo="/app/settings" submitLabel="Save">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Push & in-app alerts</span>
            <select
              name="notifications_enabled"
              defaultValue={profile?.notificationsEnabled !== false ? "true" : "false"}
              className="h-10 rounded-md border border-input px-3"
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </label>
        </ApiForm>
      </div>
    </>
  )
}
