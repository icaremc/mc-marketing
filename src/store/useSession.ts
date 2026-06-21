"use client"

import { useCallback } from "react"

import type { AuthSession } from "@/lib/auth-session"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  authActions,
  logoutUser,
  selectAuthReady,
  selectAuthSession,
} from "@/store/slices/authSlice"

export function useSession() {
  const dispatch = useAppDispatch()
  const session = useAppSelector(selectAuthSession)
  const ready = useAppSelector(selectAuthReady)

  const setSession = useCallback(
    (next: AuthSession) => {
      dispatch(authActions.setSession(next))
    },
    [dispatch]
  )

  const setBusinessId = useCallback(
    (businessId: string) => {
      dispatch(authActions.setBusinessId(businessId))
    },
    [dispatch]
  )

  const logout = useCallback(() => {
    void dispatch(logoutUser())
  }, [dispatch])

  return { session, ready, setSession, setBusinessId, logout }
}

export function useRequireSession(): AuthSession {
  const { session, ready } = useSession()
  if (!ready || !session) {
    throw new Error("Session not ready")
  }
  return session
}
