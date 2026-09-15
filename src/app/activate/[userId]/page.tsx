import type { Metadata } from "next"
import Link from "next/link"

import { ActivationCheckout } from "@/app/activate/[userId]/activation-checkout"
import { SiteHeader } from "@/components/site-header"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { isUuid } from "@/lib/membership"

export const metadata: Metadata = {
  title: "Activate account",
  robots: { index: false, follow: false },
}

type PageProps = {
  params: Promise<{ userId: string }>
  searchParams: Promise<{ token?: string; from?: string }>
}

export default async function ActivatePage({ params, searchParams }: PageProps) {
  const { userId: rawUserId } = await params
  const query = await searchParams
  const userId = decodeURIComponent(rawUserId)
  const fromIos = query.from === "ios"
  const token = query.token?.trim()

  if (!isUuid(userId)) {
    return (
      <div className="flex min-h-full flex-1 flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-lg px-4 py-16 sm:px-6">
          <Card>
            <CardHeader>
              <CardTitle>Invalid activation link</CardTitle>
              <CardDescription>
                This link is missing a valid account id. Open the link from the
                ICare MC app, or sign in on the website.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild variant="outline">
                <Link href={`/login${fromIos ? "?from=ios" : ""}`}>Sign in</Link>
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
        <p className="mb-6 text-sm text-muted-foreground">
          Activate your ICare MC membership on the web
          {fromIos ? " (opened from the iOS app)" : ""}. After payment, open the
          app and sign in with the same phone and password.
        </p>
        <ActivationCheckout
          userId={userId}
          initialToken={token}
          fromIos={fromIos}
        />
      </main>
    </div>
  )
}
