import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username should be atleast 3 characters")
    .max(15)
    .trim(),
  password: z
    .string()
    .trim()
    .min(8, "Password should be 8 characters long")
    .max(255),
});
