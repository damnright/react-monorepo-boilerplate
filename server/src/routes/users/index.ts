import { FastifyPluginAsync } from 'fastify';
import { Static, Type } from '@sinclair/typebox';
import bcrypt from 'bcrypt';
import { prisma } from '../../utils/prisma.js';

const CreateUserSchema = Type.Object({
  name: Type.String({ minLength: 2, maxLength: 50 }),
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 6 }),
  role: Type.Union([Type.Literal('admin'), Type.Literal('user')]),
  status: Type.Union([Type.Literal('active'), Type.Literal('inactive')]),
});

const UpdateUserSchema = Type.Object({
  name: Type.Optional(Type.String({ minLength: 2, maxLength: 50 })),
  role: Type.Optional(Type.Union([Type.Literal('admin'), Type.Literal('user')])),
  status: Type.Optional(Type.Union([Type.Literal('active'), Type.Literal('inactive')])),
  avatar: Type.Optional(Type.String()),
});

const UserResponse = Type.Object({
  id: Type.String(),
  name: Type.String(),
  email: Type.String(),
  role: Type.Union([Type.Literal('admin'), Type.Literal('user')]),
  status: Type.Union([Type.Literal('active'), Type.Literal('inactive')]),
  avatar: Type.Optional(Type.String()),
  createdAt: Type.String(),
  updatedAt: Type.String(),
});

type CreateUserBody = Static<typeof CreateUserSchema>;
type UpdateUserBody = Static<typeof UpdateUserSchema>;

