"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"

export function StackBackButton({ fallbackHref }: { fallbackHref: string }) {
  const router = useRouter()
  return (
    <button
      type="button"
      aria-label="Back"
      className="inline-flex size-10 items-center justify-center rounded-md text-inherit hover:bg-black/5 dark:hover:bg-white/10"
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back()
          return
        }
        router.push(fallbackHref)
      }}
    >
      <ChevronLeft className="size-6" />
    </button>
  )
}
