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

  const url = new URL(request.url)
  const branchId = url.searchParams.get("branch_id")?.trim()

  const path = branchId
    ? `/api/v1/business/${encodeURIComponent(businessId)}/branches/${encodeURIComponent(branchId)}/employees`
    : `/api/v1/business/${encodeURIComponent(businessId)}/employees`

  const response = await fetch(apiUrl(path), {
    headers: authHeaders(token),
    cache: "no-store",
  })

  if (!response.ok) {
    return NextResponse.json(
      { error: parseApiError(response.status, await response.text()) },
      { status: response.status }
    )
  }

  const staff = await response.json()
  return NextResponse.json({ staff })
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

  const businessId = body.business_id?.toString().trim()
  const phoneNumber = body.phone_number?.toString().trim()
  const roleId = body.role_id?.toString().trim()
  const branchId = body.branch_id?.toString().trim()

  if (!businessId) {
    return NextResponse.json({ error: "business_id is required." }, { status: 400 })
  }
  if (!phoneNumber) {
    return NextResponse.json({ error: "phone_number is required." }, { status: 400 })
  }
  if (!roleId) {
    return NextResponse.json({ error: "role_id is required." }, { status: 400 })
  }
  if (!branchId) {
    return NextResponse.json({ error: "branch_id is required." }, { status: 400 })
  }

  const upstreamBody: Record<string, string> = {
    business_id: businessId,
    phone_number: phoneNumber,
    role_id: roleId,
    branch_id: branchId,
  }
  const username = body.username?.toString().trim()
  const email = body.email?.toString().trim()
  if (username) upstreamBody.username = username
  if (email) upstreamBody.email = email

  const response = await fetch(
    apiUrl("/api/v1/business/employees/create-user"),
    {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(upstreamBody),
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
