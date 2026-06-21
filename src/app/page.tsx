import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { LandingHero } from "@/components/landing-hero"
import { HowItWorks } from "@/components/how-it-works"
import { FeaturesSection } from "@/components/features-section"
import { FaqSection } from "@/components/faq-section"
import { DownloadAppCta } from "@/components/download-app-cta-section"

export default function Home() {
	return (
		<div className="flex min-h-full flex-1 flex-col">
			<a
				href="#main"
				className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-xl focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:shadow-md focus:ring-3 focus:ring-ring/40"
			>
				Skip to content
			</a>

			<SiteHeader variant="home" />

			<main id="main" className="flex-1">
				<LandingHero />
				<HowItWorks />
				<FeaturesSection />
				<FaqSection />
				<DownloadAppCta />
			</main>

			<SiteFooter />
		</div>
	)
}
