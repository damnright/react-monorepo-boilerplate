import type { FastifyBaseLogger } from 'fastify';
import { prisma } from './prisma.js';

/**
 * 测试数据库连接
 */
export async function testDatabaseConnection(logger?: FastifyBaseLogger) {
  try {
    // 使用Prisma进行连接测试
    await prisma.$connect();
    logger?.info('✅ Connected to MongoDB via Prisma');
    
    // 执行一个简单的查询来验证连接
    await prisma.$runCommandRaw({ ping: 1 });
    logger?.info('✅ MongoDB ping successful');
    
    return true;
  } catch (error) {
    logger?.error('❌ Failed to connect to MongoDB:', error);
    throw error;
  }
}

/**
 * 创建数据库索引（用于优化查询性能）
 * 注意：Prisma会自动处理schema中定义的索引，这里主要用于额外的优化索引
 */
export async function createIndexes(logger?: FastifyBaseLogger) {
  try {
    // 使用Prisma的原生查询功能创建索引
    // 注意：Prisma schema中已定义的索引会自动创建，这里只添加额外的复合索引
    
    // 用户活动的复合索引
    await prisma.$runCommandRaw({
      createIndexes: 'activities',
      indexes: [
        {
          key: { userId: 1, createdAt: -1 },
          name: 'userId_createdAt_desc',
        },
        {
          key: { action: 1, createdAt: -1 },
          name: 'action_createdAt_desc',
        },
      ],
    });

    logger?.info('✅ Database indexes created successfully');
  } catch (error) {
    // 索引可能已存在，这是正常的
    logger?.warn('⚠️  Index creation skipped (may already exist):', error);
  }
}

/**
 * 检查副本集状态（MongoDB事务需要副本集）
 */
export async function checkReplicaSetStatus(logger?: FastifyBaseLogger) {
  try {
    const status = await prisma.$runCommandRaw({ replSetGetStatus: 1 });
    logger?.info('✅ Replica set status: ' + (status as any).set);
    return true;
  } catch (_error) {
    logger?.warn('⚠️  Replica set not configured. Transactions will not be available.') || console.warn('⚠️  Replica set not configured. Transactions will not be available.');
    logger?.warn('   To enable transactions, configure MongoDB as a replica set.') || console.warn('   To enable transactions, configure MongoDB as a replica set.');
    return false;
  }
}

/**
 * 数据库健康检查
 */
export async function healthCheck() {
  try {
    await prisma.$runCommandRaw({ ping: 1 });
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    return { status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown error' };
  }
} 