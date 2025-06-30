import { FastifyPluginAsync } from 'fastify';
import { Static, Type } from '@sinclair/typebox';
import bcrypt from 'bcrypt';
import { generateToken } from '../../utils/jwt.js';
import { prisma } from '../../utils/prisma.js';

const LoginSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 6 }),
  rememberMe: Type.Optional(Type.Boolean()),
});

type LoginBody = Static<typeof LoginSchema>;

const loginRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: LoginBody }>('/login', {
    schema: {
      body: LoginSchema,
      response: {
        200: Type.Object({
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
        401: Type.Object({
          error: Type.String(),
          message: Type.String(),
        }),
      },
    },
    handler: async (request, reply) => {
      const { email, password, rememberMe = false } = request.body;

      try {
        // 查找用户
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            role: true,
            avatar: true,
            status: true,
            createdAt: true,
          },
        });

        if (!user) {
          return reply.status(401).send({
            error: 'INVALID_CREDENTIALS',
            message: '邮箱或密码错误',
          });
        }

        // 检查账户状态
        if (user.status !== 'active') {
          return reply.status(401).send({
            error: 'ACCOUNT_DISABLED',
            message: '账户已被禁用',
          });
        }

        // 验证密码
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return reply.status(401).send({
            error: 'INVALID_CREDENTIALS',
            message: '邮箱或密码错误',
          });
        }

        // 生成JWT token
        const token = generateToken(
          { userId: user.id, email: user.email, role: user.role },
          rememberMe ? '30d' : '24h'
        );

        // 记录登录活动
        await prisma.activity.create({
          data: {
            type: 'login',
            userId: user.id,
            description: '用户登录系统',
            metadata: {
              ip: request.ip,
              userAgent: request.headers['user-agent'],
            },
          },
        });

        // 返回用户信息和token
        const { password: _, ...userWithoutPassword } = user;
        
        return reply.send({
          user: {
            ...userWithoutPassword,
            createdAt: user.createdAt.toISOString(),
          },
          token,
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

export default loginRoute; 