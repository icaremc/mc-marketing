import { AppThemeSync } from "@/components/app/app-theme-sync"
import { PatientTabShell } from "@/components/app/patient-shell"
import { fetchPatientProfile } from "@/lib/api/profile"

export default async function PatientTabsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await fetchPatientProfile()
  const trackingType = profile?.userTrackingType ?? "pregnancy"
  return (
    <PatientTabShell trackingType={trackingType}>
      <AppThemeSync darkMode={profile?.darkMode === true} />
      {children}
    </PatientTabShell>
  )
}
