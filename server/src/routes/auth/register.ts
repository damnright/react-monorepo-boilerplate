import { FastifyPluginAsync } from 'fastify';
import { Static, Type } from '@sinclair/typebox';
import bcrypt from 'bcrypt';
import { generateToken } from '../../utils/jwt.js';
import { prisma } from '../../utils/prisma.js';

const RegisterSchema = Type.Object({
  name: Type.String({ minLength: 2, maxLength: 50 }),
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 6 }),
});

type RegisterBody = Static<typeof RegisterSchema>;

const registerRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: RegisterBody }>('/register', {
    schema: {
      body: RegisterSchema,
      response: {
        201: Type.Object({
          user: Type.Object({
            id: Type.String(),
            name: Type.String(),
            email: Type.String(),
            role: Type.Union([Type.Literal('admin'), Type.Literal('user')]),
            avatar: Type.Optional(Type.String()),
            createdAt: Type.String(),
          }),
          token: Type.String(),
        }),
        400: Type.Object({
          error: Type.String(),
          message: Type.String(),
        }),
        409: Type.Object({
          error: Type.String(),
          message: Type.String(),
        }),
      },
    },
    handler: async (request, reply) => {
      const { name, email, password } = request.body;

      try {
        // 使用事务确保数据一致性
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
              role: 'user', // 默认角色
              status: 'active',
            },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              avatar: true,
              createdAt: true,
            },
          });

          // 记录注册活动
          await tx.activity.create({
            data: {
              type: 'register',
              userId: user.id,
              description: '新用户注册',
              metadata: {
                ip: request.ip,
                userAgent: request.headers['user-agent'],
              },
            },
          });

          return user;
        });

        // 生成JWT token
        const token = generateToken({
          userId: result.id,
          email: result.email,
          role: result.role,
        });

        return reply.status(201).send({
          user: {
            ...result,
            createdAt: result.createdAt.toISOString(),
          },
          token,
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
          message: '服务器内部错误',
        });
      }
    },
  });
};

export default registerRoute; 