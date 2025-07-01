import type { FastifyRequest } from 'fastify';
import { prisma } from './prisma.js';

/**
 * 活动类型枚举
 */
export const ActivityTypes = {
  REGISTER: 'register',
  LOGIN: 'login',
  LOGOUT: 'logout',
  UPDATE_PROFILE: 'update_profile',
  UPDATE_USER: 'update_user',
  CREATE_USER: 'create_user',
  DELETE_USER: 'delete_user',
  CHANGE_PASSWORD: 'change_password',
  PASSWORD_RESET: 'password_reset',
} as const;

export type ActivityType = typeof ActivityTypes[keyof typeof ActivityTypes];

/**
 * 活动记录数据接口
 */
export interface ActivityData {
  action: ActivityType;
  userId: string;
  description: string;
  metadata?: Record<string, any>;
  targetUserId?: string;
}

/**
 * 从请求中提取通用信息
 */
function extractRequestInfo(request: FastifyRequest) {
  return {
    ip: request.ip,
    userAgent: request.headers['user-agent'] || 'Unknown',
  };
}

/**
 * 创建活动记录（在事务中使用）
 */
export async function createActivityInTransaction(
  tx: any, // Prisma transaction client
  data: ActivityData,
  request: FastifyRequest
) {
  const requestInfo = extractRequestInfo(request);
  
  return tx.activity.create({
    data: {
      action: data.action,
      userId: data.userId,
      description: data.description,
      metadata: {
        ...data.metadata,
        ...requestInfo,
        ...(data.targetUserId && { targetUserId: data.targetUserId }),
      },
      ipAddress: requestInfo.ip,
      userAgent: requestInfo.userAgent,
    },
  });
}

/**
 * 创建活动记录（独立使用）
 */
export async function createActivity(
  data: ActivityData,
  request: FastifyRequest
) {
  const requestInfo = extractRequestInfo(request);
  
  return prisma.activity.create({
    data: {
      action: data.action,
      userId: data.userId,
      description: data.description,
      metadata: {
        ...data.metadata,
        ...requestInfo,
        ...(data.targetUserId && { targetUserId: data.targetUserId }),
      },
      ipAddress: requestInfo.ip,
      userAgent: requestInfo.userAgent,
    },
  });
} 