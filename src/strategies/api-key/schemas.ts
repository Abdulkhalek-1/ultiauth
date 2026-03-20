import { z } from "zod/v4";

export const generateKeySchema = z.object({
  name: z
    .string()
    .min(1, "Key name is required")
    .max(100, "Key name must be at most 100 characters"),
  scopes: z
    .array(z.string().min(1))
    .default([]),
  expiresInDays: z
    .number()
    .int()
    .min(1)
    .max(365)
    .optional(),
});

export const revokeKeySchema = z.object({
  keyId: z.uuid("Invalid key ID"),
});

export type GenerateKeyInput = z.infer<typeof generateKeySchema>;
export type RevokeKeyInput = z.infer<typeof revokeKeySchema>;
