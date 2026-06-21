import type { Metadata } from "next"
import Link from "next/link"

import { SanitizeActivationUrl } from "@/components/auth/sanitize-activation-url"
import { ActivationCheckout } from "@/app/[userId]/activation-checkout"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { parseActivationIds } from "@/lib/activation"

export const metadata: Metadata = {
  title: "Activate account",
  robots: { index: false, follow: false },
}

type PageProps = {
  params: Promise<{ userId: string }>
  searchParams: Promise<{
    business_id?: string
  }>
}

export default async function ActivationPage({ params, searchParams }: PageProps) {
  const { userId } = await params
  const query = await searchParams
  const businessId = query.business_id

  const parsed = parseActivationIds(userId, businessId)
  if (!parsed.ok) {
    return (
      <div className="flex min-h-full flex-1 flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-lg px-4 py-16 sm:px-6">
          <Card>
            <CardHeader>
              <CardTitle>Invalid activation link</CardTitle>
              <CardDescription>{parsed.message}</CardDescription>
            </CardHeader>
            <CardFooter className="[.border-t]:border-t">
              <Button asChild variant="outline">
                <Link href="/">Back to home</Link>
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-6 text-sm text-muted-foreground">
          Activate your business subscription on the web (same flow as the
          TinaVerify app). Sign in if you already registered.
        </div>
        <SanitizeActivationUrl />
        <ActivationCheckout
          userId={userId}
          businessId={businessId!}
        />
      </main>
    </div>
  )
}
