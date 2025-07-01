// MongoDB 初始化脚本
// 该脚本在MongoDB容器首次启动时执行

// 切换到应用数据库
db = db.getSiblingDB(process.env.MONGO_DB_NAME || 'ezboard');

// 创建应用用户
db.createUser({
  user: process.env.MONGO_APP_USERNAME || 'appuser',
  pwd: process.env.MONGO_APP_PASSWORD || 'apppassword',
  roles: [
    {
      role: 'readWrite',
      db: process.env.MONGO_DB_NAME || 'ezboard'
    }
  ]
});

// 创建基础集合和索引
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: 1 });
db.activities.createIndex({ userId: 1 });
db.activities.createIndex({ createdAt: 1 });

print('MongoDB 初始化完成'); 