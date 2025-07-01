import { FastifyPluginAsync } from 'fastify';
import { Type } from '@sinclair/typebox';
import { prisma } from '../../utils/prisma.js';

const statsRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get('/stats', {
    preHandler: [fastify.authenticate, fastify.requireRole('admin')],
    schema: {
      response: {
        200: Type.Object({
          users: Type.Object({
            total: Type.Integer(),
            active: Type.Integer(),
            admins: Type.Integer(),
            newThisMonth: Type.Integer(),
          }),
          activities: Type.Object({
            todayLogins: Type.Integer(),
            todayRegistrations: Type.Integer(),
            recentActivities: Type.Array(Type.Object({
              id: Type.String(),
              type: Type.String(),
              description: Type.String(),
              user: Type.Object({
                id: Type.String(),
                name: Type.String(),
              }),
              createdAt: Type.String(),
            })),
          }),
          system: Type.Object({
            uptime: Type.Number(),
            memoryUsage: Type.Object({
              used: Type.Number(),
              total: Type.Number(),
              percentage: Type.Number(),
            }),
          }),
        }),
      },
    },
    handler: async (request, reply) => {
      try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // 并行查询所有统计数据
        const [
          totalUsers,
          activeUsers,
          adminUsers,
          newUsersThisMonth,
          todayLogins,
          todayRegistrations,
          recentActivities,
        ] = await Promise.all([
          prisma.user.count(),
          prisma.user.count({ where: { isActive: true } }),
          prisma.user.count({ where: { role: 'ADMIN' } }),
          prisma.user.count({
            where: {
              createdAt: {
                gte: monthStart,
              },
            },
          }),
          prisma.activity.count({
            where: {
              action: 'login',
              createdAt: {
                gte: todayStart,
              },
            },
          }),
          prisma.activity.count({
            where: {
              action: 'register',
              createdAt: {
                gte: todayStart,
              },
            },
          }),
          prisma.activity.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          }),
        ]);

        // 获取系统信息
        const memoryUsage = process.memoryUsage();
        const totalMemory = memoryUsage.heapTotal;
        const usedMemory = memoryUsage.heapUsed;

        return reply.send({
          users: {
            total: totalUsers,
            active: activeUsers,
            admins: adminUsers,
            newThisMonth: newUsersThisMonth,
          },
          activities: {
            todayLogins,
            todayRegistrations,
            recentActivities: recentActivities.map(activity => ({
              id: activity.id,
              type: activity.action,
              description: activity.description,
              user: activity.user,
              createdAt: activity.createdAt.toISOString(),
            })),
          },
          system: {
            uptime: process.uptime(),
            memoryUsage: {
              used: usedMemory,
              total: totalMemory,
              percentage: Math.round((usedMemory / totalMemory) * 100),
            },
          },
        });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: 'INTERNAL_ERROR',
          message: '获取统计数据失败',
        });
      }
    },
  });

  // 获取图表数据
  fastify.get('/charts/:type', {
    preHandler: [fastify.authenticate, fastify.requireRole('admin')],
    schema: {
      params: Type.Object({
        type: Type.Union([
          Type.Literal('users'),
          Type.Literal('activities'),
          Type.Literal('logins'),
        ]),
      }),
      querystring: Type.Object({
        period: Type.Optional(Type.Union([
          Type.Literal('7d'),
          Type.Literal('30d'),
          Type.Literal('90d'),
        ])),
      }),
      response: {
        200: Type.Object({
          labels: Type.Array(Type.String()),
          datasets: Type.Array(Type.Object({
            label: Type.String(),
            data: Type.Array(Type.Number()),
            borderColor: Type.Optional(Type.String()),
            backgroundColor: Type.Optional(Type.String()),
          })),
        }),
      },
    },
    handler: async (request, reply) => {
      const { type } = request.params as { type: string };
      const { period = '7d' } = request.query as { period: string };

      try {
        const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
        const now = new Date();
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        // 生成日期标签
        const labels: string[] = [];
        for (let i = 0; i < days; i++) {
          const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
          labels.push(date.toISOString().split('T')[0]);
        }

        let datasets: any[] = [];

        if (type === 'users') {
          // 用户注册趋势
          const registrationData = await Promise.all(
            labels.map(async (label) => {
              const startOfDay = new Date(label);
              const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
              
              return prisma.user.count({
                where: {
                  createdAt: {
                    gte: startOfDay,
                    lt: endOfDay,
                  },
                },
              });
            })
          );

          datasets = [
            {
              label: '新用户注册',
              data: registrationData,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
            },
          ];
        } else if (type === 'activities') {
          // 活动趋势
          const activityData = await Promise.all(
            labels.map(async (label) => {
              const startOfDay = new Date(label);
              const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
              
              return prisma.activity.count({
                where: {
                  createdAt: {
                    gte: startOfDay,
                    lt: endOfDay,
                  },
                },
              });
            })
          );

          datasets = [
            {
              label: '用户活动',
              data: activityData,
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
            },
          ];
        } else if (type === 'logins') {
          // 登录趋势
          const loginData = await Promise.all(
            labels.map(async (label) => {
              const startOfDay = new Date(label);
              const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
              
              return prisma.activity.count({
                where: {
                  action: 'login',
                  createdAt: {
                    gte: startOfDay,
                    lt: endOfDay,
                  },
                },
              });
            })
          );

          datasets = [
            {
              label: '用户登录',
              data: loginData,
              borderColor: 'rgb(54, 162, 235)',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
            },
          ];
        }

        return reply.send({
          labels,
          datasets,
        });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: 'INTERNAL_ERROR',
          message: '获取图表数据失败',
        });
      }
    },
  });
};

export default statsRoute; 