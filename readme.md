# React Monorepo Boilerplate

一个现代化的全栈React应用脚手架，采用monorepo架构，集成用户认证、管理后台等完整功能。

## 🚀 技术栈

### 前端 (Client)
- **React 19** - 最新的React框架
- **TypeScript** - 类型安全的JavaScript
- **Vite** - 快速的构建工具
- **TailwindCSS 4** - 原子化CSS框架
- **Material-UI 7** - React组件库
- **TanStack Router** - 类型安全的路由
- **TanStack Query** - 数据获取和状态管理
- **Zustand** - 轻量级状态管理
- **React Hook Form + Zod** - 表单处理和验证
- **Chart.js** - 数据可视化
- **Playwright** - E2E测试

### 后端 (Server)
- **Fastify** - 高性能Node.js框架
- **TypeScript** - 类型安全的JavaScript
- **Prisma** - 现代数据库ORM
- **MongoDB** - NoSQL数据库
- **JWT** - 用户认证
- **bcrypt** - 密码加密
- **Swagger** - API文档

### 基础设施
- **Docker & Docker Compose** - 容器化部署
- **Nginx** - 反向代理和静态文件服务
- **pnpm** - 高效的包管理器
- **Monorepo** - 统一的代码仓库管理

## 📁 项目结构

```
react-monorepo-boilerplate/
├── client/                 # 前端应用
│   ├── src/
│   │   ├── components/     # React组件
│   │   │   ├── admin/      # 管理员组件
│   │   │   ├── auth/       # 认证组件
│   │   │   └── layout/     # 布局组件
│   │   ├── pages/          # 页面组件
│   │   ├── hooks/          # 自定义Hooks
│   │   ├── lib/            # 工具库
│   │   └── routes/         # 路由配置
│   └── package.json
├── server/                 # 后端服务
│   ├── src/
│   │   ├── routes/         # API路由
│   │   │   ├── auth/       # 认证API
│   │   │   ├── admin/      # 管理员API
│   │   │   └── users/      # 用户API
│   │   ├── plugins/        # Fastify插件
│   │   ├── utils/          # 工具函数
│   │   └── config/         # 配置文件
│   ├── prisma/             # 数据库模型和迁移
│   └── package.json
├── common/                 # 共享代码
│   └── src/
│       ├── types/          # 共享类型定义
│       └── enums/          # 枚举定义
├── compose.yml             # Docker Compose配置
├── Dockerfile              # Docker构建文件
└── nginx.conf              # Nginx配置
```

## 🛠️ 环境要求

- **Node.js** >= 20.19.0
- **pnpm** >= 9.0.0
- **Docker** & **Docker Compose** (生产环境)

## 📦 安装

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd react-monorepo-boilerplate
   ```

2. **安装依赖**
   ```bash
   pnpm install
   ```

3. **环境配置**
   ```bash
   # 快速设置开发环境变量
   pnpm setup:env
   
   # 或手动复制环境变量模板
   cp client/.env.example client/.env
   cp server/.env.example server/.env
   
   # 配置关键设置（编辑 server/.env）
   # DATABASE_URL=mongodb://localhost:27017/react-monorepo
   # JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

4. **数据库设置**
   ```bash
   # 启动MongoDB (如果使用Docker)
   docker run -d -p 27017:27017 --name mongodb mongo:7
   
   # 生成Prisma客户端
   pnpm --filter server db:generate
   
   # 推送数据库模式
   pnpm --filter server db:push
   
   # 填充示例数据 (可选)
   pnpm --filter server db:seed
   ```

## 🚀 开发

### 启动开发服务器
```bash
# 同时启动所有服务 (推荐)
pnpm dev

# 或分别启动
pnpm dev:common    # 共享代码监听
pnpm dev:client    # 前端开发服务器 (http://localhost:5173)
pnpm dev:server    # 后端开发服务器 (http://localhost:5055)
```

