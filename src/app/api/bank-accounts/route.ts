import { NextResponse } from "next/server"

import { apiUrl } from "@/lib/api-backend"
import { authHeaders } from "@/lib/api-auth"
import { parseApiError } from "@/lib/api-errors"
import { requireBearer, requireBusinessId } from "@/lib/route-auth"

export async function GET(request: Request) {
  const token = requireBearer(request)
  if (token instanceof NextResponse) return token

  const businessId = requireBusinessId(request)
  if (businessId instanceof NextResponse) return businessId

  const response = await fetch(
    `${apiUrl("/api/v1/bank-accounts")}?business_id=${encodeURIComponent(businessId)}`,
    { headers: authHeaders(token), cache: "no-store" }
  )

  if (!response.ok) {
    return NextResponse.json(
      { error: parseApiError(response.status, await response.text()) },
      { status: response.status }
    )
  }

  const accounts = await response.json()
  return NextResponse.json({ accounts })
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

  const response = await fetch(apiUrl("/api/v1/bank-accounts"), {
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
