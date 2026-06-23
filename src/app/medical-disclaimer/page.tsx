import type { Metadata } from "next"

import { LegalDocumentPage } from "@/components/legal-document-page"
import { medicalDisclaimerSections } from "@/lib/legal-content"
import { siteConfig } from "@/lib/brand"

export const metadata: Metadata = {
  title: "Medical disclaimer",
  description: `Health information disclaimer for ${siteConfig.name}.`,
  alternates: {
    canonical: "/medical-disclaimer",
  },
}

export default function MedicalDisclaimerPage() {
  return (
    <LegalDocumentPage
      pageTitle="Medical disclaimer"
      sections={medicalDisclaimerSections}
    />
  )
}
