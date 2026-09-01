"use client"

import Link from "next/link"
import { MailIcon, PhoneIcon } from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { StoreBadges } from "@/components/store-badges"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { siteConfig } from "@/lib/brand"

export default function ContactPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader variant="page" />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <section className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-primary">Contact</p>
              <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                Talk to the {siteConfig.name} team.
              </h1>
              <p className="max-w-xl text-pretty text-muted-foreground sm:text-lg">
                Questions about the app, subscriptions, doctor booking, or your
                account? We are here to help mothers and caregivers across Ethiopia.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {siteConfig.supportPhones.map((phone) => (
                <Button key={phone} asChild size="lg" className="w-fit">
                  <a href={`tel:${phone}`}>
                    <PhoneIcon data-icon="inline-start" aria-hidden="true" />
                    Call {phone}
                  </a>
                </Button>
              ))}
              <Button asChild size="lg" variant="outline" className="w-fit">
                <a href={`mailto:${siteConfig.supportEmail}`}>
                  <MailIcon data-icon="inline-start" aria-hidden="true" />
                  Email support
                </a>
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Get the app</CardTitle>
              <CardDescription>
                Download {siteConfig.name} to track pregnancy and child growth,
                read daily tips, and book doctors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StoreBadges />
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-2 border-t [.border-t]:pt-6">
              <p className="text-sm text-muted-foreground">
                Prefer the website for now?
              </p>
              <Button asChild variant="outline">
                <Link href="/#download">View download links</Link>
              </Button>
            </CardFooter>
          </Card>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
