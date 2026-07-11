import type { Metadata } from "next"

import { LegalDocumentPage } from "@/components/legal-document-page"
import { doctorPrivacyPolicySections } from "@/lib/legal-content"

export const metadata: Metadata = {
  title: "iCare Doctors Privacy Policy",
  description:
    "How iCare Doctors collects, uses, and protects healthcare provider information.",
  alternates: {
    canonical: "/doctors/privacy",
  },
}

export default function DoctorPrivacyPage() {
  return (
    <LegalDocumentPage
      pageTitle="iCare Doctors Privacy Policy"
      sections={doctorPrivacyPolicySections}
    />
  )
}
