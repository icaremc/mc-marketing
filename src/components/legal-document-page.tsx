import Link from "next/link"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LegalSection } from "@/lib/legal-content"

type LegalDocumentPageProps = {
  pageTitle: string
  sections: LegalSection[]
}

export function LegalDocumentPage({ pageTitle, sections }: LegalDocumentPageProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader variant="page" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>{pageTitle}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-8 text-muted-foreground">
            {sections.map((section) => (
              <section key={section.title} className="flex flex-col gap-3">
                {section.title !== pageTitle ? (
                  <h2 className="text-base font-medium text-foreground">{section.title}</h2>
                ) : null}
                <p className="whitespace-pre-line text-sm leading-relaxed">{section.body}</p>
              </section>
            ))}
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
