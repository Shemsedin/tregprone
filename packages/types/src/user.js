import { z } from 'zod';
import { CURRENCY, LOCALE, USER_ROLE } from './enums.js';
export const UserPublicSchema = z.object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string().url().nullable(),
    role: z.enum(USER_ROLE),
    createdAt: z.string().datetime(),
});
export const UserMeSchema = UserPublicSchema.extend({
    email: z.string().email(),
    phone: z.string().nullable(),
    locale: z.enum(LOCALE),
    emailVerified: z.string().datetime().nullable(),
});
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
    role: z.enum(['USER', 'AGENT']).default('USER'),
})
    .strict();
export const LoginSchema = z
    .object({
    email: z.string().email(),
    password: z.string().min(1),
})
    .strict();
export const UpdateUserSchema = z
    .object({
    name: z.string().min(2).max(100).optional(),
    phone: z.string().max(30).optional(),
    locale: z.enum(LOCALE).optional(),
    avatarUrl: z.string().url().optional(),
})
    .strict();
export const AuthResponseSchema = z.object({
    user: UserMeSchema,
    accessToken: z.string(),
    refreshToken: z.string(),
});
export const ForgotPasswordSchema = z.object({ email: z.string().email() }).strict();
export const ResetPasswordSchema = z
    .object({ token: z.string(), newPassword: z.string().min(8).max(128) })
    .strict();
export const PaginationSchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    cursor: z.string().optional(),
});
export const CURRENCY_SYMBOL = {
    ALL: 'L',
    EUR: '€',
    MKD: 'ден',
    USD: '$',
};
