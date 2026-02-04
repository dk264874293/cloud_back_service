<div align="center">

# 云上网点平台后端

**连接用户、服务商、银行的金融需求匹配平台**

[![NestJS](https://img.shields.io/badge/NestJS-11.0-e0234e?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-UNLICENSED-red)](LICENSE)

</div>

## 📖 项目简介

云上网点平台是一个连接用户、服务商、银行的金融需求匹配平台后端系统。平台提供以下核心功能：

- **用户端**：发布金融需求（贷款/存款/理财）、查看订单、提现、邀请好友
- **服务商端**：接管订单、需求梳理、上传客户报告、线下对接银行
- **银行端**：购买订单、查看需求报告、线下沟通、反馈审批结果
- **运营端**：客户管理、服务商管理（支持多层级查询）、订单管理、分佣配置、数据统计

### 核心业务流程

```
用户发布需求
    ↓
分配管户人（自然客户随机分配 / 渠道客户自动绑定）
    ↓
需求梳理（管户人自行承接或派单池分配访谈人）
    ↓
上传客户需求报告（PDF/图片）
    ↓
运营设置价格和派单银行
    ↓
订单上架银行端（脱敏展示需求概要）
    ↓
银行客户经理购买订单（支付费用）
    ↓
查看管户人联系方式，约定线下沟通
    ↓
管户人发起现场确认
    ↓
银行客户经理线上确认（费用不可退）
    ↓
用户选择合作银行
    ↓
（可选）发起委托订单 → 业务受理人对接银行办理手续
```

### 服务商多层级结构

**服务商类型层级**（加盟商 → 渠道商 → 服务商）：

- **FRANCHISE（加盟商）**：层级 0，根节点，只能创建 CHANNEL 类型子节点
- **CHANNEL（渠道商）**：层级 1，归属 FRANCHISE，只能创建 SERVICE_PROVIDER 类型子节点
- **SERVICE_PROVIDER（服务商）**：层级 2，归属 CHANNEL，不能创建子节点（叶子节点）

**层级字段说明**：

- `level`: 层级深度（0=加盟商, 1=渠道商, 2=服务商）
- `path`: 物化路径（如 "1/3/7" 表示从根到该节点的完整路径）
- `rootId`: 根节点 ID（用于快速查询同一棵树的所有节点）
- `parent_id`: 上级节点 ID（使用邻接表模型）

**性能优化**：

- ✅ 4 个性能索引（parent_id、path、root_id、type+parent）
- ✅ WITH RECURSIVE 递归查询（MySQL 8.0+ 原生支持）
- ✅ Redis 缓存集成（5 分钟 TTL，减少数据库访问）

**类型约束**：

- ✅ 严格的类型层级规则验证
- ✅ 禁止节点移动（创建后不允许更换父节点）
- ✅ 根节点必须是 FRANCHISE 类型

**层级查询功能**：

- ✅ 获取所有后代节点（递归查询，支持任意深度）
- ✅ 获取所有祖先节点（递归查询，支持任意深度）
- ✅ 获取从根到节点的完整路径（O(1) 查询）
- ✅ 按类型统计子节点数量
- ✅ Redis 缓存集成（5 分钟 TTL，提升查询性能）

## ✨ 功能特性

- 🔐 **JWT双令牌认证** - 支持access_token和refresh_token机制
- 👥 **多角色权限控制** - 用户/服务商/银行/管理员四种角色，细粒度权限管理
- 📝 **订单状态机** - 完整的订单状态流转与日志记录
- 💰 **智能分佣系统** - 可配置的分佣规则，支持多层级佣金分配
- 💳 **微信支付集成** - 支持JSAPI和Native支付方式
- 📁 **文件上传管理** - 阿里云OSS集成，支持PDF/图片上传
- 🔒 **数据脱敏** - 敏感信息自动脱敏处理
- 📊 **操作日志** - 完整的操作记录与审计追踪
- 📘 **Swagger API文档** - 自动生成交互式API文档
- ✅ **类型安全** - TypeScript严格模式，完整的类型定义

## 🛠️ 技术栈

### 后端框架

- [NestJS](https://nestjs.com/) - 渐进式Node.js框架
- [TypeScript](https://www.typescriptlang.org/) - JavaScript超集
- [TypeORM](https://typeorm.io/) - ORM框架
- [MySQL](https://www.mysql.com/) - 关系型数据库

### 认证授权

- [@nestjs/jwt](https://github.com/nestjs/jwt) - JWT认证
- [passport](http://www.passportjs.org/) - 认证中间件
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js) - 密码加密

### 验证与文档

- [class-validator](https://github.com/typestack/class-validator) - DTO验证
- [class-transformer](https://github.com/typestack/class-transformer) - 对象转换
- [@nestjs/swagger](https://github.com/nestjs/swagger) - API文档生成

### 第三方集成

- [mysql2](https://github.com/sidorares/node-mysql2) - MySQL驱动
- [wechatpay-node-v3](https://github.com/wechatpay-apiv3/wechatpay-node-v3) - 微信支付SDK
- [ali-oss](https://github.com/ali-sdk/ali-oss) - 阿里云OSS

### 开发工具

- [Jest](https://jestjs.io/) - 单元测试框架
- [ESLint](https://eslint.org/) - 代码检查
- [Prettier](https://prettier.io/) - 代码格式化

## 📁 项目结构

```
yinhang/
├── src/
│   ├── main.ts                      # 应用入口
│   ├── app.module.ts                # 根模块
│   ├── common/                      # 公共模块
│   │   ├── decorators/              # 自定义装饰器 (@Roles, @CurrentUser等)
│   │   ├── dto/                     # 公共DTO (分页、响应等)
│   │   ├── enums/                   # 枚举定义 (用户角色、订单状态等)
│   │   ├── filters/                 # 异常过滤器
│   │   ├── guards/                  # 守卫 (JWT认证、角色验证)
│   │   ├── interceptors/            # 拦截器
│   │   ├── middleware/              # 中间件
│   │   └── utils/                   # 工具函数
│   ├── config/                      # 配置模块
│   │   ├── config.module.ts
│   │   ├── config.service.ts
│   │   ├── config.interface.ts
│   │   └── typeorm.config.ts
│   ├── database/                    # 数据库相关
│   │   ├── migrations/              # 数据库迁移文件
│   │   └── seeds/                   # 种子数据
│   └── modules/                     # 业务模块
│       ├── auth/                    # 认证模块 (注册/登录/刷新令牌、登出)
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── strategies/
│       │   └── dto/
│       ├── user/                    # 用户模块
│       │   ├── user.controller.ts
│       │   ├── user.service.ts
│       │   ├── user.entity.ts
│       │   └── dto/
│       ├── order/                   # 订单模块
│       │   ├── order.controller.ts
│       │   ├── order.service.ts
│       │   ├── order-status.service.ts
│       │   ├── entities/
│       │   │   ├── connection-order.entity.ts      # 对接订单
│       │   │   │   ├── entrustment-order.entity.ts     # 委托订单
│       │   │   └── order-log.entity.ts             # 订单日志
│       │   └── dto/
│       ├── payment/                 # 支付模块
│       │   ├── payment.controller.ts
│       │   ├── payment.service.ts
│       │   ├── wechat-pay.service.ts
│       │   ├── payment.entity.ts
│       │   └── dto/
│       ├── commission/              # 分佣模块
│       │   ├── commission.controller.ts
│       │   ├── commission.service.ts
│       │   ├── commission-calculation.service.ts
│       │   ├── entities/
│       │   │   ├── commission-rule.entity.ts       # 分佣规则
│       │   │   └── commission-record.entity.ts    # 分佣记录
│       │   └── dto/
│       ├── file/                    # 文件模块
│       │   ├── file.controller.ts
│       │   ├── file.service.ts
│       │   ├── oss.service.ts
│       │   ├── file.entity.ts
│       │   └── dto/
│       ├── service-provider/        # 服务商模块
│       │   ├── service-provider.controller.ts
│       │   ├── service-provider.service.ts
│       │   ├── entities/
│       │   │   ├── service-provider.entity.ts     # 服务商
│       │   ├── franchise.entity.ts            # 加盟商
│       │   │   ├── channel.entity.ts              # 渠道商
│       │   │   └── dto/
│       │   ├── cache.service.ts                      # Redis 缓存服务（新增）
│       │   └── dto/
│       ├── bank/                    # 银行模块
│       │   ├── bank.controller.ts
│       │   ├── bank.service.ts
│       │   ├── entities/
│       │   ├── bank.entity.ts                 # 银行
│       │   └── bank-branch.entity.ts          # 银行分行
│       │   └── dto/
│       ├── withdrawal/              # 提现模块
│       │   ├── withdrawal.controller.ts
│       │   ├── withdrawal.service.ts
│       │   ├── withdrawal.entity.ts
│       │   └── dto/
│       ├── invitation/              # 邀请模块
│       │   ├── invitation.controller.ts
│       │   ├── invitation.service.ts
│       │   ├── invitation.entity.ts
│       │   └── dto/
│       ├── feedback/                # 反馈模块
│       │   ├── feedback.controller.ts
│       │   ├── feedback.service.ts
│       │   ├── feedback.entity.ts
│   │   └── dto/
│       ├── log/                     # 日志模块
│       │   ├── log.controller.ts
│       │   ├── log.service.ts
│   │   ├── operation-log.entity.ts
│       │   └── dto/
│       ├── admin/                   # 运营管理模块
│       │   ├── admin.controller.ts
│       │   └── dto/
│       ├── test/                           # 测试文件
│ │   ├── unit/                       # 单元测试
│       │   ├── integration/                # 集成测试
│   └── e2e/                        # 端到端测试
├── test/
├── .env.example                    # 环境变量示例
├── .prettierrc                     # Prettier配置
├── eslint.config.mjs              # ESLint配置
├── nest-cli.json                   # NestJS CLI配置
├── tsconfig.json                   # TypeScript配置
├── package.json                    # 项目依赖
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18.x
- MySQL >= 8.0
- npm >= 9.x

### 安装依赖

```bash
npm install
```

### 环境配置

1. 复制环境变量示例文件：

```bash
cp .env.example .env
```

2. 根据实际情况修改 `.env` 文件中的配置项：

```bash
# 应用配置
NODE_ENV=development
PORT=3000
API_PREFIX=api

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=yinhang_platform
DB_SYNCHRONIZE=false
DB_LOGGING=true

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# 微信支付配置
WECHAT_PAY_APP_ID=your-wechat-app-id
WECHAT_PAY_MCH_ID=your-mch-id
WECHAT_PAY_API_V3_KEY=your-api-v3-key
WECHAT_PAY_CERT_PATH=/path/to/apiclient_cert.p12
WECHAT_PAY_CERT_SERIAL_NO=your-cert-serial-no
WECHAT_PAY_NOTIFY_URL=https://your-domain.com/api/payment/callback/wechat

# 阿里云OSS配置
ALIYUN_OSS_REGION=oss-cn-hangzhou
ALIYUN_OSS_ACCESS_KEY_ID=your-access-key-id
ALIYUN_OSS_ACCESS_KEY_SECRET=your-access-key-secret
ALIYUN_OSS_BUCKET=your-bucket-name
ALIYUN_OSS_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com

# 文件上传配置
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_TTL=300               # 缓存过期时间（秒，默认 5 分钟）
REDIS_KEY_PREFIX=sp:        # ServiceProvider 缓存键前缀
```

### 数据库初始化

1. 创建数据库：

```bash
mysql -u root -p "
CREATE DATABASE yinhang_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
"
```

2. 同步数据库结构（开发环境）：

```bash
# 设置 .env 中的 DB_SYNCHRONIZE=true
npm run start:dev
```

### 运行项目

```bash
# 开发模式（带热重载）
npm run start:dev

# 调试模式
npm run start:debug

# 生产模式
npm run build
npm run start:prod
```

### 访问应用

启动成功后，可以通过以下地址访问：

- **应用地址**: http://localhost:3000
- **API文档**: http://localhost:3000/api/docs

## 📚 API文档

项目集成了Swagger，自动生成交互式API文档。启动项目后访问：

```
http://localhost:3000/api/docs
```

### API模块

| 模块     | 路径前缀          | 描述                                             |
| -------- | ----------------- | ------------------------------------------------ |
| 认证模块 | `/api/auth`       | 注册、登录、刷新令牌、登出                       |
| 用户模块 | `/api/user`       | 用户信息、角色切换、认证                         |
| 订单模块 | `/api/order`      | 对接订单、委托订单管理                           |
| 支付模块 | `/api/payment`    | 创建支付、支付回调、退款                         |
| 文件模块 | `/api/file`       | 文件上传、文件管理                               |
| 分佣模块 | `/api/commission` | 分佣规则配置、分佣记录                           |
| 银行模块 | `/api/bank`       | 银行信息管理                                     |
| 提现模块 | `/api/withdrawal` | 提现申请、提现审核                               |
| 邀请模块 | `/api/invitation` | 邀请好友                                         |
| 反馈模块 | `/api/feedback`   | 用户反馈管理                                     |
| 日志模块 | `/api/log`        | 操作日志                                         |
| 运营管理 | `/api/admin`      | 客户管理、服务商管理（支持多层级查询）、数据统计 |

### 层级查询 API 列表

| 端点         | 方法 | 路径                  | 描述                                   |
| ------------ | ---- | --------------------- | -------------------------------------- |
| 获取后代节点 | GET  | `/:id/descendants`    | 获取某个节点的所有后代节点（递归查询） |
| 获取祖先节点 | GET  | `/:id/ancestors`      | 获取某个节点的所有祖先节点（递归查询） |
| 获取完整路径 | GET  | `/:id/path`           | 获取从根到节点的完整路径               |
| 统计子节点   | GET  | `/:id/children-stats` | 按类型统计子节点数量                   |
| 按类型查询   | GET  | `/type/:type`         | 按类型查询节点（支持分页）             |
| 获取根节点   | GET  | `/roots`              | 获取所有根节点（FRANCHISE）            |

## 🧪 测试

```bash
# 单元测试
npm test

# E2E测试
npm run test:e2e

# 测试覆盖率
npm test -- --coverage
```

### 数据库迁移

由于项目使用 TypeORM 的 `synchronize: true` 模式（开发环境），启动服务时会自动创建和同步数据库结构。

生产环境需确保：

- `DB_SYNCHRONIZE=false`（禁止自动同步）
- 使用正式的数据库迁移文件管理 schema 变更

### Redis 缓存配置

在 `.env` 文件中添加以下 Redis 配置项：

```bash
# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=              # Redis 密码（可选）
REDIS_DB=0                  # Redis 数据库编号
REDIS_TTL=300               # 缓存过期时间（秒，默认 5 分钟）
REDIS_KEY_PREFIX=sp:        # ServiceProvider 缓存键前缀
```

### 数据库迁移

由于项目使用 TypeORM 的 `synchronize: true` 模式（开发环境），启动服务时会自动创建和同步数据库结构。

生产环境需确保：

- `DB_SYNCHRONIZE=false`（生产环境禁止自动同步）
- 使用正式的数据库迁移文件管理 schema 变更

## 🚀 部署

详细的部署说明请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)。

### 构建项目

```bash
npm run build
```

### 环境变量

生产环境务必设置正确的环境变量，特别注意：

- `NODE_ENV=production`
- `DB_SYNCHRONIZE=false`（生产环境禁止自动同步）
- `JWT_SECRET` 使用强密码
- 数据库连接使用高权限账号

### Docker部署（推荐）

```bash
# 构建镜像
docker build -t yinhang-backend .

# 运行容器
docker run -d -p 3000:3000 \
  --env-file .env \
  yinhang-backend
```

## 📊 项目数据

- **代码行数**: ~10,000+ 行
- **源文件数**: 105 个
- **模块数**: 11 个核心模块
- **API端点**: 50+ 个
- **实体数**: 15+ 个数据表

## 🤝 贡献指南

欢迎贡献代码、报告bug或提出新功能建议！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📝 许可证

本项目采用专有许可证。

## 👥 联系方式

如有问题或建议，请通过以下方式联系：

- 项目Issue: [GitHub Issues](https://github.com/yourusername/yinhang-backend/issues)
- 邮箱: your-email@example.com

## 🙏 致谢

- [NestJS](https://nestjs.com/) - 优秀的Node.js企业级框架
- [TypeORM](https://typeorm.io/) - 强大的ORM工具
- 所有贡献者

---

<div align="center">

Made with ❤️ by [Your Team Name]

</div>
