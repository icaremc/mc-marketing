import { NextResponse } from "next/server"

import { authMe, bearerToken, isUuid } from "@/lib/membership"
import { backendFetch } from "@/lib/backend"

export async function GET(request: Request) {
  const token = bearerToken(request)
  if (!token) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 })
  }

  const url = new URL(request.url)
  const userId = url.searchParams.get("user_id")?.trim() ?? ""
  if (!isUuid(userId)) {
    return NextResponse.json({ error: "Invalid user id." }, { status: 400 })
  }

  const me = await authMe(token)
  if (!me || me.id !== userId) {
    return NextResponse.json({ error: "Session does not match account." }, { status: 403 })
  }

  const sub = await backendFetch<{
    id?: string
    status?: string
    ends_at?: string
    starts_at?: string
  } | null>("/subscriptions/app", { token })

  if (!sub.ok) {
    return NextResponse.json(
      { error: sub.message || "Could not load membership." },
      { status: sub.status >= 400 ? sub.status : 500 },
    )
  }

  const data = sub.data
  const endsAt = data?.ends_at ? new Date(data.ends_at) : null
  const active =
    data?.status === "active" && endsAt != null && endsAt.getTime() > Date.now()

  return NextResponse.json({
    active,
    endsAt: data?.ends_at ?? null,
    status: data?.status ?? null,
  })
}
