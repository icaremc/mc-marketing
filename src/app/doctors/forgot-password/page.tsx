import type { Metadata } from "next"
import Link from "next/link"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export const metadata: Metadata = {
  title: "Doctor forgot password",
  robots: { index: false, follow: false },
}

export default function DoctorForgotPasswordPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader variant="page" />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-12">
        <h1 className="text-3xl font-semibold">Reset password</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Uses POST /api/v1/auth/password/otp and /api/v1/auth/password/reset.
        </p>
        <p className="mt-6 text-sm">
          <Link href="/doctors/login" className="font-medium text-primary underline">
            Back to sign in
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  )
}
