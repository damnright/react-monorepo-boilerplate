import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { prisma } from '../utils/prisma.js';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: typeof prisma;
  }
}

const prismaPlugin: FastifyPluginAsync = async (fastify) => {
  // 将 Prisma 实例附加到 Fastify 实例
  fastify.decorate('prisma', prisma);

  // 当 Fastify 关闭时断开 Prisma 连接
  fastify.addHook('onClose', async () => {
    await prisma.$disconnect();
  });
};

export default fp(prismaPlugin); 