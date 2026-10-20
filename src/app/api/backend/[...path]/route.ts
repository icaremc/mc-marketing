import { NextResponse } from "next/server"

import { authedFetch } from "@/lib/api/authed"

type RouteContext = { params: Promise<{ path: string[] }> }

async function proxy(
  request: Request,
  context: RouteContext,
  method: string,
) {
  const { path } = await context.params
  const joined = `/${path.map(encodeURIComponent).join("/")}`
  let json: unknown
  const contentType = request.headers.get("content-type") ?? ""
  if (method !== "GET" && method !== "DELETE") {
    if (contentType.includes("application/json")) {
      try {
        json = await request.json()
      } catch {
        json = undefined
      }
    }
  }

  const url = new URL(request.url)
  const searchParams: Record<string, string> = {}
  url.searchParams.forEach((value, key) => {
    searchParams[key] = value
  })

  const result = await authedFetch(joined, {
    method,
    json,
    searchParams:
      Object.keys(searchParams).length > 0 ? searchParams : undefined,
  })

  if (!result.ok) {
    return NextResponse.json(
      { error: result.message, detail: result.data },
      { status: result.status || 502 },
    )
  }
  return NextResponse.json(result.data ?? { ok: true })
}

export async function GET(request: Request, context: RouteContext) {
  return proxy(request, context, "GET")
}

export async function POST(request: Request, context: RouteContext) {
  return proxy(request, context, "POST")
}

export async function PATCH(request: Request, context: RouteContext) {
  return proxy(request, context, "PATCH")
}

export async function PUT(request: Request, context: RouteContext) {
  return proxy(request, context, "PUT")
}

export async function DELETE(request: Request, context: RouteContext) {
  return proxy(request, context, "DELETE")
}
