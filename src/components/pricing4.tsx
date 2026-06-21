import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface PricingPlan {
  name: string
  monthlyPrice: string
  priceSuffix?: string
  features: string[]
  buttonText: string
  isPopular?: boolean
  href?: string
}

interface Pricing4Props {
  title?: string
  description?: string
  plans?: PricingPlan[]
  className?: string
  id?: string
}

const Pricing4 = ({
  title = "Pricing",
  description = "Check out our affordable pricing plans.",
  plans = [],
  className,
  id,
}: Pricing4Props) => {
  return (
    <section id={id} className={cn("py-16 sm:py-24", className)}>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-6">
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {title}
          </h2>
          <p className="max-w-3xl text-pretty text-base text-white/60 sm:text-lg">
            {description}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "flex min-h-[320px] flex-col rounded-3xl border p-6 shadow-sm transition-transform duration-200 hover:-translate-y-0.5",
                  plan.isPopular
                    ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "border-white/10 bg-[#121212] text-white"
                )}
              >
                <p
                  className={cn(
                    "text-sm font-medium uppercase tracking-wide",
                    plan.isPopular
                      ? "text-primary-foreground/90"
                      : "text-white/70"
                  )}
                >
                  {plan.name}
                </p>
                <p
                  className={cn(
                    "mt-6 font-mono text-4xl font-bold tracking-tight [font-variant-numeric:tabular-nums]",
                    plan.isPopular ? "text-primary-foreground" : "text-white"
                  )}
                >
                  {plan.monthlyPrice}
                </p>
                {plan.priceSuffix !== "" && (
                  <p
                    className={cn(
                      "mt-1 text-sm",
                      plan.isPopular
                        ? "text-primary-foreground/80"
                        : "text-white/60"
                    )}
                  >
                    {plan.priceSuffix ?? "per transaction"}
                  </p>
                )}
                <Separator
                  className={cn(
                    "my-6",
                    plan.isPopular ? "bg-primary-foreground/20" : "bg-white/10"
                  )}
                />
                <ul
                  className={cn(
                    "flex flex-1 flex-col gap-3 text-sm",
                    plan.isPopular
                      ? "text-primary-foreground/90"
                      : "text-white/70"
                  )}
                >
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant={plan.isPopular ? "secondary" : "outline"}
                  className={cn(
                    "mt-8 w-full rounded-full",
                    plan.isPopular
                      ? "bg-zinc-950 text-white hover:bg-zinc-900"
                      : "border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Link href={plan.href ?? "/register"}>{plan.buttonText}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export { Pricing4 }
