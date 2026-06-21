"use client"

export {
  buildSessionFromLogin,
} from "@/store/slices/authSlice"
export { useRequireSession, useSession } from "@/store/useSession"

/** @deprecated Use ReduxProvider in root layout instead. */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
