import { NextResponse } from "next/server"

import { apiUrl } from "@/lib/api-backend"
import { authHeaders } from "@/lib/api-auth"
import { parseApiError } from "@/lib/api-errors"
import { fetchUserBusinesses } from "@/lib/auth-login"
import { requireBearer } from "@/lib/route-auth"

export async function GET(request: Request) {
  const token = requireBearer(request)
  if (token instanceof NextResponse) return token

  try {
    const businesses = await fetchUserBusinesses(token)
    return NextResponse.json({ businesses })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load businesses."
    return NextResponse.json({ error: message }, { status: 502 })
  }
}

export async function POST(request: Request) {
  const token = requireBearer(request)
  if (token instanceof NextResponse) return token

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 })
  }

  const response = await fetch(apiUrl("/api/v1/business"), {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  })

  const raw = await response.text()
  if (!response.ok) {
    return NextResponse.json(
      { error: parseApiError(response.status, raw) },
      { status: response.status }
    )
  }

  try {
    return NextResponse.json(JSON.parse(raw))
  } catch {
    return NextResponse.json({ ok: true })
  }
}
