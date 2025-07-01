import Fastify from 'fastify';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 设置端口和主机
const PORT = parseInt(process.env.PORT || '5055', 10);
const HOST = process.env.HOST || '0.0.0.0';

// 创建 Fastify 实例
const fastify = Fastify({
  logger: process.env.NODE_ENV === 'production' 
    ? { level: 'info' }
    : {
        level: 'debug',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true
          }
        }
      },
  trustProxy: true,
});

// 错误处理
fastify.setErrorHandler((error, request, reply) => {
  request.log.error(error);
  
  // 在生产环境中不暴露详细错误信息
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  reply.status(500).send({
    error: 'INTERNAL_SERVER_ERROR',
    message: isDevelopment ? error.message : '服务器内部错误',
    ...(isDevelopment && { stack: error.stack }),
  });
});

// 404 处理
fastify.setNotFoundHandler((request, reply) => {
  reply.status(404).send({
    error: 'NOT_FOUND',
    message: '请求的资源不存在',
    path: request.url,
  });
});

async function start() {
  try {
    // 注册插件
    await fastify.register(import('@fastify/helmet'), {
      global: true,
    });

    await fastify.register(import('@fastify/cors'), {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.ALLOWED_ORIGINS?.split(',') || false
        : true,
      credentials: true,
    });

    await fastify.register(import('@fastify/rate-limit'), {
      max: 100,
      timeWindow: '1 minute',
    });

    await fastify.register(import('@fastify/multipart'), {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    });

    // 注册 Swagger 文档（仅在开发环境）
    if (process.env.NODE_ENV !== 'production') {
      await fastify.register(import('@fastify/swagger'), {
        swagger: {
          info: {
            title: '全栈脚手架 API',
            description: '基于 Fastify + MongoDB 的 REST API',
            version: '1.0.0',
          },
          host: `localhost:${PORT}`,
          schemes: ['http'],
          consumes: ['application/json'],
          produces: ['application/json'],
          tags: [
            { name: 'auth', description: '认证相关接口' },
            { name: 'users', description: '用户管理接口' },
            { name: 'admin', description: '管理员接口' },
          ],
        },
      });

      await fastify.register(import('@fastify/swagger-ui'), {
        routePrefix: '/docs',
        uiConfig: {
          docExpansion: 'list',
          deepLinking: false,
        },
      });
    }

    // 注册自定义插件
    await fastify.register(import('./plugins/prisma.js'));
    await fastify.register(import('./plugins/auth.js'));

    // 健康检查
    fastify.get('/health', async () => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
      };
    });

    // 注册路由
    await fastify.register(import('./routes/auth/index.js'), { prefix: '/api/auth' });
    await fastify.register(import('./routes/users/index.js'), { prefix: '/api/users' });
    await fastify.register(import('./routes/admin/index.js'), { prefix: '/api/admin' });

    // 静态文件服务（生产环境）
    if (process.env.NODE_ENV === 'production') {
      await fastify.register(import('@fastify/static'), {
        root: join(__dirname, '../../client/dist'),
        prefix: '/',
      });

      // SPA 回退
      fastify.setNotFoundHandler((request, reply) => {
        if (request.url.startsWith('/api/')) {
          reply.status(404).send({
            error: 'NOT_FOUND',
            message: 'API endpoint not found',
          });
        } else {
          reply.sendFile('index.html');
        }
      });
    }

    // 连接数据库并创建索引
    const { connectToDatabase, createIndexes, checkReplicaSetStatus } = await import('./config/database.js');
    await connectToDatabase(fastify.log);
    await createIndexes(fastify.log);
    await checkReplicaSetStatus(fastify.log);

    // 启动服务器
    await fastify.listen({
      port: PORT,
      host: HOST,
    });

    fastify.log.info(`🚀 Server is running on http://${HOST}:${PORT}`);
    fastify.log.info(`📄 Documentation: http://localhost:${PORT}/docs`);
    fastify.log.info(`🎯 Health check: http://localhost:${PORT}/health`);
    fastify.log.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
}

// 优雅关闭处理
const signals = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
  process.on(signal, async () => {
    fastify.log.info(`\n收到 ${signal} 信号，正在优雅关闭服务器...`);
    
    try {
      await fastify.close();
      fastify.log.info('✅ 服务器已关闭');
      process.exit(0);
    } catch (error) {
      fastify.log.error('❌ 关闭服务器时出错:', error);
      process.exit(1);
    }
  });
});

// 未处理的异常处理
process.on('unhandledRejection', (reason, promise) => {
  fastify.log.error('未处理的 Promise 拒绝:', reason);
  fastify.log.error('在:', promise);
});

process.on('uncaughtException', (error) => {
  fastify.log.error('未捕获的异常:', error);
  process.exit(1);
});

// 启动应用
start(); 