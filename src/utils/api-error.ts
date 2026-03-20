import { StatusCodes, getReasonPhrase } from "http-status-codes";

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "TOKEN_REUSE_DETECTED"
  | "INTERNAL_ERROR";

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: unknown;

  constructor(statusCode: number, code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static badRequest(message: string, details?: unknown): ApiError {
    return new ApiError(StatusCodes.BAD_REQUEST, "VALIDATION_ERROR", message, details);
  }

  static unauthorized(message = "Unauthorized"): ApiError {
    return new ApiError(StatusCodes.UNAUTHORIZED, "UNAUTHORIZED", message);
  }

  static forbidden(message = "Forbidden"): ApiError {
    return new ApiError(StatusCodes.FORBIDDEN, "FORBIDDEN", message);
  }

  static notFound(resource = "Resource"): ApiError {
    return new ApiError(
      StatusCodes.NOT_FOUND,
      "NOT_FOUND",
      `${resource} ${getReasonPhrase(StatusCodes.NOT_FOUND).toLowerCase()}`
    );
  }

  static conflict(message: string): ApiError {
    return new ApiError(StatusCodes.CONFLICT, "CONFLICT", message);
  }

  static rateLimited(message = "Too many requests"): ApiError {
    return new ApiError(StatusCodes.TOO_MANY_REQUESTS, "RATE_LIMITED", message);
  }

  static tokenReuse(): ApiError {
    return new ApiError(
      StatusCodes.UNAUTHORIZED,
      "TOKEN_REUSE_DETECTED",
      "Refresh token reuse detected — all sessions revoked"
    );
  }

  static internal(message = "Internal server error"): ApiError {
    return new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", message);
  }

  toJSON(): Record<string, unknown> {
    return {
      status: this.statusCode,
      code: this.code,
      message: this.message,
      ...(this.details ? { details: this.details } : {}),
    };
  }
}
