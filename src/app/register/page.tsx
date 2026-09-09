import type { Metadata } from "next"
import Link from "next/link"

import { RegisterForm } from "@/components/register-form"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { siteConfig } from "@/lib/brand"

export const metadata: Metadata = {
  title: "Register",
  description: `Create your ${siteConfig.name} account, then choose a yearly subscription.`,
  alternates: { canonical: "/register" },
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader variant="page" />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-primary">Get started</p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Create your {siteConfig.name} account
          </h1>
          <p className="text-pretty text-muted-foreground">
            Same signup as the mobile app: verify your phone, then set a password.
            After registering you can subscribe to the yearly plan.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <RegisterForm />
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Prefer the app?{" "}
          <Link href="/#download" className="text-primary underline-offset-4 hover:underline">
            Download {siteConfig.name}
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  )
}
