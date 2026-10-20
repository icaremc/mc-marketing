import { DoctorStackShell } from "@/components/app/doctor-shell"

export default function DoctorStackLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DoctorStackShell>{children}</DoctorStackShell>
}
