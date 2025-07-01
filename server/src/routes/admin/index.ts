import { FastifyPluginAsync } from 'fastify';
import statsRoute from './stats.js';

const adminRoutes: FastifyPluginAsync = async (fastify) => {
  // 注册统计数据路由
  await fastify.register(statsRoute);

  // 获取活动日志
  fastify.get('/activities', {
    preHandler: [fastify.authenticate, fastify.requireRole('admin')],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          type: { type: 'string' },
          userId: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            activities: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  type: { type: 'string' },
                  description: { type: 'string' },
                  metadata: { type: 'object' },
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      email: { type: 'string' },
                    },
                  },
                  createdAt: { type: 'string' },
                },
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total: { type: 'integer' },
                totalPages: { type: 'integer' },
              },
            },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { page = 1, limit = 20, type, userId } = request.query as any;
      const skip = (page - 1) * limit;

      try {
        const where: any = {};
        
        if (type) {
          where.type = type;
        }
        
        if (userId) {
          where.userId = userId;
        }

        const [activities, total] = await Promise.all([
          fastify.prisma.activity.findMany({
            where,
            skip,
            take: limit,
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          }),
          fastify.prisma.activity.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return reply.send({
          activities: activities.map(activity => ({
            ...activity,
            createdAt: activity.createdAt.toISOString(),
          })),
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
        });
      } catch (_error: any) {
        request.log.error(_error);
        return reply.status(500).send({
          error: 'INTERNAL_ERROR',
          message: '获取活动日志失败',
        });
      }
    },
  });

  // 获取系统信息
  fastify.get('/system', {
    preHandler: [fastify.authenticate, fastify.requireRole('admin')],
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            server: {
              type: 'object',
              properties: {
                nodeVersion: { type: 'string' },
                platform: { type: 'string' },
                arch: { type: 'string' },
                uptime: { type: 'number' },
                environment: { type: 'string' },
              },
            },
            memory: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                used: { type: 'number' },
                free: { type: 'number' },
                percentage: { type: 'number' },
              },
            },
            database: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                version: { type: 'string' },
              },
            },
          },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const memoryUsage = process.memoryUsage();
        
        // 测试数据库连接
        let dbStatus = 'connected';
        const dbVersion = 'unknown';
        
        try {
          // MongoDB doesn't have a version() function like SQL databases
          // We'll use a simple ping operation instead
          await fastify.prisma.$runCommandRaw({ ping: 1 });
          dbStatus = 'connected';
        } catch (error) {
          dbStatus = 'disconnected';
        }

        return reply.send({
          server: {
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
          },
          memory: {
            total: memoryUsage.heapTotal,
            used: memoryUsage.heapUsed,
            free: memoryUsage.heapTotal - memoryUsage.heapUsed,
            percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
          },
          database: {
            status: dbStatus,
            version: dbVersion,
          },
        });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: 'INTERNAL_ERROR',
          message: '获取系统信息失败',
        });
      }
    },
  });
};

export default adminRoutes; 