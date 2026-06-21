const UNSAFE_MESSAGE =
  /<\/?html|error:\s*error|at\s+\w+\s*\(|ECONNREFUSED|ENOTFOUND|fetch failed/i

function isSafeClientMessage(message: string): boolean {
  const trimmed = message.trim()
  return (
    trimmed.length > 0 &&
    trimmed.length <= 320 &&
    !UNSAFE_MESSAGE.test(trimmed)
  )
}

/** Show backend validation / business errors in production; hide stacks and HTML. */
export function clientSafeError(
  error: unknown,
  fallback: string
): string {
  if (process.env.NODE_ENV === "development") {
    return error instanceof Error ? error.message : fallback
  }
  if (error instanceof Error && isSafeClientMessage(error.message)) {
    return error.message.trim()
  }
  return fallback
}

import { ApiRequestError } from "@/lib/api-request-error"

/** Map upstream status to a client status (4xx pass through, else 502). */
export function clientErrorStatus(error: unknown, fallback = 502): number {
  if (error instanceof ApiRequestError && error.statusCode >= 400 && error.statusCode < 500) {
    return error.statusCode
  }
  return fallback
}
