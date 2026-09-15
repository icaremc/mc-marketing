import { NextResponse } from "next/server"

import {
  bearerToken,
  isUuid,
  supabaseWithToken,
} from "@/lib/membership"

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

  const supabase = supabaseWithToken(token)
  if (!supabase) {
    return NextResponse.json({ error: "Service unavailable." }, { status: 503 })
  }

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user || userData.user.id !== userId) {
    return NextResponse.json({ error: "Session does not match account." }, { status: 403 })
  }

  const { data, error } = await supabase
    .from("app_subscriptions")
    .select("id, status, ends_at, starts_at")
    .eq("patient_id", userId)
    .order("ends_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const endsAt = data?.ends_at ? new Date(data.ends_at) : null
  const active =
    data?.status === "active" && endsAt != null && endsAt.getTime() > Date.now()

  return NextResponse.json({
    active,
    endsAt: data?.ends_at ?? null,
    status: data?.status ?? null,
  })
}
