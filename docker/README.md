# Docker 部署配置

此目录包含了应用的 Docker 容器化配置文件。

## 📁 目录结构

```
docker/
├── nginx.conf          # Nginx 反向代理配置
├── ssl/                # SSL 证书目录
│   ├── cert.pem        # SSL 证书文件 (需要自行添加)
│   └── key.pem         # SSL 私钥文件 (需要自行添加)
├── mongo-init/         # MongoDB 初始化脚本
│   └── init.js         # 数据库初始化脚本
└── README.md           # 本文件
```

## 🚀 快速开始

### 1. 环境变量配置

复制根目录的 `.env.docker` 文件为 `.env`：

```bash
cp .env.docker .env
```

编辑 `.env` 文件，修改相应的配置：

```bash
# 必须修改的配置
MONGO_ROOT_PASSWORD=your-strong-root-password
MONGO_APP_PASSWORD=your-strong-app-password
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=https://yourdomain.com
```

### 2. SSL 证书配置

#### 生产环境
将您的 SSL 证书文件放入 `docker/ssl/` 目录：
- `cert.pem` - SSL 证书文件
- `key.pem` - SSL 私钥文件

#### 开发环境（自签名证书）
```bash
cd docker/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout key.pem -out cert.pem \
  -subj "/C=CN/ST=State/L=City/O=Organization/CN=localhost"
```

### 3. 启动服务

#### 生产环境部署
```bash
# 构建并启动所有生产服务
docker compose up -d

# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f
```

#### 开发环境部署
```bash
# 启动开发环境（包含热重载）
docker compose --profile dev up -d

# 仅启动数据库（本地开发后端）
docker compose up -d mongodb
```

## 📋 服务说明

### 生产环境服务

1. **mongodb** - MongoDB 数据库
   - 端口：27017
   - 数据持久化：`mongodb_data` 卷

2. **backend** - 后端 API 服务
   - 端口：5055
   - 健康检查：`/health` 端点

3. **nginx** - 反向代理和静态文件服务
   - 端口：80 (HTTP), 443 (HTTPS)
   - 自动将 HTTP 重定向到 HTTPS

### 开发环境服务

1. **frontend-dev** - 前端开发服务（热重载）
   - 端口：5173
   - 自动重载代码变更

2. **backend-dev** - 后端开发服务（热重载）
   - 端口：5056
   - 自动重载代码变更

## 🔧 常用命令

```bash
# 查看服务状态
docker compose ps

# 查看特定服务日志
docker compose logs -f backend
docker compose logs -f nginx

# 重启服务
docker compose restart backend

# 更新镜像并重启
docker compose pull
docker compose up -d

# 清理未使用的资源
docker system prune -f

# 完全重建服务
docker compose down
docker compose build --no-cache
docker compose up -d
```

## 🛡️ 安全配置

### 生产环境安全检查清单

- [ ] 修改默认的数据库密码
- [ ] 使用强随机 JWT 密钥
- [ ] 配置有效的 SSL 证书
- [ ] 设置合适的 CORS 域名
- [ ] 配置防火墙规则
- [ ] 定期备份数据库
- [ ] 监控服务健康状态

### 网络安全

- 所有服务运行在独立的 Docker 网络中
- 数据库不直接暴露到外网
- Nginx 提供 SSL 终端和安全头
- 配置了请求速率限制

## 📊 监控和日志

### 健康检查

所有服务都配置了健康检查：
- **MongoDB**: `mongosh --eval "db.adminCommand('ping')"`
- **Backend**: HTTP GET `/health` 
- **Nginx**: `wget http://localhost/health`

### 日志管理

日志存储位置：
- Nginx 日志：`nginx_logs` 卷
- 应用日志：`app_logs` 卷
- MongoDB 日志：`mongodb_logs` 卷

## 🐛 故障排除

### 常见问题

1. **服务启动失败**
   ```bash
   # 检查服务状态
   docker compose ps
   
   # 查看错误日志
   docker compose logs backend
   ```

2. **SSL 证书问题**
   ```bash
   # 检查证书文件是否存在
   ls -la docker/ssl/
   
   # 验证证书有效性
   openssl x509 -in docker/ssl/cert.pem -text -noout
   ```

3. **数据库连接问题**
   ```bash
   # 检查 MongoDB 是否健康
   docker compose exec mongodb mongosh --eval "db.adminCommand('ping')"
   
   # 检查网络连接
   docker compose exec backend ping mongodb
   ```

4. **权限问题**
   ```bash
   # 修复文件权限
   sudo chown -R $USER:$USER docker/
   chmod -R 755 docker/
   ```

## 📝 备份和恢复

### 数据库备份
```bash
# 创建备份
docker compose exec mongodb mongodump --out /tmp/backup

# 从容器复制备份
docker compose cp mongodb:/tmp/backup ./backup
```

### 数据库恢复
```bash
# 复制备份到容器
docker compose cp ./backup mongodb:/tmp/restore

# 恢复数据
docker compose exec mongodb mongorestore /tmp/restore
``` 