const usersRoute: FastifyPluginAsync = async (fastify) => {
  // 获取用户列表
  fastify.get('/', {
    preHandler: [fastify.authenticate, fastify.requireRole('admin')],
    schema: {
      querystring: Type.Object({
        page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
        limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 10 })),
        role: Type.Optional(Type.Union([Type.Literal('admin'), Type.Literal('user')])),
        status: Type.Optional(Type.Union([Type.Literal('active'), Type.Literal('inactive')])),
        search: Type.Optional(Type.String()),
      }),
      response: {
        200: Type.Object({
          users: Type.Array(UserResponse),
          pagination: Type.Object({
            page: Type.Integer(),
            limit: Type.Integer(),
            total: Type.Integer(),
            totalPages: Type.Integer(),
          }),
        }),
      },
    },
    handler: async (request, reply) => {
      const { page = 1, limit = 10, role, status, search } = request.query as any;
      const skip = (page - 1) * limit;

      try {
        const where: any = {};
        
        if (role) {
          where.role = role;
        }
        
        if (status) {
          where.status = status;
        }
        
        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ];
        }

        const [users, total] = await Promise.all([
          prisma.user.findMany({
            where,
            skip,
            take: limit,
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isActive: true,
              avatar: true,
              createdAt: true,
              updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
          }),
          prisma.user.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return reply.send({
          users: users.map(user => ({
            ...user,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
          })),
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
        });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: 'INTERNAL_ERROR',
          message: '获取用户列表失败',
        });
      }
    },
  });

  // 获取单个用户
  fastify.get<{ Params: { id: string } }>('/:id', {
    preHandler: [fastify.authenticate],
    schema: {
      params: Type.Object({
        id: Type.String(),
      }),
      response: {
        200: UserResponse,
        404: Type.Object({
          error: Type.String(),
          message: Type.String(),
        }),
      },
    },
    handler: async (request, reply) => {
      const { id } = request.params;

      try {
        // 检查权限：管理员可以查看所有用户，普通用户只能查看自己
        if (request.user.role !== 'admin' && request.user.userId !== id) {
          return reply.status(403).send({
            error: 'FORBIDDEN',
            message: '没有权限访问该用户信息',
          });
        }

        const user = await prisma.user.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            avatar: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        if (!user) {
          return reply.status(404).send({
            error: 'USER_NOT_FOUND',
            message: '用户不存在',
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
          message: '获取用户信息失败',
        });
      }
    },
  });

  // 创建用户
  fastify.post<{ Body: CreateUserBody }>('/', {
    preHandler: [fastify.authenticate, fastify.requireRole('admin')],
    schema: {
      body: CreateUserSchema,
      response: {
        201: UserResponse,
        409: Type.Object({
          error: Type.String(),
          message: Type.String(),
        }),
      },
    },
    handler: async (request, reply) => {
      const { name, email, password, role, status } = request.body;

      try {
        const result = await prisma.$transaction(async (tx) => {
          // 检查邮箱是否已存在
          const existingUser = await tx.user.findUnique({
            where: { email },
          });

          if (existingUser) {
            throw new Error('EMAIL_EXISTS');
          }

          // 加密密码
          const hashedPassword = await bcrypt.hash(password, 12);

          // 创建用户
          const user = await tx.user.create({
                          data: {
                name,
                email,
                password: hashedPassword,
                role: role === 'user' ? 'USER' : role === 'admin' ? 'ADMIN' : 'USER',
                isActive: status === 'active',
              },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isActive: true,
              avatar: true,
              createdAt: true,
              updatedAt: true,
            },
          });

          // 记录活动
          await tx.activity.create({
            data: {
              action: 'create_user',
              userId: request.user.userId,
              description: `管理员创建用户: ${user.name}`,
              metadata: {
                targetUserId: user.id,
                ip: request.ip,
                userAgent: request.headers['user-agent'],
              },
              ipAddress: request.ip,
              userAgent: request.headers['user-agent'],
            },
          });

          return user;
        });

        return reply.status(201).send({
          ...result,
          createdAt: result.createdAt.toISOString(),
          updatedAt: result.updatedAt.toISOString(),
        });
      } catch (error: any) {
        request.log.error(error);

        if (error.message === 'EMAIL_EXISTS') {
          return reply.status(409).send({
            error: 'EMAIL_EXISTS',
            message: '该邮箱已被注册',
          });
        }

        return reply.status(500).send({
          error: 'INTERNAL_ERROR',
          message: '创建用户失败',
        });
      }
    },
  });

  // 更新用户
  fastify.put<{ Params: { id: string }; Body: UpdateUserBody }>('/:id', {
    preHandler: [fastify.authenticate],
    schema: {
      params: Type.Object({
        id: Type.String(),
      }),
      body: UpdateUserSchema,
      response: {
        200: UserResponse,
        404: Type.Object({
          error: Type.String(),
          message: Type.String(),
        }),
      },
    },
    handler: async (request, reply) => {
      const { id } = request.params;
      const updateData = request.body;

      try {
        // 检查权限：管理员可以更新所有用户，普通用户只能更新自己（且不能改角色）
        if (request.user.role !== 'admin') {
          if (request.user.userId !== id) {
            return reply.status(403).send({
              error: 'FORBIDDEN',
              message: '没有权限修改该用户信息',
            });
          }
          
          // 普通用户不能修改角色和状态
          delete updateData.role;
          delete updateData.status;
        }

        // 转换数据格式以匹配Prisma schema
        const transformedData: any = { ...updateData };
        
        // 转换role字段
        if (updateData.role) {
          transformedData.role = updateData.role === 'user' ? 'USER' : updateData.role === 'admin' ? 'ADMIN' : 'USER';
        }
        
        // 转换status字段为isActive
        if (updateData.status) {
          transformedData.isActive = updateData.status === 'active';
          delete transformedData.status;
        }

        const user = await prisma.user.update({
          where: { id },
          data: transformedData,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            avatar: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        // 记录活动
        await prisma.activity.create({
          data: {
            action: 'update_user',
            userId: request.user.userId,
            description: `用户信息更新: ${user.name}`,
            metadata: {
              targetUserId: user.id,
              changes: updateData,
              ip: request.ip,
              userAgent: request.headers['user-agent'],
            },
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'],
          },
        });

        return reply.send({
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        });
      } catch (error: any) {
        request.log.error(error);

        if (error.code === 'P2025') {
          return reply.status(404).send({
            error: 'USER_NOT_FOUND',
            message: '用户不存在',
          });
        }

        return reply.status(500).send({
          error: 'INTERNAL_ERROR',
          message: '更新用户失败',
        });
      }
    },
  });

  // 删除用户
  fastify.delete<{ Params: { id: string } }>('/:id', {
    preHandler: [fastify.authenticate, fastify.requireRole('admin')],
    schema: {
      params: Type.Object({
        id: Type.String(),
      }),
      response: {
        200: Type.Object({
          message: Type.String(),
        }),
        404: Type.Object({
          error: Type.String(),
          message: Type.String(),
        }),
      },
    },
    handler: async (request, reply) => {
      const { id } = request.params;

      try {
        // 不允许删除自己
        if (request.user.userId === id) {
          return reply.status(400).send({
            error: 'SELF_DELETE_FORBIDDEN',
            message: '不能删除自己的账户',
          });
        }

        await prisma.$transaction(async (tx) => {
          // 获取用户信息用于记录
          const user = await tx.user.findUnique({
            where: { id },
            select: { name: true, email: true },
          });

          if (!user) {
            throw new Error('USER_NOT_FOUND');
          }

          // 删除用户
          await tx.user.delete({
            where: { id },
          });

          // 记录活动
          await tx.activity.create({
            data: {
              action: 'delete_user',
              userId: request.user.userId,
              description: `管理员删除用户: ${user.name} (${user.email})`,
              metadata: {
                targetUserId: id,
                ip: request.ip,
                userAgent: request.headers['user-agent'],
              },
              ipAddress: request.ip,
              userAgent: request.headers['user-agent'],
            },
          });
        });

        return reply.send({
          message: '用户删除成功',
        });
      } catch (error: any) {
        request.log.error(error);

        if (error.message === 'USER_NOT_FOUND' || error.code === 'P2025') {
          return reply.status(404).send({
            error: 'USER_NOT_FOUND',
            message: '用户不存在',
          });
        }

        return reply.status(500).send({
          error: 'INTERNAL_ERROR',
          message: '删除用户失败',
        });
      }
    },
  });
};

export default usersRoute; 