"use client"

import { useTheme } from "next-themes"
import { useEffect, useRef } from "react"

/** Apply profile `dark_mode` once, same as Flutter AppThemeController.applyFromPreferences. */
export function AppThemeSync({ darkMode }: { darkMode: boolean }) {
  const { setTheme } = useTheme()
  const applied = useRef(false)

  useEffect(() => {
    if (applied.current) return
    applied.current = true
    setTheme(darkMode ? "dark" : "light")
  }, [darkMode, setTheme])

  return null
}
