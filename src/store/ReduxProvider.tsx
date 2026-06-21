"use client"

import { type ReactNode } from "react"
import { Provider } from "react-redux"

import { AuthBootstrap } from "@/store/AuthBootstrap"
import { store } from "@/store/store"

export function ReduxProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <AuthBootstrap>{children}</AuthBootstrap>
    </Provider>
  )
}
