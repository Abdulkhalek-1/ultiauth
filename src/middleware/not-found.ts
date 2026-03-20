import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export function notFound(_req: Request, res: Response): void {
  res.status(StatusCodes.NOT_FOUND).json({
    status: StatusCodes.NOT_FOUND,
    code: "NOT_FOUND",
    message: "Route not found",
  });
}
