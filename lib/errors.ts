import { ZodError } from "zod";

import { logger } from "@/lib/logger";

export class AppError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 400, code = "app_error") {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }
}

export function toErrorResponse(error: unknown, fallbackMessage: string) {
  if (error instanceof AppError) {
    logger.warn(error.message, {
      code: error.code,
      status: error.status
    });

    return Response.json(
      {
        error: error.message,
        code: error.code
      },
      { status: error.status }
    );
  }

  if (error instanceof ZodError) {
    logger.warn("Validation error", {
      issues: error.issues
    });

    return Response.json(
      {
        error: "Request validation failed.",
        code: "validation_error",
        issues: error.flatten()
      },
      { status: 422 }
    );
  }

  logger.error(fallbackMessage, {
    error: error instanceof Error ? error.message : String(error)
  });

  return Response.json(
    {
      error: fallbackMessage,
      code: "internal_error"
    },
    { status: 500 }
  );
}
