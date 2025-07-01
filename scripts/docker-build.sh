#!/bin/bash

# Docker 构建测试脚本

set -e

echo "🚀 开始Docker构建测试..."

# 1. 检查环境
echo "📋 检查环境..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装"
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose 未安装"
    exit 1
fi

# 2. 检查配置文件
echo "📋 检查配置文件..."
if [ ! -f ".env" ]; then
    echo "❌ .env 文件不存在，请复制 env.docker.example 为 .env"
    exit 1
fi

if [ ! -f "docker/ssl/cert.pem" ] || [ ! -f "docker/ssl/key.pem" ]; then
    echo "⚠️  SSL证书文件不存在，创建自签名证书..."
    mkdir -p docker/ssl
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout docker/ssl/key.pem -out docker/ssl/cert.pem \
        -subj "/C=CN/ST=Beijing/L=Beijing/O=Dev/CN=localhost" 2>/dev/null || true
fi

# 3. 清理旧的构建
echo "🧹 清理旧的构建..."
docker compose down --volumes --rmi all || true
docker system prune -f || true

# 4. 构建和启动服务
echo "🔨 构建Docker镜像..."
docker compose build --no-cache

echo "🎯 验证配置..."
docker compose config

echo "🚀 启动服务..."
docker compose up -d

# 5. 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 6. 检查服务状态
echo "📊 检查服务状态..."
docker compose ps

# 7. 测试健康检查
echo "🔍 测试服务健康状态..."
if docker compose ps | grep -q "healthy"; then
    echo "✅ 服务启动成功！"
else
    echo "❌ 服务健康检查失败"
    echo "📋 查看日志："
    docker compose logs --tail=50
    exit 1
fi

# 8. 显示访问信息
echo ""
echo "🎉 Docker构建测试完成！"
echo "📋 服务访问信息："
echo "   - 前端：http://localhost:80"
echo "   - 后端API：http://localhost:5055"
echo "   - 健康检查：http://localhost:5055/health"
echo ""
echo "🔧 常用命令："
echo "   - 查看日志：docker compose logs -f"
echo "   - 停止服务：docker compose down"
echo "   - 重启服务：docker compose restart"
echo "" 