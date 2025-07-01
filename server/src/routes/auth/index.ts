import { FastifyPluginAsync } from 'fastify';
import loginRoute from './login.js';
import registerRoute from './register.js';
import meRoute from './me.js';

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // 注册所有认证相关的路由
  await fastify.register(loginRoute);
  await fastify.register(registerRoute);
  await fastify.register(meRoute);

  // 登出路由
  fastify.post('/logout', {
    preHandler: [fastify.authenticate],
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    },
    handler: async (request, reply) => {
      try {
        // 记录登出活动
        await fastify.prisma.activity.create({
          data: {
            action: 'logout',
            userId: request.user.userId,
            description: '用户登出系统',
            metadata: {
              ip: request.ip,
              userAgent: request.headers['user-agent'],
            },
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'],
          },
        });

        return reply.send({ message: '登出成功' });
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

export default authRoutes; 