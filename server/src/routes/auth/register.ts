import { FastifyPluginAsync } from 'fastify';
import { Type } from '@sinclair/typebox';
import { generateToken } from '../../utils/jwt.js';
import { prisma } from '../../utils/prisma.js';
import { hashPassword } from '../../utils/password.js';
import { createActivityInTransaction, ActivityTypes } from '../../utils/activity.js';
import { ErrorResponses, handleDatabaseError } from '../../utils/errors.js';
import { RegisterDTOSchema, HttpStatusCode, type RegisterDTO, type AuthResponse } from 'common';

const registerRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: RegisterDTO }>('/register', {
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 50 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
        },
        required: ['name', 'email', 'password'],
      },
      response: {
        201: Type.Object({
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
        409: Type.Object({
          error: Type.String(),
          message: Type.String(),
        }),
      },
    },
    preHandler: async (request, reply) => {
      // 使用common包的schema验证
      try {
        RegisterDTOSchema.parse(request.body);
      } catch (_error) {
        return ErrorResponses.validationError(reply, '请求参数错误');
      }
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
          const hashedPassword = await hashPassword(password);

          // 创建用户
          const user = await tx.user.create({
            data: {
              name,
              email,
              password: hashedPassword,
              role: 'USER', // 默认角色
              isActive: true,
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
          await createActivityInTransaction(tx, {
            action: ActivityTypes.REGISTER,
            userId: user.id,
            description: '新用户注册',
          }, request);

          return user;
        });

        // 生成JWT token
        const token = generateToken({
          userId: result.id,
          email: result.email,
          role: result.role.toLowerCase() as 'user' | 'admin',
        });

        const response: AuthResponse = {
          user: {
            ...result,
            name: result.name || '未知用户',
            role: result.role.toLowerCase() as 'user' | 'admin',
            status: 'active',
            avatar: result.avatar || undefined,
            createdAt: result.createdAt.toISOString(),
            updatedAt: result.createdAt.toISOString(),
          },
          token,
        };

        return reply.status(HttpStatusCode.CREATED).send(response);
      } catch (error: any) {
        return handleDatabaseError(reply, request, error);
      }
    },
  });
};

export default registerRoute; 