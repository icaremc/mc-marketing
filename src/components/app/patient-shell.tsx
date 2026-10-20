import type { ReactNode } from "react"

import { MobileFrame } from "@/components/app/mobile-frame"
import { PatientBottomNav } from "@/components/app/patient-bottom-nav"
import type { PatientTrackingType } from "@/lib/app/patient-nav"

/** Full scaffold with bottom tabs (Flutter IndexedStack destinations). */
export function PatientTabShell({
  children,
  trackingType = "pregnancy",
}: {
  children: ReactNode
  trackingType?: PatientTrackingType
}) {
  return (
    <MobileFrame>
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <div className="app-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          {children}
        </div>
        <div className="shrink-0">
          <PatientBottomNav trackingType={trackingType} />
        </div>
      </div>
    </MobileFrame>
  )
}

/** Stacked routes: AppBar + body, no bottom nav (Flutter Get.toNamed push). */
export function PatientStackShell({ children }: { children: ReactNode }) {
  return (
    <MobileFrame>
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <div className="app-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          {children}
        </div>
      </div>
    </MobileFrame>
  )
}

/** @deprecated use PatientTabShell */
export function PatientShell({
  children,
  trackingType = "pregnancy",
}: {
  children: ReactNode
  trackingType?: PatientTrackingType
}) {
  return <PatientTabShell trackingType={trackingType}>{children}</PatientTabShell>
}
