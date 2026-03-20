import { z } from "zod/v4";

export const sessionLoginSchema = z.object({
  login: z.string().min(1, "Login (username or email) is required"),
  password: z.string().min(1, "Password is required"),
});

export type SessionLoginInput = z.infer<typeof sessionLoginSchema>;
