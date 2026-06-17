import { z } from "zod";

export const signupSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    fatherName: z.string().min(2, "Father name is required"),
    cnic: z
      .string()
      .regex(/^\d{5}-\d{7}-\d{1}$/, "CNIC format: XXXXX-XXXXXXX-X"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
    profileImage: z.string().url().optional().or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const profileSchema = z.object({
  fullName: z.string().min(2).optional(),
  fatherName: z.string().min(2).optional(),
  cnic: z
    .string()
    .regex(/^\d{5}-\d{7}-\d{1}$/)
    .optional(),
  email: z.string().email().optional(),
  profileImage: z.string().url().optional().or(z.literal("")),
});

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z
      .string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[0-9]/),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
