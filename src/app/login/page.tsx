import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { StoreBadges } from "@/components/store-badges"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { siteConfig } from "@/lib/brand"

export const metadata: Metadata = {
  title: "Sign in",
  description: `Sign in to ${siteConfig.name} on your mobile device.`,
}

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader variant="page" />

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12 sm:px-6">
        <Card>
          <CardHeader className="items-center text-center">
            <Image
              src="/logo-icon.png"
              alt=""
              width={72}
              height={72}
              className="mb-2"
              aria-hidden
            />
            <CardTitle className="text-xl">Sign in on your phone</CardTitle>
            <CardDescription>
              {siteConfig.name} accounts are managed in the mobile app. Download
              the app to create an account or sign in with your phone number.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <StoreBadges className="justify-center" />
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Back to home</Link>
            </Button>
          </CardContent>
        </Card>
      </main>

      <SiteFooter />
    </div>
  )
}