### 其他开发命令
```bash
# 类型检查
pnpm --filter client type-check
pnpm --filter server type-check

# 代码格式化
pnpm --filter client lint:fix
pnpm --filter server lint:fix

# 数据库管理
pnpm --filter server db:studio    # Prisma Studio
pnpm --filter server db:migrate   # 创建迁移
pnpm --filter server db:reset     # 重置数据库

# 测试
pnpm --filter client test         # E2E测试
```

## 🏗️ 构建

### 开发构建
```bash
pnpm build
```

### 生产构建
```bash
pnpm build
pnpm start
```

## 🐳 Docker部署

### 本地Docker部署
```bash
# 构建并启动所有服务
pnpm docker:prod

# 查看日志
pnpm docker:logs

# 停止服务
pnpm docker:down
```

### 生产环境部署

1. **准备环境变量**
   ```bash
   # 创建生产环境配置
   cp server/.env.example server/.env.production
   # 编辑生产环境配置
   ```

2. **启动服务**
   ```bash
   docker-compose up -d
   ```

3. **服务架构**
   - **MongoDB**: 数据库服务 (端口: 27017)
   - **Backend**: API服务 (端口: 5055)
   - **Nginx**: 反向代理 (端口: 80/443)
     - 静态文件服务
     - API代理 (`/api/*` → `backend:5055`)
     - SSL终端
     - Gzip压缩
     - 请求限制

## 🔐 认证系统

### 功能特性
- 用户注册/登录
- JWT token认证
- 密码加密存储
- 角色权限管理 (USER/ADMIN)
- 用户活动日志
- 保护路由

### API端点
```
POST /api/auth/register  # 用户注册
POST /api/auth/login     # 用户登录
GET  /api/auth/me        # 获取当前用户信息
GET  /api/users          # 获取用户列表 (管理员)
GET  /api/admin/stats    # 管理员统计数据
```

## 📊 管理后台

- **用户管理**: 查看、编辑用户信息
- **数据统计**: 用户活动分析
- **活动日志**: 系统操作记录
- **图表展示**: 数据可视化

## 🔧 配置说明

### 前端配置
- `client/vite.config.ts` - Vite配置
- `client/tailwind.config.js` - TailwindCSS配置
- `client/tsconfig.json` - TypeScript配置

### 后端配置
- `server/src/config/database.ts` - 数据库配置
- `server/prisma/schema.prisma` - 数据库模型
- `server/src/plugins/` - Fastify插件

### Docker配置
- `Dockerfile` - 应用镜像构建
- `compose.yml` - 服务编排
- `nginx.conf` - Nginx配置

## 📝 API文档

启动开发服务器后访问：
- **Swagger UI**: http://localhost:5055/documentation
- **API Schema**: http://localhost:5055/documentation/json

## 🧪 测试

```bash
# E2E测试
pnpm --filter client test

# 测试UI模式
pnpm --filter client test:ui

# 调试模式
pnpm --filter client test:debug
```

## 📈 性能优化

- **代码分割**: 路由级别的懒加载
- **Bundle优化**: Vite构建优化
- **缓存策略**: Nginx静态资源缓存
- **压缩**: Gzip和Brotli压缩
- **CDN**: 静态资源CDN加速

## 🔒 安全性

- **HTTPS**: SSL/TLS加密
- **CORS**: 跨域资源共享控制
- **Helmet**: 安全头设置
- **Rate Limiting**: 请求频率限制
- **JWT**: 安全的用户认证
- **bcrypt**: 密码加密存储

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 故障排除

### 常见问题

1. **端口占用**
   ```bash
   # 检查端口占用
   lsof -i :5173  # 前端端口
   lsof -i :5055  # 后端端口
   ```

2. **数据库连接失败**
   ```bash
   # 检查MongoDB状态
   docker ps | grep mongo
   
   # 重启MongoDB
   docker restart mongodb
   ```

3. **依赖安装失败**
   ```bash
   # 清理缓存
   pnpm store prune
   
   # 重新安装
   rm -rf node_modules
   pnpm install
   ```

