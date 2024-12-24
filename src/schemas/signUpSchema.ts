import { z } from "zod";

export const usernameValidation = z
  .string()
  .min(4, "Username must be atleast 2 characters")
  .max(20, "Username must not exceed 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username must not contain special charcters");

export const signupSchema = z.object({
  username: usernameValidation,
  email: z.string().email({ message: "Inavlid email address" }),
  password: z
    .string()
    .min(6, { message: "password must be atleast 6 characters" }),
});


