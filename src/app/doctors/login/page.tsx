import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"

import { DoctorLoginForm } from "@/components/doctor-login-form"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export const metadata: Metadata = {
  title: "Doctor sign in",
  description: "Sign in to the ICare MC doctor web app.",
  alternates: { canonical: "/doctors/login" },
  robots: { index: false, follow: false },
}

export default function DoctorLoginPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader variant="page" />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-primary">Doctors</p>
          <h1 className="text-3xl font-semibold tracking-tight">Doctor sign in</h1>
          <p className="text-sm text-muted-foreground">
            Same credentials as the ICare Doctors mobile app.
          </p>
        </div>
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
            <DoctorLoginForm />
          </Suspense>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link href="/doctors/forgot-password" className="underline">
              Forgot password
            </Link>
            {" · "}
            <Link href="/login" className="underline">
              Parent sign in
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
