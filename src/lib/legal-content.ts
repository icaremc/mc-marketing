import { siteConfig } from "@/lib/brand"

export const legalEffectiveDate = "June 21, 2026"

export type LegalSection = {
  title: string
  body: string
}

const support = siteConfig.supportEmail
const appName = siteConfig.name
const doctorAppName = "iCare Doctors"

export const privacyPolicySections: LegalSection[] = [
  {
    title: "Privacy Policy",
    body: `Effective date: ${legalEffectiveDate}

This Privacy Policy explains how ${appName} ("we", "us") collects, uses, shares, and protects information when you use our mobile application, website, and related services.`,
  },
  {
    title: "1. Information we collect",
    body: `Account information: name, email address, phone number, account type (e.g. mother or guardian), and password (stored securely by our authentication provider).

Health and pregnancy data: due dates, gestational age, pregnancy week logs, symptoms, vitals (weight, blood pressure, temperature), notes, child birth dates, growth records, and optional health history you choose to provide.

Profile and care preferences: city or area, preferred hospital or clinic.

Appointment and payment data: booking details, appointment status, payment references from Chapa (transaction reference, amount paid). We do not store full payment card numbers.

Messages: chat content between you and healthcare providers through the app.

Device data: push notification token (FCM), device type, and app settings such as language and theme stored locally.

Technical data: IP address and standard server logs when you use cloud features (via Supabase and our backend).`,
  },
  {
    title: "2. How we use information",
    body: `We use your information to:
• create and manage your account;
• personalize pregnancy and child health content;
• save and sync your health logs and appointments;
• enable messaging and notifications about appointments and care;
• process online payments for bookings;
• improve app security and performance;
• comply with legal obligations.`,
  },
  {
    title: "3. How we share information",
    body: `We share information only as needed to operate the Service:

Healthcare providers: appointment and chat information with doctors or clinics you choose to book or message.

Service providers: Supabase (database and authentication), Firebase Cloud Messaging (push notifications), Chapa (payment processing), and hosting providers that process data on our behalf under contractual safeguards.

Legal requirements: when required by law, court order, or to protect rights, safety, and security.

We do not sell your personal information. We do not use your data for third-party advertising.`,
  },
  {
    title: "4. Data storage and security",
    body: `Account and health data are stored in secure cloud infrastructure. Local preferences may be stored on your device. We use industry-standard measures including encryption in transit (HTTPS/TLS) and access controls. No method of transmission or storage is 100% secure.`,
  },
  {
    title: "5. Data retention",
    body: `We retain your information while your account is active and as needed to provide the Service, resolve disputes, and meet legal obligations. You may request account deletion by contacting ${support}.`,
  },
  {
    title: "6. Your choices and rights",
    body: `You can update profile information in the app, manage notification preferences in Settings, and access privacy and terms documents at any time. Depending on applicable law, you may request access, correction, or deletion of your personal data by emailing ${support}.`,
  },
  {
    title: "7. Children",
    body: `The Service is intended for parents and guardians. Health information about children is collected only when provided by a parent or guardian using the app.`,
  },
  {
    title: "8. International transfers",
    body: `Your data may be processed in countries where our service providers operate. We take steps to ensure appropriate safeguards when data is transferred internationally.`,
  },
  {
    title: "9. Changes to this policy",
    body: `We may update this Privacy Policy. We will post the updated policy on this website and in the app, and revise the effective date. Material changes may be communicated through the app or email where appropriate.`,
  },
  {
    title: "10. Contact",
    body: `Privacy questions or requests: ${support}`,
  },
]

