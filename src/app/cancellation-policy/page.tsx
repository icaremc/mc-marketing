import type { Metadata } from "next"

import { LegalDocumentPage } from "@/components/legal-document-page"
import { fetchLegalSections } from "@/lib/legal-documents"
import { siteConfig } from "@/lib/brand"

export const metadata: Metadata = {
  title: "Cancellation policy",
  description: `Appointment cancellation, automatic refunds, and doctor fines on ${siteConfig.name}.`,
  alternates: {
    canonical: "/cancellation-policy",
  },
}

export default async function CancellationPolicyPage() {
  const sections = await fetchLegalSections("cancellation-policy")
  return (
    <LegalDocumentPage
      pageTitle="Appointment cancellation policy"
      sections={sections}
    />
  )
}
