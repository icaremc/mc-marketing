import type { Metadata } from "next"

import { LegalDocumentPage } from "@/components/legal-document-page"
import { fetchLegalSections } from "@/lib/legal-documents"
import { siteConfig } from "@/lib/brand"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms governing your use of the ${siteConfig.name} app and website.`,
  alternates: {
    canonical: "/terms",
  },
}

export default async function TermsPage() {
  const sections = await fetchLegalSections("terms-of-service")
  return (
    <LegalDocumentPage pageTitle="Terms of Service" sections={sections} />
  )
}
