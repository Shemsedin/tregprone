import { z } from 'zod';

import { CURRENCY, LOCALE, USER_ROLE } from './enums.js';

export const UserPublicSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string().url().nullable(),
  role: z.enum(USER_ROLE),
  createdAt: z.string().datetime(),
});
export type UserPublic = z.infer<typeof UserPublicSchema>;

export const UserMeSchema = UserPublicSchema.extend({
  email: z.string().email(),
  phone: z.string().nullable(),
  locale: z.enum(LOCALE),
  emailVerified: z.string().datetime().nullable(),
});
export type UserMe = z.infer<typeof UserMeSchema>;

export const RegisterSchema = z
  .object({
    email: z.string().email().max(254),
    password: z
      .string()
      .min(8)
      .max(128)
      .regex(/[A-Za-z]/, 'Must contain a letter')
      .regex(/\d/, 'Must contain a digit'),
    name: z.string().min(2).max(100),
    role: z.enum(['USER', 'AGENT'] as const).default('USER'),
  })
  .strict();
export type Register = z.infer<typeof RegisterSchema>;

export const LoginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(1),
  })
  .strict();
export type Login = z.infer<typeof LoginSchema>;

export const UpdateUserSchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    phone: z.string().max(30).optional(),
    locale: z.enum(LOCALE).optional(),
    avatarUrl: z.string().url().optional(),
  })
  .strict();
export type UpdateUser = z.infer<typeof UpdateUserSchema>;

export const AuthResponseSchema = z.object({
  user: UserMeSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const ForgotPasswordSchema = z.object({ email: z.string().email() }).strict();
export type ForgotPassword = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z
  .object({ token: z.string(), newPassword: z.string().min(8).max(128) })
  .strict();
export type ResetPassword = z.infer<typeof ResetPasswordSchema>;

export const PaginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

export const CURRENCY_SYMBOL: Record<string, string> = {
  ALL: 'L',
  EUR: '€',
  MKD: 'ден',
  USD: '$',
};
