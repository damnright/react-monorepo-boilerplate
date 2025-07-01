# ==============================================================================
# 多阶段构建：前后端全栈应用 + common共享包
# ==============================================================================

# ----------- Stage 1: 基础环境 -----------
FROM node:20-alpine AS base
RUN npm install -g pnpm@9.15.2
WORKDIR /app

# ----------- Stage 2: 安装依赖 -----------
FROM base AS deps
# 复制pnpm配置文件
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY .npmrc* ./

# 复制所有package.json文件
COPY common/package.json ./common/
COPY client/package.json ./client/
COPY server/package.json ./server/

# 安装所有依赖
RUN pnpm install --frozen-lockfile

# ----------- Stage 3: 构建common包 -----------
FROM base AS common-build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/common/node_modules ./common/node_modules
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY common/ ./common/
RUN pnpm --filter common build

# ----------- Stage 4: 构建client (前端) -----------
FROM base AS client-build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/client/node_modules ./client/node_modules
COPY --from=common-build /app/common ./common
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY client/ ./client/

# 构建前端
RUN pnpm --filter client build

# ----------- Stage 5: 构建server (后端) -----------
FROM base AS server-build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/server/node_modules ./server/node_modules
COPY --from=common-build /app/common ./common
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY server/ ./server/

# 构建后端
RUN pnpm --filter server build

# ----------- Stage 6: 生产环境运行时 -----------
FROM node:20-alpine AS production
RUN npm install -g pnpm@9.15.2
WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# 复制package.json文件
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY common/package.json ./common/
COPY server/package.json ./server/

# 安装生产依赖
RUN pnpm install --prod --frozen-lockfile

# 复制构建产物
COPY --from=common-build /app/common/dist ./common/dist
COPY --from=server-build /app/server/dist ./server/dist

# 复制server配置文件
COPY server/prisma ./server/prisma

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S fastify -u 1001
USER fastify

# 暴露端口
EXPOSE 5055

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5055/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# 启动命令
CMD ["node", "server/dist/index.js"]

# ----------- Stage 7: Nginx静态文件服务器 -----------
FROM nginx:alpine AS nginx
# 复制前端构建产物
COPY --from=client-build /app/client/dist /usr/share/nginx/html
# 删除nginx默认配置
RUN rm /etc/nginx/conf.d/default.conf
# 暴露端口
EXPOSE 80 443 