4. **构建失败**
   ```bash
   # 清理构建缓存
   pnpm --filter client clean
   pnpm --filter server clean
   
   # 重新构建
   pnpm build
   ```

# 环境变量配置指南

本项目需要配置环境变量文件才能正常运行。请按照以下步骤配置：

## 1. 快速设置环境变量

### 开发环境设置
```bash
# 一键设置开发环境变量（推荐）
pnpm setup:env

# 手动复制（可选）
cp client/.env.example client/.env
cp server/.env.example server/.env
```

### 生产环境设置
```bash
# 设置生产环境变量
pnpm setup:env:prod

# 手动复制（可选）
cp client/.env.production.example client/.env.production
cp server/.env.production.example server/.env.production
```

## 2. 环境变量说明

### Client 环境变量 (`client/.env`)
```bash
# API配置
VITE_API_URL=http://localhost:5055/api
VITE_API_PROXY_TARGET=http://localhost:5055

# 开发服务器配置
VITE_PORT=5173
VITE_HOST=localhost

# 应用配置
VITE_APP_TITLE=全栈脚手架
VITE_APP_DESCRIPTION=基于 React + Fastify + MongoDB 的现代化全栈解决方案

# 功能开关
VITE_ENABLE_DEVTOOLS=true
VITE_ENABLE_MOCK=false

# 调试配置
VITE_LOG_LEVEL=debug
```

### Server 环境变量 (`server/.env`)
```bash
# 应用配置
NODE_ENV=development
PORT=5055
HOST=localhost

# 数据库配置
DATABASE_URL="mongodb://localhost:27017/react-monorepo"

# JWT配置 - 生产环境请务必修改为安全的密钥
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# CORS配置
CORS_ORIGIN=http://localhost:5173

# 日志配置
LOG_LEVEL=info

# 功能开关
ENABLE_SWAGGER=true

# Sentry配置（可选）
# SENTRY_DSN=your_sentry_dsn_here
```

## 3. 生产环境配置

### Client 生产环境 (`client/.env.production`)
```bash
# API配置
VITE_API_URL=https://your-api-domain.com/api

# 应用配置
VITE_APP_TITLE=全栈脚手架
VITE_APP_DESCRIPTION=基于 React + Fastify + MongoDB 的现代化全栈解决方案

# 功能开关
VITE_ENABLE_DEVTOOLS=false
VITE_ENABLE_MOCK=false

# 调试配置
VITE_LOG_LEVEL=warn

# Sentry配置（生产环境推荐配置）
VITE_SENTRY_DSN=your_production_sentry_dsn_here
VITE_SENTRY_ENVIRONMENT=production
```

### Server 生产环境 (`server/.env.production`)
```bash
# 应用配置
NODE_ENV=production
PORT=5055
HOST=0.0.0.0

# 数据库配置
DATABASE_URL="mongodb://your-mongo-host:27017/react-monorepo-prod"

# JWT配置 - 生产环境请务必修改为安全的密钥
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# CORS配置
CORS_ORIGIN=https://your-frontend-domain.com

# 日志配置
LOG_LEVEL=warn

# 功能开关
ENABLE_SWAGGER=false

# Sentry配置（生产环境推荐配置）
SENTRY_DSN=your_production_sentry_dsn_here
SENTRY_ENVIRONMENT=production
```

## 4. 重要提醒

- ⚠️ **不要将 `.env` 文件提交到 Git**
- 🔒 **生产环境请务必修改 JWT_SECRET**
- 🔧 **根据实际情况修改数据库连接字符串**
- 🌐 **生产环境请配置正确的域名和 CORS 设置**

## 5. 快速设置脚本

项目提供了便捷的环境变量设置脚本：

```bash
# 设置开发环境变量（推荐）
pnpm setup:env

# 仅设置客户端环境变量
pnpm setup:env:client

# 仅设置服务端环境变量  
pnpm setup:env:server

# 设置生产环境变量
pnpm setup:env:prod
```

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 创建 [Issue](https://github.com/damnright/react-monorepo-boilerplate/issues)
- 发送邮件到: qq287649920@gmail.com