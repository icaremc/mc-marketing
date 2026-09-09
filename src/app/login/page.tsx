import type { Metadata } from "next"

import { LoginForm } from "@/components/login-form"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { siteConfig } from "@/lib/brand"

export const metadata: Metadata = {
  title: "Sign in",
  description: `Sign in to your ${siteConfig.name} account to manage subscription.`,
  alternates: { canonical: "/login" },
}

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader variant="page" />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-primary">Welcome back</p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Sign in
          </h1>
          <p className="text-pretty text-muted-foreground">
            Use the same phone and password as the {siteConfig.name} mobile app.
          </p>
        </div>
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <LoginForm />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
