import { NextResponse } from "next/server"

import { backendFetch } from "@/lib/backend"
import { clearSessionCookies, getSessionTokens } from "@/lib/session"

export async function POST() {
  const session = await getSessionTokens()
  if (session?.refreshToken) {
    await backendFetch("/auth/logout", {
      method: "POST",
      json: { refresh_token: session.refreshToken },
      token: session.accessToken,
    })
  }
  await clearSessionCookies()
  return NextResponse.json({ ok: true })
}
