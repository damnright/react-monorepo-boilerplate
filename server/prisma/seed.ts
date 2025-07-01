import bcrypt from 'bcrypt';
import { prisma } from '../src/utils/prisma.js';

async function main() {
  console.log('开始种子数据创建...');

  try {
    // 创建管理员用户
    const adminPassword = await bcrypt.hash('admin123456', 12);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        name: '系统管理员',
        password: adminPassword,
        role: 'ADMIN',
        isActive: true,
      },
    });

    // 创建普通用户
    const userPassword = await bcrypt.hash('user123456', 12);
    const user = await prisma.user.upsert({
      where: { email: 'user@example.com' },
      update: {},
      create: {
        email: 'user@example.com',
        name: '普通用户',
        password: userPassword,
        role: 'USER',
        isActive: true,
      },
    });

    // 创建一些示例活动记录
    await prisma.activity.createMany({
      data: [
        {
          action: 'register',
          description: '管理员账户注册',
          userId: admin.id,
          metadata: {
            ip: '127.0.0.1',
            userAgent: 'Seed Script',
          },
          ipAddress: '127.0.0.1',
          userAgent: 'Seed Script',
        },
        {
          action: 'register',
          description: '用户账户注册',
          userId: user.id,
          metadata: {
            ip: '127.0.0.1',
            userAgent: 'Seed Script',
          },
          ipAddress: '127.0.0.1',
          userAgent: 'Seed Script',
        },
        {
          action: 'login',
          description: '管理员登录系统',
          userId: admin.id,
          metadata: {
            ip: '127.0.0.1',
            userAgent: 'Seed Script',
          },
          ipAddress: '127.0.0.1',
          userAgent: 'Seed Script',
        },
      ],
    });

    console.log('✅ 种子数据创建完成');
    console.log(`
创建的用户账户:
📧 管理员: admin@example.com / admin123456
📧 普通用户: user@example.com / user123456
    `);
  } catch (error) {
    console.error('❌ 种子数据创建失败:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 