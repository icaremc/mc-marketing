import type { Metadata } from "next"
import Link from "next/link"

import { DoctorRegisterForm } from "@/components/doctor-register-form"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export const metadata: Metadata = {
  title: "Doctor register",
  robots: { index: false, follow: false },
}

export default function DoctorRegisterPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader variant="page" />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-primary">Doctors</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Create doctor account
          </h1>
          <p className="text-sm text-muted-foreground">
            Mirrors the mobile doctor signup: OTP, then password.
          </p>
        </div>
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <DoctorRegisterForm />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already registered?{" "}
            <Link href="/doctors/login" className="text-primary underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
