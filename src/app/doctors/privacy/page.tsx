import type { Metadata } from "next"

import { LegalDocumentPage } from "@/components/legal-document-page"
import { fetchLegalSections } from "@/lib/legal-documents"

export const metadata: Metadata = {
  title: "iCare Doctors Privacy Policy",
  description:
    "How iCare Doctors collects, uses, and protects healthcare provider information.",
  alternates: {
    canonical: "/doctors/privacy",
  },
}

export default async function DoctorPrivacyPage() {
  const sections = await fetchLegalSections("doctors-privacy-policy")
  return (
    <LegalDocumentPage
      pageTitle="iCare Doctors Privacy Policy"
      sections={sections}
    />
  )
}
