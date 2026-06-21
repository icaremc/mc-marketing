"use client"

import { type ReactNode, useEffect } from "react"

import { initializeAuthSession } from "@/store/slices/authSlice"
import { useAppDispatch } from "@/store/hooks"

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    void dispatch(initializeAuthSession())
  }, [dispatch])

  return <>{children}</>
}
