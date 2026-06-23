import type { Metadata } from "next"

import { LegalDocumentPage } from "@/components/legal-document-page"
import { privacyPolicySections } from "@/lib/legal-content"
import { siteConfig } from "@/lib/brand"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.name} collects, uses, and protects your information.`,
  alternates: {
    canonical: "/privacy",
  },
}

export default function PrivacyPage() {
  return (
    <LegalDocumentPage pageTitle="Privacy Policy" sections={privacyPolicySections} />
  )
}
