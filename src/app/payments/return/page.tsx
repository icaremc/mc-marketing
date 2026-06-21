import type { Metadata } from "next"
import { Suspense } from "react"

import { PaymentReturnClient } from "./payment-return-client"

export const metadata: Metadata = {
  title: "Payment return",
  robots: { index: false, follow: false },
}

export default function PaymentReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
          Loading…
        </div>
      }
    >
      <PaymentReturnClient />
    </Suspense>
  )
}
