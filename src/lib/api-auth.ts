export function getBearerToken(request: Request): string | undefined {
  const header = request.headers.get("authorization")
  if (header?.startsWith("Bearer ")) {
    return header.slice(7).trim()
  }
  return undefined
}

export function authHeaders(token: string): HeadersInit {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }
}
