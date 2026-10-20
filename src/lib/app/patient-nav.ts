/**
 * Mirrors mc-app MainShellNavConfig for UserTrackingType.pregnancy (default shell).
 * Center slot is elevated (ConvexAppBar pattern).
 */
export type PatientTrackingType = "pregnancy" | "baby" | "both"

export type PatientNavItem = {
  href: string
  label: string
  /** Center elevated tab (pregnancy / baby) */
  center?: boolean
}

export function patientNavItems(
  type: PatientTrackingType = "pregnancy",
): PatientNavItem[] {
  switch (type) {
    case "baby":
      return [
        { href: "/app", label: "Home" },
        { href: "/app/doctors", label: "Doctors" },
        { href: "/app/baby", label: "Baby", center: true },
        { href: "/app/growth", label: "Growth" },
        { href: "/app/profile", label: "Profile" },
      ]
    case "both":
      return [
        { href: "/app", label: "Home" },
        { href: "/app/doctors", label: "Doctors" },
        { href: "/app/pregnancy", label: "Pregnancy", center: true },
        { href: "/app/baby", label: "Baby" },
        { href: "/app/profile", label: "Profile" },
      ]
    case "pregnancy":
    default:
      return [
        { href: "/app", label: "Home" },
        { href: "/app/doctors", label: "Doctors" },
        { href: "/app/pregnancy", label: "Pregnancy", center: true },
        { href: "/app/tools", label: "Tools" },
        { href: "/app/profile", label: "Profile" },
      ]
  }
}

export function isPatientNavActive(pathname: string, href: string): boolean {
  if (href === "/app") return pathname === "/app"
  return pathname === href || pathname.startsWith(`${href}/`)
}
