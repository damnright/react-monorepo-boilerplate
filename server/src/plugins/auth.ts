import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt.js';
import { prisma } from '../utils/prisma.js';

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      userId: string;
      email: string;
      role: 'admin' | 'user';
    };
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireRole: (role: 'admin' | 'user') => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const authPlugin: FastifyPluginAsync = async (fastify) => {
  // 认证装饰器
  fastify.decorate('authenticate', async function (request, reply) {
    try {
      const token = extractTokenFromHeader(request.headers.authorization);
      
      if (!token) {
        return reply.status(401).send({
          error: 'UNAUTHORIZED',
          message: '需要提供访问令牌',
        });
      }

      const payload = verifyToken(token);
      
      // 验证用户是否存在且处于活跃状态
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
        },
      });

      if (!user) {
        return reply.status(401).send({
          error: 'USER_NOT_FOUND',
          message: '用户不存在',
        });
      }

      if (user.status !== 'active') {
        return reply.status(401).send({
          error: 'ACCOUNT_DISABLED',
          message: '账户已被禁用',
        });
      }

      // 将用户信息附加到请求对象
      request.user = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };
    } catch (error) {
      return reply.status(401).send({
        error: 'INVALID_TOKEN',
        message: '无效的访问令牌',
      });
    }
  });

  // 角色权限装饰器
  fastify.decorate('requireRole', function (requiredRole: 'admin' | 'user') {
    return async function (request, reply) {
      if (request.user.role !== requiredRole) {
        return reply.status(403).send({
          error: 'INSUFFICIENT_PERMISSIONS',
          message: '权限不足',
        });
      }
    };
  });
};

export default fp(authPlugin); 