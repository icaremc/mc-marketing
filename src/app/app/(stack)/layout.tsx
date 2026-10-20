import { AppThemeSync } from "@/components/app/app-theme-sync"
import { PatientStackShell } from "@/components/app/patient-shell"
import { fetchPatientProfile } from "@/lib/api/profile"

export default async function PatientStackLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await fetchPatientProfile()
  return (
    <PatientStackShell>
      <AppThemeSync darkMode={profile?.darkMode === true} />
      {children}
    </PatientStackShell>
  )
}