export const doctorPrivacyPolicySections: LegalSection[] = [
  {
    title: "Privacy Policy",
    body: `Effective date: ${legalEffectiveDate}

This Privacy Policy explains how ${doctorAppName} ("we", "us") collects, uses, shares, and protects information when healthcare providers use the ${doctorAppName} provider application and related services. ${doctorAppName} is the companion app for doctors and clinicians who offer care through the ${appName} platform.`,
  },
  {
    title: "1. Information we collect",
    body: `Account information: name, email address, phone number, and password (stored securely by our authentication provider).

Professional profile: medical specialty, medical license number, hospital or clinic affiliation, years of experience, professional biography, consultation services and fees, availability schedule, and profile photo.

Verification documents: images of your medical license and degree or qualification certificates that you upload so administrators can verify your account before approval.

Payout and financial information: bank account holder name, bank name, account number, wallet balance, earnings, and withdrawal/payout requests. We do not store full payment card numbers.

Patient interaction data: appointments booked with you (including patient name and phone number provided for the booking), appointment status, and chat messages between you and patients through the app.

Device data: push notification token (FCM), device type, and app settings such as theme stored locally.

Technical data: IP address and standard server logs when you use cloud features (via Supabase and our backend).`,
  },
  {
    title: "2. How we use information",
    body: `We use your information to:
• create, verify, and manage your provider account;
• display your profile, specialty, availability, and fees to patients;
• enable appointment booking and secure messaging with patients;
• calculate earnings and process withdrawal/payout requests to your bank account;
• send notifications about appointments, messages, and account status;
• review verification documents for account approval;
• improve app security and performance;
• comply with legal obligations.`,
  },
  {
    title: "3. How we share information",
    body: `We share information only as needed to operate the Service:

Patients: your professional profile, specialty, availability, consultation fees, and chat messages with patients who book or message you.

Administrators: your verification documents and profile information are reviewed by ${appName} administrators to approve and manage your account.

Service providers: Supabase (database and authentication), Firebase Cloud Messaging (push notifications), Chapa and our payment partners (processing payouts), and hosting providers that process data on our behalf under contractual safeguards.

Legal requirements: when required by law, court order, or to protect rights, safety, and security.

We do not sell your personal information. We do not use your data for third-party advertising.`,
  },
  {
    title: "4. Data storage and security",
    body: `Account, profile, verification, and financial data are stored in secure cloud infrastructure. Local preferences may be stored on your device. We use industry-standard measures including encryption in transit (HTTPS/TLS) and access controls. No method of transmission or storage is 100% secure.`,
  },
  {
    title: "5. Data retention",
    body: `We retain your information while your account is active and as needed to provide the Service, settle payouts, resolve disputes, and meet legal and financial record-keeping obligations. You may request account deletion by contacting ${support}.`,
  },
  {
    title: "6. Your choices and rights",
    body: `You can update your profile, services, availability, and bank details in the app, and manage notification preferences in Settings. Depending on applicable law, you may request access, correction, or deletion of your personal data by emailing ${support}. Some financial records may be retained where required by law even after account deletion.`,
  },
  {
    title: "7. Patient data responsibilities",
    body: `When you access patient information through the Service to provide care, you are responsible for handling it confidentially and in accordance with applicable medical privacy and professional obligations. You must not use patient information for any purpose other than delivering care through the platform.`,
  },
  {
    title: "8. International transfers",
    body: `Your data may be processed in countries where our service providers operate. We take steps to ensure appropriate safeguards when data is transferred internationally.`,
  },
  {
    title: "9. Changes to this policy",
    body: `We may update this Privacy Policy. We will post the updated policy on this website and in the app, and revise the effective date. Material changes may be communicated through the app or email where appropriate.`,
  },
  {
    title: "10. Contact",
    body: `Privacy questions or requests: ${support}`,
  },
]

