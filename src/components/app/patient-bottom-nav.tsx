"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Baby,
  BriefcaseMedical,
  Grid2x2,
  Home,
  LineChart,
  PersonStanding,
  User,
} from "lucide-react"

import {
  isPatientNavActive,
  patientNavItems,
  type PatientTrackingType,
} from "@/lib/app/patient-nav"
import { cn } from "@/lib/utils"

function SideIcon({
  label,
  active,
}: {
  label: string
  active: boolean
}) {
  const className = cn(
    "size-6",
    active
      ? "text-[var(--icare-nav-active)]"
      : "text-[var(--icare-nav-inactive)]",
  )
  switch (label) {
    case "Home":
      return <Home className={className} strokeWidth={active ? 2.4 : 1.8} />
    case "Doctors":
      return (
        <BriefcaseMedical className={className} strokeWidth={active ? 2.4 : 1.8} />
      )
    case "Tools":
      return <Grid2x2 className={className} strokeWidth={active ? 2.4 : 1.8} />
    case "Growth":
      return <LineChart className={className} strokeWidth={active ? 2.4 : 1.8} />
    case "Baby":
      return <Baby className={className} strokeWidth={active ? 2.4 : 1.8} />
    case "Profile":
      return <User className={className} strokeWidth={active ? 2.4 : 1.8} />
    default:
      return <Home className={className} />
  }
}

/** ConvexAppBar: h64, curveSize≈42, center 46, labels 11/w600. */
export function PatientBottomNav({
  trackingType = "pregnancy",
}: {
  trackingType?: PatientTrackingType
}) {
  const pathname = usePathname()
  const items = patientNavItems(trackingType)

  return (
    <nav
      className="app-bottom-nav relative z-30 shrink-0 pb-[env(safe-area-inset-bottom,0px)]"
      aria-label="Parent main tabs"
    >
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[72px] w-full text-[var(--icare-chrome)]"
        viewBox="0 0 390 72"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          fill="currentColor"
          d="M0 22 H148 C162 22 170 0 195 0 C220 0 228 22 242 22 H390 V72 H0 Z"
        />
      </svg>
      <div className="relative grid h-16 grid-cols-5 items-end px-0.5">
        {items.map((item) => {
          const active = isPatientNavActive(pathname, item.href)
          if (item.center) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-end pb-1.5"
                aria-current={active ? "page" : undefined}
              >
                <span
                  className={cn(
                    "absolute -top-3 flex size-[46px] items-center justify-center rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.25)]",
                    active
                      ? "bg-[var(--icare-center-fab-active-bg)] text-[var(--icare-center-fab-active-fg)]"
                      : "bg-[var(--icare-center-fab-bg)] text-[var(--icare-center-fab-fg)]",
                  )}
                >
                  {item.label === "Baby" ? (
                    <Baby className="size-6" strokeWidth={2.2} />
                  ) : (
                    <PersonStanding className="size-6" strokeWidth={2.2} />
                  )}
                </span>
                <span
                  className={cn(
                    "mt-8 text-[11px] font-semibold",
                    active
                      ? "text-[var(--icare-nav-active)]"
                      : "text-[var(--icare-nav-inactive)]",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-0.5 pb-2 pt-2"
              aria-current={active ? "page" : undefined}
            >
              <SideIcon label={item.label} active={active} />
              <span
                className={cn(
                  "text-[11px] font-semibold",
                  active
                    ? "text-[var(--icare-nav-active)]"
                    : "text-[var(--icare-nav-inactive)]",
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
