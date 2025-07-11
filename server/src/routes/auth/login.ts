import { FastifyPluginAsync } from 'fastify';
import { Type } from '@sinclair/typebox';
import { generateToken } from '../../utils/jwt.js';
import { prisma } from '../../utils/prisma.js';
import { verifyPassword } from '../../utils/password.js';
import { createActivity, ActivityTypes } from '../../utils/activity.js';
import { ErrorResponses, handleDatabaseError } from '../../utils/errors.js';
import { LoginDTOSchema, ErrorCodes, HttpStatusCode, type LoginDTO, type AuthResponse } from 'common';

const loginRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: LoginDTO }>('/login', {
    schema: {
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          rememberMe: { type: 'boolean' },
        },
        required: ['email', 'password'],
      },
      response: {
        200: Type.Object({
          user: Type.Object({
            id: Type.String(),
            name: Type.String(),
            email: Type.String(),
            role: Type.Union([Type.Literal('admin'), Type.Literal('user')]),
            avatar: Type.Optional(Type.String()),
            status: Type.Union([Type.Literal('active'), Type.Literal('inactive')]),
            createdAt: Type.String(),
            updatedAt: Type.String(),
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
    preHandler: async (request, reply) => {
      // 使用common包的schema验证
      try {
        LoginDTOSchema.parse(request.body);
      } catch (_error) {
        return ErrorResponses.validationError(reply, '请求参数错误');
      }
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
            isActive: true,
            createdAt: true,
          },
        });

        if (!user) {
          return reply.status(HttpStatusCode.UNAUTHORIZED).send({
            error: ErrorCodes.INVALID_CREDENTIALS,
            message: '邮箱或密码错误',
          });
        }

        // 检查账户状态
        if (!user.isActive) {
          return reply.status(HttpStatusCode.UNAUTHORIZED).send({
            error: ErrorCodes.UNAUTHORIZED,
            message: '账户已被禁用',
          });
        }

        // 验证密码
        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) {
          return reply.status(HttpStatusCode.UNAUTHORIZED).send({
            error: ErrorCodes.INVALID_CREDENTIALS,
            message: '邮箱或密码错误',
          });
        }

        // 生成JWT token
        const token = generateToken(
          { userId: user.id, email: user.email, role: user.role.toLowerCase() as 'user' | 'admin' },
          rememberMe ? '30d' : '24h'
        );

        // 记录登录活动
        await createActivity({
          action: ActivityTypes.LOGIN,
          userId: user.id,
          description: '用户登录系统',
        }, request);

        // 返回用户信息和token
        const { password: _, ...userWithoutPassword } = user;
        
        const response: AuthResponse = {
          user: {
            ...userWithoutPassword,
            name: user.name || '未知用户',
            role: user.role.toLowerCase() as 'user' | 'admin',
            status: user.isActive ? 'active' : 'inactive',
            avatar: user.avatar || undefined,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.createdAt.toISOString(), // 使用createdAt作为updatedAt
          },
          token,
        };
        
        return reply.send(response);
      } catch (error: any) {
        return handleDatabaseError(reply, request, error);
      }
    },
  });
};

export default loginRoute; 