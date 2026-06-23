import type { Metadata } from "next"

import { LegalDocumentPage } from "@/components/legal-document-page"
import { termsOfServiceSections } from "@/lib/legal-content"
import { siteConfig } from "@/lib/brand"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms governing your use of the ${siteConfig.name} app and website.`,
  alternates: {
    canonical: "/terms",
  },
}

export default function TermsPage() {
  return (
    <LegalDocumentPage pageTitle="Terms of Service" sections={termsOfServiceSections} />
  )
}
