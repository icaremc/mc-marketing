import { AppTopBar } from "@/components/app/app-top-bar"
import { StackBackButton } from "@/components/app/stack-back-button"
import { ThemeSettingsForm } from "@/components/app/theme-settings-form"
import { fetchPatientProfile } from "@/lib/api/profile"

export default async function ThemeSettingsPage() {
  const profile = await fetchPatientProfile()
  return (
    <>
      <AppTopBar
        title="Theme"
        leading={<StackBackButton fallbackHref="/app/settings" />}
      />
      <div className="px-4 py-5">
        <ThemeSettingsForm darkMode={profile?.darkMode === true} />
      </div>
    </>
  )
}
