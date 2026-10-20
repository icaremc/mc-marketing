import { DoctorTabShell } from "@/components/app/doctor-shell"

export default function DoctorTabsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DoctorTabShell>{children}</DoctorTabShell>
}
