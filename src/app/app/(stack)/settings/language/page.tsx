import { AppTopBar } from "@/components/app/app-top-bar"
import { ApiForm } from "@/components/app/api-form"
import { StackBackButton } from "@/components/app/stack-back-button"
import { fetchPatientProfile } from "@/lib/api/profile"

export default async function LanguageSettingsPage() {
  const profile = await fetchPatientProfile()
  return (
    <>
      <AppTopBar title="Language" leading={<StackBackButton fallbackHref="/app/settings" />} />
      <div className="px-4 py-5">
        <ApiForm path="me/profile" method="PATCH" redirectTo="/app/settings" submitLabel="Save">
          <select name="locale" defaultValue={profile?.locale || "en"} className="h-10 w-full rounded-md border border-input px-3 text-sm">
            <option value="en">English</option>
            <option value="am">Amharic</option>
            <option value="om">Afaan Oromo</option>
            <option value="ti">Tigrinya</option>
          </select>
        </ApiForm>
      </div>
    </>
  )
}
