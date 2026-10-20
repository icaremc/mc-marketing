/** Mirrors mc-doctor-app MainShellController + NavigationBar destinations. */
export const doctorNavItems = [
  { href: "/doctors/app", label: "Dashboard" },
  { href: "/doctors/app/appointments", label: "Appointments" },
  { href: "/doctors/app/payments", label: "Payments" },
  { href: "/doctors/app/profile", label: "Profile" },
] as const

export function isDoctorNavActive(pathname: string, href: string): boolean {
  if (href === "/doctors/app") return pathname === "/doctors/app"
  return pathname === href || pathname.startsWith(`${href}/`)
}
