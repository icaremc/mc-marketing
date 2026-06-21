import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SanitizeActivationUrl } from "@/components/auth/sanitize-activation-url"
import { parseActivationIds } from "@/lib/activation"
import { verifyChapaTransaction } from "@/lib/chapa"

export const metadata: Metadata = {
  title: "Activation successful",
  robots: { index: false, follow: false },
}

type PageProps = {
  params: Promise<{ userId: string }>
  searchParams: Promise<{
    business_id?: string
    trx_ref?: string
    tx_ref?: string
    already_active?: string
  }>
}

export default async function ActivationSuccessPage({
  params,
  searchParams,
}: PageProps) {
  const { userId } = await params
  const query = await searchParams
  const businessId = query.business_id
  const txRef = query.trx_ref ?? query.tx_ref
  const alreadyActive = query.already_active === "1"

  const parsed = parseActivationIds(userId, businessId)
  if (!parsed.ok) {
    return (
      <ActivationResult
        title="Invalid link"
        description={parsed.message}
        variant="error"
        userId={userId}
        businessId={businessId}
      />
    )
  }

  if (alreadyActive) {
    redirect("/dashboard")
  }

  if (!txRef) {
    return (
      <ActivationResult
        title="Payment pending"
        description="We did not receive a transaction reference. If you paid, open the TinaVerify app and refresh your business status."
        variant="warning"
        userId={userId}
        businessId={businessId!}
      />
    )
  }

  let paid = false
  let verifyError: string | null = null

  try {
    const data = await verifyChapaTransaction(txRef)
    paid = data?.status === "success"
  } catch (error) {
    verifyError =
      error instanceof Error ? error.message : "Could not verify payment."
  }

  if (verifyError) {
    return (
      <ActivationResult
        title="Verification issue"
        description={verifyError}
        variant="warning"
        userId={userId}
        businessId={businessId!}
      />
    )
  }

  if (!paid) {
    return (
      <ActivationResult
        title="Payment not completed"
        description="Your payment was not confirmed yet. Try again or contact support@tinaverify.com with your receipt."
        variant="warning"
        userId={userId}
        businessId={businessId!}
      />
    )
  }

  redirect("/dashboard?payment=confirmed")
}

function ActivationResult({
  title,
  description,
  variant,
  userId,
  businessId,
}: {
  title: string
  description: string
  variant: "success" | "warning" | "error"
  userId: string
  businessId?: string
}) {
  const retryHref =
    businessId != null
      ? `/${userId}?business_id=${encodeURIComponent(businessId)}`
      : `/${userId}`

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SanitizeActivationUrl />
      <SiteHeader />
      <main className="mx-auto w-full max-w-lg px-4 py-16 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-wrap gap-3 [.border-t]:border-t">
            <Button asChild variant="outline">
              <Link href="/">Home</Link>
            </Button>
            <Button asChild>
              <Link href={retryHref}>Try again</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
