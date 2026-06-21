import type { Metadata } from "next"
import Link from "next/link"

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
  title: "Payment cancelled",
  robots: { index: false, follow: false },
}

type PageProps = {
  params: Promise<{ userId: string }>
  searchParams: Promise<{ business_id?: string }>
}

export default async function ActivationCancelPage({
  params,
  searchParams,
}: PageProps) {
  const { userId } = await params
  const { business_id: businessId } = await searchParams
  const parsed = parseActivationIds(userId, businessId)

  const retryHref =
    parsed.ok && businessId
      ? `/${userId}?business_id=${encodeURIComponent(businessId)}`
      : "/"

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-lg px-4 py-16 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment cancelled</CardTitle>
            <CardDescription>
              {parsed.ok
                ? "No charge was made. You can choose a plan and try again when ready."
                : parsed.message}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-wrap gap-3 [.border-t]:border-t">
            <Button asChild variant="outline">
              <Link href="/">Home</Link>
            </Button>
            {parsed.ok ? (
              <Button asChild>
                <Link href={retryHref}>Back to activation</Link>
              </Button>
            ) : null}
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
