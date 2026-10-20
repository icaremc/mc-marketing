import { NextResponse, type NextRequest } from "next/server"

import {
  DOCTOR_APP_PREFIX,
  PATIENT_APP_PREFIX,
  loginPathForRole,
  type AppRole,
} from "@/lib/auth/roles"
import { sessionCookieNames } from "@/lib/session"

function readRole(request: NextRequest): AppRole | null {
  const role = request.cookies.get(sessionCookieNames.role)?.value
  if (role === "patient" || role === "doctor") return role

  const raw = request.cookies.get(sessionCookieNames.roles)?.value
  if (!raw) return null
  try {
    const roles = JSON.parse(raw) as string[]
    if (roles.includes("patient")) return "patient"
    if (roles.includes("doctor")) return "doctor"
  } catch {
    return null
  }
  return null
}

function hasSession(request: NextRequest): boolean {
  return Boolean(
    request.cookies.get(sessionCookieNames.access)?.value &&
      request.cookies.get(sessionCookieNames.refresh)?.value,
  )
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPatientApp =
    pathname === PATIENT_APP_PREFIX || pathname.startsWith(`${PATIENT_APP_PREFIX}/`)
  const isDoctorApp =
    pathname === DOCTOR_APP_PREFIX || pathname.startsWith(`${DOCTOR_APP_PREFIX}/`)

  if (!isPatientApp && !isDoctorApp) return NextResponse.next()

  const required: AppRole = isDoctorApp ? "doctor" : "patient"
  const authed = hasSession(request)
  const role = readRole(request)

  if (!authed) {
    const url = request.nextUrl.clone()
    url.pathname = loginPathForRole(required).split("?")[0]
    url.search = ""
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  if (role && role !== required) {
    const url = request.nextUrl.clone()
    url.pathname = role === "doctor" ? DOCTOR_APP_PREFIX : PATIENT_APP_PREFIX
    url.search = ""
    return NextResponse.redirect(url)
  }

  if (!role) {
    const url = request.nextUrl.clone()
    url.pathname = loginPathForRole(required).split("?")[0]
    url.search = ""
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-pathname", pathname)
  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: ["/app/:path*", "/doctors/app/:path*"],
}
