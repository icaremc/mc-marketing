import Link from "next/link"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { siteConfig } from "@/lib/brand"

export default function PrivacyPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader variant="page" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-8 text-muted-foreground">
            <p className="text-sm">
              Effective date: <span className="font-medium">June 21, 2026</span>
            </p>
            <p className="text-sm">
              This Privacy Policy explains how {siteConfig.name} (“we”, “us”)
              collects, uses, and protects information when you use our mobile app
              and website.
            </p>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-medium text-foreground">1) Information we collect</h2>
              <ul className="flex list-disc flex-col gap-2 pl-5 text-sm">
                <li>Account details such as phone number, name, and language preference</li>
                <li>Pregnancy profile information such as due date and related dates you choose to enter</li>
                <li>Health logs and notes you save in the app</li>
                <li>Appointment and doctor booking information</li>
                <li>Device, app usage, and diagnostic data needed to operate and improve the Service</li>
              </ul>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-medium text-foreground">2) How we use information</h2>
              <ul className="flex list-disc flex-col gap-2 pl-5 text-sm">
                <li>Provide pregnancy tracking, tips, and app features</li>
                <li>Enable doctor booking and messaging after appointments</li>
                <li>Send service notifications you opt into</li>
                <li>Improve reliability, security, and support</li>
              </ul>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-medium text-foreground">3) Sharing</h2>
              <p className="text-sm">
                We do not sell your personal information. We may share data with
                service providers that help us operate the app, with doctors or
                clinics when you book care, or when required by law.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-medium text-foreground">4) Your choices</h2>
              <p className="text-sm">
                You can update profile information in the app and contact us to
                request access, correction, or deletion where applicable under
                local law.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-medium text-foreground">5) Contact</h2>
              <p className="text-sm">
                Privacy questions:{" "}
                <a
                  href={`mailto:${siteConfig.supportEmail}`}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {siteConfig.supportEmail}
                </a>
              </p>
            </section>

            <Button asChild variant="outline" className="w-fit">
              <Link href="/">Back to home</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  )
}
