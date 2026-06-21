"use client"

import Link from "next/link"
import { MenuIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"

export function HeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <Button asChild size="sm" className="hidden sm:inline-flex">
        <Link href="#download">Download app</Link>
      </Button>

      <Sheet>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="md:hidden"
            aria-label="Open menu"
          >
            <MenuIcon aria-hidden="true" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="gap-0 p-0">
          <SheetHeader className="border-b">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-2 p-4">
            <Button asChild variant="ghost" className="justify-start">
              <Link href="#how-it-works">How it works</Link>
            </Button>
            <Button asChild variant="ghost" className="justify-start">
              <Link href="#features">Features</Link>
            </Button>
            <Button asChild variant="ghost" className="justify-start">
              <Link href="#download">Download</Link>
            </Button>
            <Button asChild variant="ghost" className="justify-start">
              <Link href="#faq">FAQ</Link>
            </Button>
            <Button asChild variant="ghost" className="justify-start">
              <Link href="/contact">Contact</Link>
            </Button>
            <div className="pt-2">
              <Button asChild className="w-full">
                <Link href="#download">Download app</Link>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
