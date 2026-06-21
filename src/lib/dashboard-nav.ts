import type { LucideIcon } from "lucide-react"
import {
  Building2Icon,
  CreditCardIcon,
  GitBranchIcon,
  HomeIcon,
  LandmarkIcon,
  ReceiptIcon,
  ScanLineIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react"

import type { AppRole } from "@/lib/auth-role"

export type DashboardNavItem = {
  href: string
  label: string
  icon: LucideIcon
  roles?: AppRole[]
  /** Shown in nav; links to page with coming-soon state */
  comingSoon?: boolean
}

export const DASHBOARD_NAV: DashboardNavItem[] = [
  { href: "/dashboard", label: "Home", icon: HomeIcon },
  {
    href: "/dashboard/businesses",
    label: "Businesses",
    icon: Building2Icon,
    roles: ["owner"],
  },
  {
    href: "/dashboard/branches",
    label: "Branches",
    icon: GitBranchIcon,
    roles: ["owner"],
  },
  // { href: "/dashboard/scan", label: "Scan", icon: ScanLineIcon },
  {
    href: "/dashboard/scan",
    label: "Scan",
    icon: ScanLineIcon,
    comingSoon: true,
  },
  { href: "/dashboard/transactions", label: "Transactions", icon: ReceiptIcon },
  {
    href: "/dashboard/staff",
    label: "Staff",
    icon: UsersIcon,
    roles: ["owner", "manager"],
  },
  {
    href: "/dashboard/banks",
    label: "Banks",
    icon: LandmarkIcon,
    roles: ["owner"],
  },
  {
    href: "/dashboard/subscription",
    label: "Subscription",
    icon: CreditCardIcon,
    roles: ["owner"],
  },
  { href: "/dashboard/profile", label: "Profile", icon: SettingsIcon },
]

export function navItemsForRole(role: AppRole): DashboardNavItem[] {
  return DASHBOARD_NAV.filter(
    (item) => !item.roles || item.roles.includes(role)
  )
}