export const termsOfServiceSections: LegalSection[] = [
  {
    title: "Terms of Service",
    body: `Effective date: ${legalEffectiveDate}

These Terms of Service ("Terms") govern your use of the ${appName} mobile application, website, and related services ("Service") operated by iCare MC ("we", "us", or "our"). By creating an account or using the Service, you agree to these Terms.`,
  },
  {
    title: "1. Eligibility",
    body: `You must be at least 18 years old to create an account. If you use the Service on behalf of a child, you represent that you are the parent or legal guardian and consent to the collection of health-related information about that child as described in our Privacy Policy.`,
  },
  {
    title: "2. Nature of the Service",
    body: `${appName} provides maternal and child health education, pregnancy tracking tools, growth milestones, appointment booking, secure messaging with healthcare providers, and optional online payments for medical services. The Service is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider with questions about a medical condition.`,
  },
  {
    title: "3. Accounts",
    body: `You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account. You agree to provide accurate registration information and to update it when it changes. We may suspend or terminate accounts that violate these Terms or applicable law.`,
  },
  {
    title: "4. Health information you provide",
    body: `You may enter pregnancy dates, health logs, child growth data, and related notes. You are responsible for the accuracy of information you submit. Healthcare providers you interact with through the Service may rely on information you provide when offering care.`,
  },
  {
    title: "5. Appointments and payments",
    body: `Appointment availability, pricing, and clinical services are provided by independent healthcare facilities and professionals. Online payments processed through Chapa or other payment partners are subject to their terms as well. If a doctor cancels a paid booking, the service fee is refunded automatically to the patient wallet and the doctor may be fined under the Appointment cancellation policy. Chapa gateway fees are not refunded. See the Cancellation policy for full details. We are not responsible for care delivered at a clinic or hospital outside the app.`,
  },
  {
    title: "6. Acceptable use",
    body: `You agree not to misuse the Service, including by: attempting unauthorized access; uploading harmful or illegal content; harassing providers or other users; reverse engineering the app; or using the Service in a way that could harm others or overload our systems.`,
  },
  {
    title: "7. Intellectual property",
    body: `The Service, including text, graphics, logos, and software, is owned by us or our licensors and protected by applicable intellectual property laws. You receive a limited, non-exclusive, non-transferable license to use the app for personal, non-commercial purposes.`,
  },
  {
    title: "8. Disclaimer of warranties",
    body: `THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR THAT HEALTH CONTENT IS COMPLETE OR CURRENT.`,
  },
  {
    title: "9. Limitation of liability",
    body: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE AND OUR AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF DATA, PROFITS, OR GOODWILL, ARISING FROM YOUR USE OF THE SERVICE OR RELIANCE ON HEALTH INFORMATION IN THE APP.`,
  },
  {
    title: "10. Termination",
    body: `You may stop using the Service at any time. We may suspend or terminate access if you breach these Terms or if required by law. Provisions that by their nature should survive termination will remain in effect.`,
  },
  {
    title: "11. Changes",
    body: `We may update these Terms from time to time. We will post the revised Terms on this website and in the app and update the effective date. Continued use after changes constitutes acceptance of the updated Terms.`,
  },
  {
    title: "12. Governing law",
    body: `These Terms are governed by the laws of the Federal Democratic Republic of Ethiopia, without regard to conflict-of-law principles, except where mandatory consumer protections in your country apply.`,
  },
  {
    title: "13. Contact",
    body: `Questions about these Terms: ${support}`,
  },
]

export const medicalDisclaimerSections: LegalSection[] = [
  {
    title: "Medical disclaimer",
    body: `${appName} is an educational and care-coordination tool. Content about pregnancy, child development, and general health is for informational purposes only.`,
  },
  {
    title: "Not medical advice",
    body: `Nothing in the app constitutes medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional for medical questions, emergencies, or before making health decisions for yourself or your child.`,
  },
  {
    title: "Emergency",
    body: `If you think you or your child may have a medical emergency, call your local emergency number immediately. In Ethiopia, ambulance service is available at 907.`,
  },
  {
    title: "Provider relationship",
    body: `Doctors and clinics listed in the app are independent professionals and facilities. ${appName} does not guarantee outcomes of medical care received through appointments booked in the app.`,
  },
]

export const aboutAppSections: LegalSection[] = [
  {
    title: "About",
    body: `An app that helps mothers understand the care they should give themselves and their children.`,
  },
  {
    title: "Mission",
    body: `Share clear health information with mothers, fathers, and caregivers, supporting safety at every stage and helping spot concerns early.`,
  },
  {
    title: "Vision",
    body: `A trusted maternal and child health app in Ethiopia and beyond, for growth monitoring, counseling, and early awareness.`,
  },
  {
    title: "Disclaimer",
    body: `Educational resources only. This does not replace professional medical advice. Always consult a qualified healthcare provider.`,
  },
]

export const cancellationPolicySections: LegalSection[] = [
  {
    title: "Appointment cancellation policy",
    body: `Effective date: ${legalEffectiveDate}

This policy explains what happens when an appointment is cancelled on ${appName} and ${doctorAppName}. By booking or accepting appointments, you agree to these rules.`,
  },
  {
    title: "1. Doctor availability",
    body: `Doctors set their own weekly schedule and open time slots. When a patient books and pays for a slot, the doctor is expected to keep that appointment.`,
  },
  {
    title: "2. If the doctor cancels",
    body: `When a doctor cancels a paid appointment:
• The patient is refunded automatically to their ${appName} wallet (the service fee that was paid).
• Chapa gateway transaction fees are not refunded.
• A cancellation penalty may be deducted from the doctor's wallet when enabled by the platform.
• The time slot becomes available again for other patients.`,
  },
  {
    title: "3. Doctor cancellation fine",
    body: `Because doctors control their own availability, cancelling a paid booking may result in a fixed fine deducted from the doctor's wallet balance. The fine amount is set by iCare admin. If the doctor's available balance is lower than the fine, only the available balance is deducted.`,
  },
  {
    title: "4. If the patient cancels",
    body: `Patients may cancel while the appointment is still pending. Paid amounts are refunded to the patient wallet (service fee only). Chapa gateway fees are not refunded. No doctor fine applies when the patient cancels.`,
  },
  {
    title: "5. Using wallet refunds",
    body: `Wallet refunds can be used for future doctor bookings on ${appName}. Wallet balance is not a bank payout unless the platform offers a separate withdrawal process.`,
  },
  {
    title: "6. Contact",
    body: `Questions about cancellations or refunds: ${support}`,
  },
]

export type LegalDocumentSlug =
  | "terms-of-service"
  | "privacy-policy"
  | "medical-disclaimer"
  | "cancellation-policy"
  | "about-app"

export function bundledSectionsFor(slug: LegalDocumentSlug): LegalSection[] {
  switch (slug) {
    case "terms-of-service":
      return termsOfServiceSections
    case "privacy-policy":
      return privacyPolicySections
    case "medical-disclaimer":
      return medicalDisclaimerSections
    case "cancellation-policy":
      return cancellationPolicySections
    case "about-app":
      return aboutAppSections
  }
}

