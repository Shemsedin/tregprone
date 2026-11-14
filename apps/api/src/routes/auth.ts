import crypto from 'node:crypto';

import { hash, verify } from 'argon2';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { RegisterSchema, LoginSchema, ForgotPasswordSchema, ResetPasswordSchema } from '@treg/types';

import { signAccessToken, REFRESH_TTL } from '../lib/jwt.js';
import prisma from '../lib/prisma.js';
import { sendPasswordResetEmail, sendVerificationEmail } from '../lib/mail.js';

const ARGON2_OPTIONS = { memoryCost: 19456, timeCost: 2, parallelism: 1 };
const REFRESH_COOKIE = 'ts_refresh';
const SESSION_COOKIE = 'ts_session';
const BASE_URL = process.env['PUBLIC_APP_URL'] ?? 'http://localhost:3000';

function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

function generateRefreshToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function authRoutes(server: FastifyInstance) {
  // POST /v1/auth/register
  server.post('/register', async (request, reply) => {
    const body = RegisterSchema.parse(request.body);

    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      return reply.status(409).send({
        type: 'conflict',
        title: 'Email already registered',
        status: 409,
      });
    }

    const passwordHash = await hash(body.password, ARGON2_OPTIONS);
    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        passwordHash,
        role: body.role,
      },
    });

    // Generate email verification token
    const verifyToken = crypto.randomBytes(32).toString('hex');
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(`verify:${verifyToken}`),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    await sendVerificationEmail(user.email, verifyToken, BASE_URL).catch(() => {});

    const accessToken = await signAccessToken({ sub: user.id, role: user.role, email: user.email });
    const refreshToken = generateRefreshToken();

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshHash: hashToken(refreshToken),
        userAgent: request.headers['user-agent'],
        ipHash: hashToken(request.ip),
        expiresAt: new Date(Date.now() + REFRESH_TTL * 1000),
      },
    });

    setTokenCookies(reply, accessToken, refreshToken);

    return reply.status(201).send({
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    });
  });

  // POST /v1/auth/login
  server.post('/login', async (request, reply) => {
    const body = LoginSchema.parse(request.body);

    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user?.passwordHash) {
      return reply.status(401).send({ type: 'invalid_credentials', title: 'Invalid email or password', status: 401 });
    }

    if (user.suspended) {
      return reply.status(403).send({ type: 'account_suspended', title: 'Account suspended', status: 403 });
    }

    const valid = await verify(user.passwordHash, body.password);
    if (!valid) {
      return reply.status(401).send({ type: 'invalid_credentials', title: 'Invalid email or password', status: 401 });
    }

    const accessToken = await signAccessToken({ sub: user.id, role: user.role, email: user.email });
    const refreshToken = generateRefreshToken();

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshHash: hashToken(refreshToken),
        userAgent: request.headers['user-agent'],
        ipHash: hashToken(request.ip),
        expiresAt: new Date(Date.now() + REFRESH_TTL * 1000),
      },
    });

    setTokenCookies(reply, accessToken, refreshToken);
    return reply.send({ user: sanitizeUser(user), accessToken, refreshToken });
  });

  // POST /v1/auth/refresh
  server.post('/refresh', async (request, reply) => {
    const rawRefresh = request.cookies[REFRESH_COOKIE] ??
      (request.body as Record<string, string> | null)?.['refreshToken'];

    if (!rawRefresh) {
      return reply.status(401).send({ type: 'no_refresh_token', title: 'No refresh token', status: 401 });
    }

    const tokenHash = hashToken(rawRefresh);
    const session = await prisma.session.findFirst({
      where: { refreshHash: tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
      include: { user: true },
    });

    if (!session) {
      return reply.status(401).send({ type: 'invalid_refresh_token', title: 'Invalid or expired refresh token', status: 401 });
    }

    // Rotate
    const newRefresh = generateRefreshToken();
    await prisma.session.update({
      where: { id: session.id },
      data: { refreshHash: hashToken(newRefresh), expiresAt: new Date(Date.now() + REFRESH_TTL * 1000) },
    });

    const accessToken = await signAccessToken({
      sub: session.user.id,
      role: session.user.role,
      email: session.user.email,
    });

    setTokenCookies(reply, accessToken, newRefresh);
    return reply.send({ accessToken, refreshToken: newRefresh });
  });

  // POST /v1/auth/logout
  server.post('/logout', async (request, reply) => {
    const rawRefresh = request.cookies[REFRESH_COOKIE];
    if (rawRefresh) {
      await prisma.session.updateMany({
        where: { refreshHash: hashToken(rawRefresh) },
        data: { revokedAt: new Date() },
      });
    }
    reply.clearCookie(SESSION_COOKIE, { path: '/' });
    reply.clearCookie(REFRESH_COOKIE, { path: '/v1/auth/refresh' });
    return reply.status(204).send();
  });

  // POST /v1/auth/forgot-password
  server.post('/forgot-password', async (request, reply) => {
    const body = ForgotPasswordSchema.parse(request.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });

    // Always 202 to prevent email enumeration
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(token),
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });
      await sendPasswordResetEmail(user.email, token, BASE_URL).catch(() => {});
    }

    return reply.status(202).send({ message: 'If the email exists, a reset link was sent.' });
  });

  // POST /v1/auth/reset-password
  server.post('/reset-password', async (request, reply) => {
    const body = ResetPasswordSchema.parse(request.body);
    const tokenHash = hashToken(body.token);

    const record = await prisma.passwordResetToken.findFirst({
      where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
    });

    if (!record) {
      return reply.status(400).send({ type: 'invalid_token', title: 'Invalid or expired reset token', status: 400 });
    }

    const passwordHash = await hash(body.newPassword, ARGON2_OPTIONS);
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      // Revoke all sessions
      prisma.session.updateMany({ where: { userId: record.userId }, data: { revokedAt: new Date() } }),
    ]);

    return reply.send({ message: 'Password reset successfully.' });
  });

  // GET /v1/auth/me
  server.get('/me', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : request.cookies[SESSION_COOKIE];
    if (!token) return reply.status(401).send({ type: 'unauthenticated', status: 401 });

    const { verifyAccessToken } = await import('../lib/jwt.js');
    let payload;
    try {
      payload = await verifyAccessToken(token);
    } catch {
      return reply.status(401).send({ type: 'invalid_token', status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return reply.status(401).send({ type: 'user_not_found', status: 401 });

    return reply.send({ user: sanitizeUser(user) });
  });
}

function setTokenCookies(reply: ReturnType<FastifyInstance['reply']>, accessToken: string, refreshToken: string) {
  const secure = process.env['NODE_ENV'] === 'production';
  reply.setCookie(SESSION_COOKIE, accessToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 900,
  });
  reply.setCookie(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/v1/auth/refresh',
    maxAge: REFRESH_TTL,
  });
}

function sanitizeUser(user: { id: string; email: string; name: string; role: string; avatarUrl: string | null; phone: string | null; locale: string; emailVerified: Date | null; createdAt: Date }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
    phone: user.phone,
    locale: user.locale,
    emailVerified: user.emailVerified?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}
