import { FastifyPluginAsync } from 'fastify';
import { Type } from '@sinclair/typebox';
import { prisma } from '../../utils/prisma.js';

const meRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get('/me', {
    preHandler: [fastify.authenticate],
    schema: {
      response: {
        200: Type.Object({
          id: Type.String(),
          name: Type.String(),
          email: Type.String(),
          role: Type.Union([Type.Literal('admin'), Type.Literal('user')]),
          avatar: Type.Optional(Type.String()),
          status: Type.Union([Type.Literal('active'), Type.Literal('inactive')]),
          createdAt: Type.String(),
          updatedAt: Type.String(),
        }),
        401: Type.Object({
          error: Type.String(),
          message: Type.String(),
        }),
      },
    },
    handler: async (request, reply) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: request.user.userId },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true,
            status: true,
            createdAt: true,
            updatedAt: true,
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

        return reply.send({
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: 'INTERNAL_ERROR',
          message: '服务器内部错误',
        });
      }
    },
  });
};

export default meRoute; 