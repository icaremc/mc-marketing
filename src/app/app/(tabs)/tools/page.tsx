import Link from "next/link"
import { CalendarDays, Clock, HeartPulse, Scale } from "lucide-react"

import { AppTopBar } from "@/components/app/app-top-bar"
import { HomeSectionHeader } from "@/components/app/home-surface"
import { fetchActivePregnancy } from "@/lib/api/pregnancy"

const TOOLS = [
  {
    href: "/app/tools/calculator",
    title: "EDD",
    subtitle: "Find your due date",
    Icon: CalendarDays,
  },
  {
    href: "/app/tools/calculator",
    title: "Gestational Age",
    subtitle: "Check your weeks",
    Icon: Clock,
  },
  {
    href: "/app/tools/bmi",
    title: "Pregnancy weight-gain tracker",
    subtitle: "Track weight gain with a chart",
    Icon: Scale,
  },
  {
    href: "/app/tools/bp",
    title: "Blood pressure",
    subtitle: "Check BP category & guidance",
    Icon: HeartPulse,
  },
] as const

export default async function ToolsTabPage() {
  const pregnancy = await fetchActivePregnancy()

  return (
    <>
      <AppTopBar title="Tools" />
      <div className="flex flex-col px-5 pb-6 pt-2">
        {pregnancy ? (
          <div className="mb-7 rounded-xl bg-card px-4 py-3.5 shadow-[0_0_0_1px_rgba(0,0,0,0.04)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
            <p className="text-sm font-bold">
              Week {pregnancy.weekNumber}
              {pregnancy.edd
                ? ` · Due ${new Date(pregnancy.edd).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
                : ""}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Recorded pregnancy — tools use your LMP / EDD.
            </p>
          </div>
        ) : null}

        <HomeSectionHeader title="Tracking tools" />
        <div className="grid grid-cols-2 gap-3">
          {TOOLS.map((tool) => (
            <Link
              key={tool.title}
              href={tool.href}
              className="flex min-h-[120px] flex-col rounded-xl bg-card px-3.5 pb-3 pt-3.5 shadow-[0_0_0_1px_rgba(0,0,0,0.04)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
            >
              <span className="flex size-9 items-center justify-center rounded-[10px] bg-primary/15 text-primary">
                <tool.Icon className="size-4" />
              </span>
              <p className="mt-2.5 truncate text-sm font-bold leading-tight">
                {tool.title}
              </p>
              <p className="mt-1 line-clamp-2 text-[12px] font-medium leading-snug text-muted-foreground">
                {tool.subtitle}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
