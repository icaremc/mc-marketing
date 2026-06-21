/** Thrown when an upstream TinaVerify API call fails with a parsed, user-safe message. */
export class ApiRequestError extends Error {
  readonly statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.name = "ApiRequestError"
    this.statusCode = statusCode
  }
}
