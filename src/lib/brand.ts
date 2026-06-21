export const siteConfig = {
  name: "ICare MC",
  shortName: "ICare MC",
  tagline: "Dedicated to your health",
  taglineAm: "ለጤነዎ የሚተጋ",
  title: "ICare MC | Mother & child health",
  description:
    "Track pregnancy weeks, daily health tips, doctor appointments, and milestones for mothers and caregivers. Available in English, Amharic, and Oromo.",
  locale: "en_US",
  themeColor: "#4CAF8A",
  supportEmail: "support@icare-mc.com",
  supportPhone: "0912323811",
  playStoreUrl:
    process.env.NEXT_PUBLIC_PLAY_STORE_URL ??
    "https://play.google.com/store/apps/details?id=com.example.icare_mc",
  appStoreUrl:
    process.env.NEXT_PUBLIC_APP_STORE_URL ??
    "https://apps.apple.com/app/icare-mc",
} as const
