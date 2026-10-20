import type { ReactNode } from "react"

import { DoctorBottomNav } from "@/components/app/doctor-bottom-nav"
import { MobileFrame } from "@/components/app/mobile-frame"

export function DoctorTabShell({ children }: { children: ReactNode }) {
  return (
    <MobileFrame>
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <div className="app-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          {children}
        </div>
        <div className="shrink-0">
          <DoctorBottomNav />
        </div>
      </div>
    </MobileFrame>
  )
}

export function DoctorStackShell({ children }: { children: ReactNode }) {
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

/** @deprecated use DoctorTabShell */
export function DoctorShell({ children }: { children: ReactNode }) {
  return <DoctorTabShell>{children}</DoctorTabShell>
}
