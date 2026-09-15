import type { Metadata } from "next"
import { Suspense } from "react"

import { ActivateSuccessClient } from "@/app/activate/success/success-client"
import { SiteHeader } from "@/components/site-header"

export const metadata: Metadata = {
  title: "Activation complete",
  robots: { index: false, follow: false },
}

export default function ActivateSuccessPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12 sm:px-6">
        <Suspense
          fallback={
            <p className="text-center text-sm text-muted-foreground">
              Loading…
            </p>
          }
        >
          <ActivateSuccessClient />
        </Suspense>
      </main>
    </div>
  )
}
