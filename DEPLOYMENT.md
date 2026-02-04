# 云上网点平台后端 - 部署文档

本文档提供云上网点平台后端的详细部署指南。

## 📋 目录

- [环境要求](#环境要求)
- [部署方式](#部署方式)
- [Docker部署](#docker部署)
- [传统部署](#传统部署)
- [数据库配置](#数据库配置)
- [生产环境优化](#生产环境优化)
- [监控与日志](#监控与日志)
- [常见问题](#常见问题)

## 🔧 环境要求

### 最低配置

| 组件    | 版本要求 |
| ------- | -------- |
| Node.js | >= 18.x  |
| MySQL   | >= 8.0   |
| npm     | >= 9.x   |
| 内存    | >= 2GB   |
| 磁盘    | >= 20GB  |

### 推荐配置

| 组件    | 版本/配置   |
| ------- | ----------- |
| Node.js | 20.x LTS    |
| MySQL   | 8.0.x       |
| npm     | 10.x        |
| 内存    | >= 4GB      |
| 磁盘    | >= 50GB SSD |
| CPU     | >= 2核      |

## 📦 部署方式

本项目支持以下三种部署方式：

1. **Docker部署**（推荐）- 简单、可复现、易于管理
2. **传统部署** - 直接在服务器上运行
3. **云服务部署** - 部署到阿里云、腾讯云等

## 🐳 Docker部署

### 方式一：使用Docker Compose（推荐）

#### 1. 准备工作

```bash
# 克隆项目
git clone https://github.com/yourusername/yinhang-backend.git
cd yinhang-backend

# 复制环境变量文件
cp .env.example .env
```

#### 2. 配置环境变量

编辑 `.env` 文件，设置生产环境配置：

```bash
# 应用配置
NODE_ENV=production
PORT=3000
API_PREFIX=api

# 数据库配置
DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_strong_password_here
DB_DATABASE=yinhang_platform
DB_SYNCHRONIZE=false
DB_LOGGING=false

# JWT配置（务必使用强密码）
JWT_SECRET=your-super-strong-jwt-secret-key-change-this-in-production
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# 微信支付配置
WECHAT_PAY_APP_ID=your-wechat-app-id
WECHAT_PAY_MCH_ID=your-mch-id
WECHAT_PAY_API_V3_KEY=your-api-v3-key
WECHAT_PAY_CERT_PATH=/app/config/certs/apiclient_cert.p12
WECHAT_PAY_CERT_SERIAL_NO=your-cert-serial-no
WECHAT_PAY_NOTIFY_URL=https://your-domain.com/api/payment/callback/wechat

# 阿里云OSS配置
ALIYUN_OSS_REGION=oss-cn-hangzhou
ALIYUN_OSS_ACCESS_KEY_ID=your-access-key-id
ALIYUN_OSS_ACCESS_KEY_SECRET=your-access-key-secret
ALIYUN_OSS_BUCKET=your-bucket-name
ALIYUN_OSS_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
```

#### 3. 创建docker-compose.yml

在项目根目录创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: yinhang-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: ${DB_DATABASE}
      MYSQL_USER: ${DB_USERNAME}
    ports:
      - '3306:3306'
    volumes:
      - mysql-data:/var/lib/mysql
      - ./database/init:/docker-entrypoint-initdb.d
    networks:
      - yinhang-network
    healthcheck:
      test: ['CMD', 'mysqladmin', 'ping', '-h', 'localhost']
      timeout: 20s
      retries: 10

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: yinhang-backend
    restart: always
    ports:
      - '3000:3000'
    env_file:
      - .env
    depends_on:
      mysql:
        condition: service_healthy
    volumes:
      - ./logs:/app/logs
      - ./certs:/app/certs
    networks:
      - yinhang-network
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  mysql-data:

networks:
  yinhang-network:
    driver: bridge
```

#### 4. 创建Dockerfile

在项目根目录创建 `Dockerfile`：

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建项目
RUN npm run build

# 生产阶段
FROM node:20-alpine

WORKDIR /app

# 安装dumb-init以正确处理信号
RUN apk add --no-cache dumb-init curl

# 复制构建结果和依赖
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    mkdir -p /app/logs /app/certs && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# 使用dumb-init启动
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
```

#### 5. 启动服务

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f backend

# 查看服务状态
docker-compose ps

# 停止服务
docker-compose down

# 停止服务并删除数据卷
docker-compose down -v
```

#### 6. 初始化数据库

首次部署后，需要执行数据库迁移：

```bash
# 进入后端容器
docker-compose exec backend sh

# 执行数据库迁移（如果使用TypeORM Migration）
npm run migration:run

# 或直接同步数据库结构（仅限开发环境，生产环境不推荐）
# 设置 .env 中的 DB_SYNCHRONIZE=true 后重启容器
```

### 方式二：单独使用Docker

```bash
# 构建镜像
docker build -t yinhang-backend:v1.0.0 .

# 运行容器
docker run -d \
  --name yinhang-backend \
  -p 3000:3000 \
  --env-file .env \
  -v $(pwd)/logs:/app/logs \
  -v $(pwd)/certs:/app/certs \
  --link mysql:mysql \
  yinhang-backend:v1.0.0

# 查看日志
docker logs -f yinhang-backend

# 停止容器
docker stop yinhang-backend

# 删除容器
docker rm yinhang-backend
```

## 🖥️ 传统部署

### 1. 安装Node.js

```bash
# 使用nvm安装Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

### 2. 安装依赖

```bash
# 克隆项目
git clone https://github.com/yourusername/yinhang-backend.git
cd yinhang-backend

# 安装依赖
npm install --production
```

### 3. 配置环境变量

```bash
cp .env.example .env
vim .env
```

### 4. 配置数据库

```bash
# 登录MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE yinhang_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 创建用户（可选）
CREATE USER 'yinhang'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON yinhang_platform.* TO 'yinhang'@'localhost';
FLUSH PRIVILEGES;

# 退出
EXIT;
```

### 5. 构建项目

```bash
npm run build
```

### 6. 使用PM2运行（推荐）

安装PM2：

```bash
npm install -g pm2
```

创建PM2配置文件 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [
    {
      name: 'yinhang-backend',
      script: 'dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '1G',
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
};
```

启动应用：

```bash
# 开发环境
pm2 start ecosystem.config.js --env development

# 生产环境
pm2 start ecosystem.config.js --env production

# 查看日志
pm2 logs

# 查看状态
pm2 status

# 重启
pm2 restart yinhang-backend

# 停止
pm2 stop yinhang-backend

# 查看详细信息
pm2 show yinhang-backend
```

### 7. 使用Nginx反向代理

创建Nginx配置文件 `/etc/nginx/sites-available/yinhang-backend`：

```nginx
upstream yinhang_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;

    server_name your-domain.com;

    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    server_name your-domain.com;

    # SSL证书配置
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 日志
    access_log /var/log/nginx/yinhang-access.log;
    error_log /var/log/nginx/yinhang-error.log;

    # 限制请求体大小（用于文件上传）
    client_max_body_size 10M;

    # API代理
    location /api/ {
        proxy_pass http://yinhang_backend;
        proxy_http_version 1.1;

        # 代理头设置
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # 缓冲设置
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }

    # Swagger文档
    location /api/docs {
        proxy_pass http://yinhang_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 健康检查
    location /health {
        proxy_pass http://yinhang_backend;
        access_log off;
    }
}
```

启用配置：

```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/yinhang-backend /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

## 🗄️ 数据库配置

### MySQL优化配置

编辑 `/etc/mysql/mysql.conf.d/mysqld.cnf`：

```ini
[mysqld]
# 基础配置
default-storage-engine = InnoDB
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# 连接配置
max_connections = 500
max_connect_errors = 10000

# InnoDB配置
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT

# 查询缓存（MySQL 8.0已移除，使用8.0以下版本时配置）
query_cache_type = 1
query_cache_size = 128M

# 慢查询日志
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow-query.log
long_query_time = 2

# 二进制日志
log_bin = /var/log/mysql/mysql-bin.log
binlog_format = ROW
expire_logs_days = 7

# 其他优化
skip_name_resolve = 1
```

重启MySQL：

```bash
sudo systemctl restart mysql
```

### 数据库备份

创建备份脚本 `/usr/local/bin/mysql-backup.sh`：

```bash
#!/bin/bash

# 配置
BACKUP_DIR="/var/backups/mysql"
DB_NAME="yinhang_platform"
DB_USER="root"
DB_PASS="your_password"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${DATE}.sql.gz"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行备份
mysqldump -u$DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_FILE

# 删除7天前的备份
find $BACKUP_DIR -name "${DB_NAME}_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE"
```

设置定时任务：

```bash
# 编辑crontab
crontab -e

# 每天凌晨2点执行备份
0 2 * * * /usr/local/bin/mysql-backup.sh
```

## ⚡ 生产环境优化

### 1. Node.js性能优化

```bash
# 增加文件描述符限制
ulimit -n 65535

# 永久设置
echo "* soft nofile 65535" >> /etc/security/limits.conf
echo "* hard nofile 65535" >> /etc/security/limits.conf
```

### 2. 环境变量优化

```bash
# Node.js性能优化
NODE_ENV=production
NODE_OPTIONS="--max-old-space-size=2048"

# 应用配置
PORT=3000
API_PREFIX=api

# 数据库连接池
DB_SYNCHRONIZE=false
DB_LOGGING=false
```

### 3. Redis缓存（可选）

对于需要高性能的场景，可以集成Redis缓存：

```bash
# 安装Redis
sudo apt-get install redis-server

# 启动Redis
sudo systemctl start redis-server

# 配置Redis（/etc/redis/redis.conf）
maxmemory 256mb
maxmemory-policy allkeys-lru
```

### 4. 负载均衡

使用多个实例进行负载均衡：

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'yinhang-backend',
      script: 'dist/main.js',
      instances: 4, // 根据CPU核心数调整
      exec_mode: 'cluster',
      // ... 其他配置
    },
  ],
};
```

## 📊 监控与日志

### 1. PM2监控

```bash
# 安装PM2监控
pm2 install pm2-logrotate

# 查看监控面板
pm2 monit
```

### 2. 应用日志

日志目录结构：

```
logs/
├── access.log       # 访问日志
├── error.log        # 错误日志
├── combined.log     # 合并日志
└── application/     # 应用日志
    ├── info.log
    ├── warn.log
    └── error.log
```

### 3. 系统监控

使用 `htop` 监控系统资源：

```bash
sudo apt-get install htop
htop
```

### 4. 日志轮转

创建 `/etc/logrotate.d/yinhang-backend`：

```
/home/ubuntu/yinhang-backend/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0640 ubuntu ubuntu
    sharedscripts
    postrotate
        pm2 reload yinhang-backend
    endscript
}
```

## 🔒 安全加固

### 1. 防火墙配置

```bash
# 配置UFW防火墙
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 2. 配置fail2ban

```bash
# 安装fail2ban
sudo apt-get install fail2ban

# 配置jail.local
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# 编辑配置
sudo vim /etc/fail2ban/jail.local

# 启动
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. SSL/TLS证书

使用Let's Encrypt免费证书：

```bash
# 安装certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

## ❓ 常见问题

### 问题1：端口被占用

```bash
# 查看端口占用
sudo lsof -i :3000

# 杀死进程
sudo kill -9 <PID>
```

### 问题2：数据库连接失败

检查：

1. MySQL服务是否运行
2. 数据库用户名和密码是否正确
3. 数据库是否创建
4. 防火墙是否允许连接

```bash
# 检查MySQL状态
sudo systemctl status mysql

# 测试连接
mysql -u root -p -h localhost
```

### 问题3：应用启动失败

```bash
# 查看详细日志
pm2 logs yinhang-backend --lines 100

# 检查环境变量
pm2 env 0
```

### 问题4：内存不足

```bash
# 增加swap空间
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 问题5：文件上传失败

检查：

1. Nginx的 `client_max_body_size` 配置
2. 项目的 `MAX_FILE_SIZE` 环境变量
3. 磁盘空间是否充足

## 📞 技术支持

如遇到部署问题，请参考以下资源：

- [NestJS部署文档](https://docs.nestjs.com/deployment)
- [Docker官方文档](https://docs.docker.com/)
- [PM2文档](https://pm2.keymetrics.io/docs/)
- [Nginx文档](https://nginx.org/en/docs/)

---

**文档版本**: v1.0
**最后更新**: 2026-02-03
