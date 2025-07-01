import type { FastifyReply, FastifyRequest } from 'fastify';
import { ErrorCodes, HttpStatusCode } from 'common';

/**
 * 标准错误响应接口
 */
export interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
}

/**
 * 发送标准错误响应
 */
export function sendErrorResponse(
  reply: FastifyReply,
  statusCode: number,
  errorCode: string,
  message: string,
  details?: any
): void {
  const response: ErrorResponse = {
    error: errorCode,
    message,
    ...(details && { details }),
  };

  reply.status(statusCode).send(response);
}

/**
 * 常用错误响应方法
 */
export const ErrorResponses = {
  badRequest: (reply: FastifyReply, message = '请求参数错误') =>
    sendErrorResponse(reply, HttpStatusCode.BAD_REQUEST, ErrorCodes.INVALID_CREDENTIALS, message),

  unauthorized: (reply: FastifyReply, message = '未授权访问') =>
    sendErrorResponse(reply, HttpStatusCode.UNAUTHORIZED, ErrorCodes.UNAUTHORIZED, message),

  forbidden: (reply: FastifyReply, message = '访问被禁止') =>
    sendErrorResponse(reply, HttpStatusCode.FORBIDDEN, ErrorCodes.UNAUTHORIZED, message),

  notFound: (reply: FastifyReply, message = '资源不存在') =>
    sendErrorResponse(reply, HttpStatusCode.NOT_FOUND, ErrorCodes.NOT_FOUND, message),

  conflict: (reply: FastifyReply, message = '资源冲突') =>
    sendErrorResponse(reply, HttpStatusCode.CONFLICT, ErrorCodes.INVALID_CREDENTIALS, message),

  internalError: (reply: FastifyReply, request: FastifyRequest, error: Error, message = '服务器内部错误') => {
    request.log.error(error);
    sendErrorResponse(reply, HttpStatusCode.INTERNAL_SERVER_ERROR, ErrorCodes.INTERNAL_ERROR, message);
  },

  validationError: (reply: FastifyReply, message = '数据验证失败', details?: any) =>
    sendErrorResponse(reply, HttpStatusCode.BAD_REQUEST, ErrorCodes.INVALID_CREDENTIALS, message, details),
};

/**
 * 数据库错误处理器
 */
export function handleDatabaseError(reply: FastifyReply, request: FastifyRequest, error: any): void {
  request.log.error(error);

  // Prisma 错误码处理
  if (error.code) {
    switch (error.code) {
      case 'P2002': // Unique constraint failed
        return ErrorResponses.conflict(reply, '数据已存在');
      case 'P2025': // Record not found
        return ErrorResponses.notFound(reply, '记录不存在');
      case 'P2003': // Foreign key constraint failed
        return ErrorResponses.badRequest(reply, '关联数据不存在');
      default:
        return ErrorResponses.internalError(reply, request, error, '数据库操作失败');
    }
  }

  // 业务逻辑错误
  if (error.message === 'EMAIL_EXISTS') {
    return ErrorResponses.conflict(reply, '该邮箱已被注册');
  }

  if (error.message === 'USER_NOT_FOUND') {
    return ErrorResponses.notFound(reply, '用户不存在');
  }

  // 默认内部错误
  return ErrorResponses.internalError(reply, request, error);
} 