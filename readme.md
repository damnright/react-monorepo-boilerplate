## dev
service: 
- dev-ezboard-mongodb 开放端口 or 本地部署？
- local client & server
- watch build common

## prod
service:
典型三层架构：数据库层-应用层-代理层
- ezboard-mongodb 持续运行
- nginx reverse proxy/static file service/SSL终端/gzip/静态资源缓存控制/连接复用和Keep-Alive/请求路由和API代理 (/api/ → backend:5055)/限制请求频率/求体大小限制/隐藏服务器信息 持续运行 port 443
- cloudflare防护配置 DDos/WAF  外部cdn功能
- build common
- build client
- build server & run server port 5055