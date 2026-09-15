export const siteConfig = {
  name: "ICare MC",
  shortName: "ICare MC",
  tagline: "Dedicated to your health",
  taglineAm: "ለጤነዎ የሚተጋ",
  title: "ICare MC | Mother & child health",
  description:
    "Track pregnancy weeks, child growth, vaccination reminders, daily health tips, and doctor appointments. Optional in-app subscription for premium content. Available in English, Amharic, and Oromo.",
  siteUrl: "https://www.icaremchealth.com",
  locale: "en_US",
  themeColor: "#4CAF8A",
  supportEmail: "support@icaremchealth.com",
  supportPhones: ["0964607777", "0964407777"] as const,
  privacyPolicyUrl: "https://www.icaremchealth.com/privacy",
  doctorPrivacyPolicyUrl: "https://www.icaremchealth.com/doctors/privacy",
  termsOfServiceUrl: "https://www.icaremchealth.com/terms",
  medicalDisclaimerUrl: "https://www.icaremchealth.com/medical-disclaimer",
  playStoreUrl:
    "https://play.google.com/store/apps/details?id=com.icaremc.app",
  appStoreUrl: "https://apps.apple.com/app/icare-mc",
  /** Custom URL scheme registered in the patient iOS/Android app. */
  appLoginDeepLink: "icaremc://login",
} as const
