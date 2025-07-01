import { MongoClient } from 'mongodb';
import type { FastifyBaseLogger } from 'fastify';

const MONGODB_URI = process.env.DATABASE_URL || 'mongodb://localhost:27017/fullstack-app';

let client: MongoClient;

export async function connectToDatabase(logger?: FastifyBaseLogger) {
  try {
    if (!client) {
      client = new MongoClient(MONGODB_URI, {
        // 连接池配置
        maxPoolSize: 10,
        minPoolSize: 2,
        // 重试配置
        retryWrites: true,
        retryReads: true,
        // 超时配置
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        // 其他配置
        directConnection: false,
      });
    }

    await client.connect();
    logger?.info('✅ Connected to MongoDB') || console.log('✅ Connected to MongoDB');
    
    // 测试连接
    await client.db().admin().ping();
    logger?.info('✅ MongoDB ping successful') || console.log('✅ MongoDB ping successful');
    
    return client;
  } catch (error) {
    logger?.error('❌ Failed to connect to MongoDB:', error) || console.error('❌ Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function disconnectFromDatabase(logger?: FastifyBaseLogger) {
  if (client) {
    await client.close();
    logger?.info('✅ Disconnected from MongoDB') || console.log('✅ Disconnected from MongoDB');
  }
}

// 获取数据库实例
export function getDatabase() {
  if (!client) {
    throw new Error('Database not connected. Call connectToDatabase() first.');
  }
  return client.db();
}

// 创建索引（用于优化查询性能）
export async function createIndexes(logger?: FastifyBaseLogger) {
  try {
    const db = getDatabase();
    
    // 用户集合索引
    await db.collection('users').createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { role: 1 } },
      { key: { status: 1 } },
      { key: { createdAt: -1 } },
    ]);

    // 活动集合索引
    await db.collection('activities').createIndexes([
      { key: { userId: 1 } },
      { key: { type: 1 } },
      { key: { createdAt: -1 } },
      { key: { userId: 1, createdAt: -1 } },
    ]);

    logger?.info('✅ Database indexes created successfully') || console.log('✅ Database indexes created successfully');
  } catch (error) {
    logger?.error('❌ Failed to create database indexes:', error) || console.error('❌ Failed to create database indexes:', error);
  }
}

// 检查副本集状态（MongoDB事务需要副本集）
export async function checkReplicaSetStatus(logger?: FastifyBaseLogger) {
  try {
    const db = getDatabase();
    const status = await db.admin().command({ replSetGetStatus: 1 });
    logger?.info('✅ Replica set status: ' + status.set) || console.log('✅ Replica set status:', status.set);
    return true;
  } catch (_error) {
    logger?.warn('⚠️  Replica set not configured. Transactions will not be available.') || console.warn('⚠️  Replica set not configured. Transactions will not be available.');
    logger?.warn('   To enable transactions, configure MongoDB as a replica set.') || console.warn('   To enable transactions, configure MongoDB as a replica set.');
    return false;
  }
} 