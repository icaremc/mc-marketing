import { NextResponse } from "next/server"

import { apiUrl } from "@/lib/api-backend"
import { authHeaders } from "@/lib/api-auth"
import { parseApiError } from "@/lib/api-errors"
import { requireBearer } from "@/lib/route-auth"
import { isUuid } from "@/lib/uuid"

type RouteContext = { params: Promise<{ businessId: string }> }

function invalidBusinessId(): NextResponse {
  return NextResponse.json({ error: "Invalid business id." }, { status: 400 })
}

export async function GET(request: Request, context: RouteContext) {
  const token = requireBearer(request)
  if (token instanceof NextResponse) return token

  const { businessId } = await context.params
  if (!isUuid(businessId)) return invalidBusinessId()
  const response = await fetch(
    apiUrl(`/api/v1/business/${encodeURIComponent(businessId)}`),
    { headers: authHeaders(token), cache: "no-store" }
  )

  if (!response.ok) {
    return NextResponse.json(
      { error: parseApiError(response.status, await response.text()) },
      { status: response.status }
    )
  }

  return NextResponse.json(await response.json())
}

/** Update business name/TIN when the backend supports it. */
export async function PUT(request: Request, context: RouteContext) {
  const token = requireBearer(request)
  if (token instanceof NextResponse) return token

  const { businessId } = await context.params
  if (!isUuid(businessId)) return invalidBusinessId()
  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 })
  }

  const payload: Record<string, unknown> = {}
  if (body.name != null) payload.name = body.name
  if (body.tin_number != null) payload.tin_number = body.tin_number

  const response = await fetch(
    apiUrl(`/api/v1/business/${encodeURIComponent(businessId)}`),
    {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    }
  )

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

/** Set business active state — `PATCH /api/v1/business/{id}/deactivate` */
export async function PATCH(request: Request, context: RouteContext) {
  const token = requireBearer(request)
  if (token instanceof NextResponse) return token

  const { businessId } = await context.params
  if (!isUuid(businessId)) return invalidBusinessId()
  let body: { is_active?: boolean }
  try {
    body = (await request.json()) as { is_active?: boolean }
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 })
  }

  if (typeof body.is_active !== "boolean") {
    return NextResponse.json(
      { error: "is_active (boolean) is required." },
      { status: 400 }
    )
  }

  const response = await fetch(
    apiUrl(`/api/v1/business/${encodeURIComponent(businessId)}/deactivate`),
    {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify({ is_active: body.is_active }),
    }
  )

  if (!response.ok) {
    return NextResponse.json(
      { error: parseApiError(response.status, await response.text()) },
      { status: response.status }
    )
  }

  const raw = await response.text()
  if (!raw.trim()) {
    return NextResponse.json({ ok: true })
  }
  try {
    return NextResponse.json(JSON.parse(raw))
  } catch {
    return NextResponse.json({ ok: true })
  }
}
