import { NextResponse } from "next/server"

import { apiUrl } from "@/lib/api-backend"
import { authHeaders } from "@/lib/api-auth"
import { parseApiError } from "@/lib/api-errors"
import { requireBearer } from "@/lib/route-auth"
import { isUuid } from "@/lib/uuid"

type RouteContext = { params: Promise<{ branchId: string }> }

function invalidBranchId(): NextResponse {
  return NextResponse.json({ error: "Invalid branch id." }, { status: 400 })
}

export async function GET(request: Request, context: RouteContext) {
  const token = requireBearer(request)
  if (token instanceof NextResponse) return token

  const { branchId } = await context.params
  if (!isUuid(branchId)) return invalidBranchId()
  const response = await fetch(apiUrl(`/api/v1/branches/${encodeURIComponent(branchId)}`), {
    headers: authHeaders(token),
    cache: "no-store",
  })

  if (!response.ok) {
    return NextResponse.json(
      { error: parseApiError(response.status, await response.text()) },
      { status: response.status }
    )
  }

  return NextResponse.json(await response.json())
}

export async function PUT(request: Request, context: RouteContext) {
  const token = requireBearer(request)
  if (token instanceof NextResponse) return token

  const { branchId } = await context.params
  if (!isUuid(branchId)) return invalidBranchId()
  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 })
  }

  const payload: Record<string, unknown> = {}
  if (body.name != null) payload.name = body.name
  if (body.address != null) payload.address = body.address
  if (body.is_head_quarter != null) payload.is_head_quarter = body.is_head_quarter
  if (body.is_archived != null) payload.is_archived = body.is_archived

  const response = await fetch(apiUrl(`/api/v1/branches/${encodeURIComponent(branchId)}`), {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
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

export async function DELETE(request: Request, context: RouteContext) {
  const token = requireBearer(request)
  if (token instanceof NextResponse) return token

  const { branchId } = await context.params
  if (!isUuid(branchId)) return invalidBranchId()
  const response = await fetch(apiUrl(`/api/v1/branches/${encodeURIComponent(branchId)}`), {
    method: "DELETE",
    headers: authHeaders(token),
  })

  if (!response.ok && response.status !== 204) {
    return NextResponse.json(
      { error: parseApiError(response.status, await response.text()) },
      { status: response.status }
    )
  }

  return NextResponse.json({ ok: true })
}
