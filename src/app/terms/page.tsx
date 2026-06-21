import Link from "next/link"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { siteConfig } from "@/lib/brand"

export default function TermsPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader variant="page" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-8 text-muted-foreground">
            <p className="text-sm">
              Effective date: <span className="font-medium">June 21, 2026</span>
            </p>
            <p className="text-sm">
              These Terms govern your use of {siteConfig.name} (the “Service”), a
              mother and child health companion app. By downloading or using the
              Service, you agree to these Terms.
            </p>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-medium text-foreground">1) The Service</h2>
              <p className="text-sm">
                {siteConfig.name} provides pregnancy tracking, educational content,
                health logging tools, and doctor booking features. The Service is
                for informational and care-coordination purposes and does not
                replace professional medical advice, diagnosis, or emergency care.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-medium text-foreground">2) Your account</h2>
              <p className="text-sm">
                You are responsible for the accuracy of information you provide and
                for keeping your login credentials secure. You must be legally able
                to enter into these Terms in your jurisdiction.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-medium text-foreground">3) Health information</h2>
              <p className="text-sm">
                Content in the app is general guidance and may not apply to your
                specific situation. Always consult a qualified healthcare provider
                for medical decisions. In an emergency, contact local emergency
                services immediately.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-medium text-foreground">4) Doctor bookings</h2>
              <p className="text-sm">
                Appointments booked through {siteConfig.name} are subject to doctor
                availability, clinic policies, and any fees shown at booking time.
                We facilitate scheduling but do not provide medical services
                directly.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-medium text-foreground">5) Contact</h2>
              <p className="text-sm">
                Questions about these Terms:{" "}
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
