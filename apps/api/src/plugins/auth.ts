import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

import { verifyAccessToken, type JwtPayload } from '../lib/jwt.js';
import prisma from '../lib/prisma.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload & { id: string };
  }
}

/** Extract + verify JWT from Authorization header or ts_session cookie */
async function extractUser(request: FastifyRequest): Promise<(JwtPayload & { id: string }) | null> {
  let token: string | undefined;

  // 1. Authorization header
  const authHeader = request.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  }

  // 2. Cookie fallback (SSR)
  if (!token) {
    token = request.cookies['ts_session'];
  }

  if (!token) return null;

  try {
    const payload = await verifyAccessToken(token);
    return { ...payload, id: payload.sub };
  } catch {
    return null;
  }
}

/** Decorate every request with user (optional) */
export function registerAuthDecorator(server: FastifyInstance) {
  server.addHook('preHandler', async (request) => {
    request.user = (await extractUser(request)) ?? undefined;
  });
}

/** Require authenticated user */
export function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  if (!request.user) {
    return reply.status(401).send({ type: 'authentication_required', title: 'Not authenticated', status: 401 });
  }
}

/** Require ADMIN role */
export function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  if (!request.user) {
    return reply.status(401).send({ type: 'authentication_required', title: 'Not authenticated', status: 401 });
  }
  if (request.user.role !== 'ADMIN') {
    return reply.status(403).send({ type: 'forbidden', title: 'Forbidden', status: 403 });
  }
}

/** Require AGENT or ADMIN role */
export function requireAgent(request: FastifyRequest, reply: FastifyReply) {
  if (!request.user) {
    return reply.status(401).send({ type: 'authentication_required', title: 'Not authenticated', status: 401 });
  }
  if (!['AGENT', 'ADMIN'].includes(request.user.role)) {
    return reply.status(403).send({ type: 'forbidden', title: 'Forbidden — agent role required', status: 403 });
  }
}
