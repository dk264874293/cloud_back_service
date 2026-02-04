# 云上网点平台后端 - API快速参考

本文档提供云上网点平台后端所有API端点的快速参考。

## 📋 目录

- [通用说明](#通用说明)
- [认证模块](#认证模块-auth)
- [用户模块](#用户模块-user)
- [订单模块](#订单模块-order)
- [支付模块](#支付模块-payment)
- [文件模块](#文件模块-file)
- [分佣模块](#分佣模块-commission)
- [银行模块](#银行模块-bank)
- [提现模块](#提现模块-withdrawal)
- [邀请模块](#邀请模块-invitation)
- [反馈模块](#反馈模块-feedback)
- [运营管理模块](#运营管理模块-admin)

## 📝 通用说明

### 基础URL

```
开发环境: http://localhost:3000
生产环境: https://api.your-domain.com
```

### 认证方式

除公开接口外，所有接口需要在请求头中携带JWT Token：

```
Authorization: Bearer <access_token>
```

### 响应格式

#### 成功响应

```json
{
  "code": 0,
  "message": "success",
  "data": {
    // 响应数据
  }
}
```

#### 错误响应

```json
{
  "statusCode": 400,
  "message": "错误信息",
  "error": "Bad Request"
}
```

### 分页参数

| 参数  | 类型   | 必填 | 默认值 | 说明                |
| ----- | ------ | ---- | ------ | ------------------- |
| page  | number | 否   | 1      | 页码                |
| limit | number | 否   | 20     | 每页数量（最大100） |

### 分页响应

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [],
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

---

## 🔐 认证模块 (auth)

### POST /api/auth/register

**描述**: 用户注册

**权限**: 公开

**请求体**:

```json
{
  "phone": "13800138000",
  "password": "password123",
  "verification_code": "123456",
  "invitation_code": "ABC123"
}
```

**响应**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "phone": "13800138000",
      "role": "USER"
    }
  }
}
```

### POST /api/auth/login

**描述**: 用户登录

**权限**: 公开

**请求体**:

```json
{
  "phone": "13800138000",
  "password": "password123"
}
```

**响应**: 同注册

### POST /api/auth/refresh

**描述**: 刷新令牌

**权限**: 公开

**请求体**:

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**响应**: 同注册

### POST /api/auth/logout

**描述**: 用户登出

**权限**: 需认证

**请求头**: `Authorization: Bearer <access_token>`

**响应**:

```json
{
  "code": 0,
  "message": "登出成功"
}
```

---

## 👤 用户模块 (user)

### GET /api/user/profile

**描述**: 获取个人信息

**权限**: 需认证

**响应**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "phone": "13800138000",
    "nickname": "张三",
    "avatar": "https://example.com/avatar.jpg",
    "role": "USER",
    "is_verified": true,
    "created_at": "2026-02-03T10:00:00.000Z"
  }
}
```

### PUT /api/user/profile

**描述**: 更新个人信息

**权限**: 需认证

**请求体**:

```json
{
  "nickname": "李四",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

### POST /api/user/switch-role

**描述**: 切换角色

**权限**: 需认证

**请求体**:

```json
{
  "role": "PROVIDER"
}
```

**响应**:

```json
{
  "code": 0,
  "message": "角色切换成功",
  "data": {
    "role": "PROVIDER",
    "provider_permissions": ["ACCOUNT_MANAGER", "INTERVIEWER"]
  }
}
```

### POST /api/user/verify

**描述**: 提交认证材料

**权限**: 需认证

**请求体**:

```json
{
  "role": "PROVIDER",
  "name": "张三",
  "id_card": "110101199001011234",
  "documents": [
    "https://oss.example.com/doc1.jpg",
    "https://oss.example.com/doc2.jpg"
  ]
}
```

### GET /api/user/commissions

**描述**: 获取佣金列表

**权限**: 需认证

**查询参数**: `page`, `limit`, `status`

**响应**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "order_no": "CO2026020300001",
        "order_type": "CONNECTION",
        "commission_type": "ACCOUNT_MANAGER",
        "amount": 1000,
        "status": "PAID",
        "paid_at": "2026-02-03T15:00:00.000Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

## 📦 订单模块 (order)

### 对接订单 (Connection Order)

#### POST /api/order/connection

**描述**: 创建对接订单（发布需求）

**权限**: USER

**请求体**:

```json
{
  "user_type": "INDIVIDUAL",
  "need_type": "LOAN",
  "location": "北京市朝阳区",
  "amount": 1000000,
  "repayment_ability": "月收入3万元，有稳定工作"
}
```

**响应**:

```json
{
  "code": 0,
  "message": "需求发布成功",
  "data": {
    "id": 123,
    "order_no": "CO2026020300001",
    "status": "PENDING_ASSIGN",
    "user_type": "INDIVIDUAL",
    "need_type": "LOAN",
    "amount": 1000000,
    "location": "北京市朝阳区",
    "created_at": "2026-02-03T10:00:00.000Z"
  }
}
```

#### GET /api/order/connection

**描述**: 获取对接订单列表

**权限**: 需认证

**查询参数**: `status`, `page`, `limit`

**响应**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 123,
        "order_no": "CO2026020300001",
        "status": "IN_REVIEW",
        "user_type": "INDIVIDUAL",
        "need_type": "LOAN",
        "amount": 1000000,
        "created_at": "2026-02-03T10:00:00.000Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

#### GET /api/order/connection/:id

**描述**: 获取对接订单详情

**权限**: 需认证

**注意**: 银行端查看时自动脱敏敏感信息

**响应**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 123,
    "order_no": "CO2026020300001",
    "user": {
      "id": 1,
      "phone": "138****1234",
      "nickname": "张三"
    },
    "status": "IN_REVIEW",
    "account_manager": {
      "id": 2,
      "name": "李经理"
    },
    "report_url": "https://oss.example.com/report.pdf",
    "price": 5000,
    "created_at": "2026-02-03T10:00:00.000Z"
  }
}
```

#### PUT /api/order/connection/:id/assign-manager

**描述**: 指定管户人

**权限**: ADMIN

**请求体**:

```json
{
  "manager_id": 2
}
```

#### PUT /api/order/connection/:id/accept-interview

**描述**: 接受访谈任务

**权限**: PROVIDER (有访谈权限)

**响应**:

```json
{
  "code": 0,
  "message": "访谈任务已接受",
  "data": {
    "id": 123,
    "interviewer_id": 3,
    "status": "IN_REVIEW"
  }
}
```

#### PUT /api/order/connection/:id/upload-report

**描述**: 上传客户需求报告

**权限**: PROVIDER (管户人或访谈人)

**请求体**:

```json
{
  "report_url": "https://oss.example.com/report.pdf"
}
```

#### PUT /api/order/connection/:id/set-price

**描述**: 设置订单价格

**权限**: ADMIN

**请求体**:

```json
{
  "price": 5000,
  "assigned_banks": [1, 2, 3]
}
```

#### PUT /api/order/connection/:id/list

**描述**: 订单上架银行端

**权限**: ADMIN

**响应**:

```json
{
  "code": 0,
  "message": "订单已上架",
  "data": {
    "id": 123,
    "status": "WAITING_PURCHASE"
  }
}
```

#### GET /api/order/bank/pool

**描述**: 银行端查看派单池

**权限**: BANK

**查询参数**: `page`, `limit`, `need_type`

**响应**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 123,
        "order_no": "CO2026020300001",
        "user_type": "INDIVIDUAL",
        "need_type": "LOAN",
        "amount": 1000000,
        "location": "北京市",
        "price": 5000,
        "is_purchased": false
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

**注意**: 返回数据已脱敏，不包含用户联系方式等敏感信息。

#### POST /api/order/connection/:id/purchase

**描述**: 银行购买订单

**权限**: BANK

**响应**:

```json
{
  "code": 0,
  "message": "订单购买成功",
  "data": {
    "payment_no": "PAY2026020300001",
    "payment_params": {
      // 微信支付参数
      "appId": "wx1234567890",
      "timeStamp": "1234567890",
      "nonceStr": "abc123",
      "package": "prepay_id=wx1234567890",
      "signType": "RSA",
      "paySign": "abc123..."
    }
  }
}
```

#### PUT /api/order/connection/:id/confirm-meeting

**描述**: 管户人发起现场确认

**权限**: PROVIDER (管户人)

**请求体**:

```json
{
  "note": "已与客户和银行经理线下确认"
}
```

#### PUT /api/order/connection/:id/bank-confirm

**描述**: 银行确认现场（费用不可退）

**权限**: BANK

**响应**:

```json
{
  "code": 0,
  "message": "现场已确认",
  "data": {
    "id": 123,
    "is_confirmed": true,
    "confirmed_at": "2026-02-03T15:00:00.000Z"
  }
}
```

#### PUT /api/order/connection/:id/select-bank

**描述**: 用户选择合作银行

**权限**: USER

**请求体**:

```json
{
  "bank_id": 2
}
```

### 委托订单 (Entrustment Order)

#### POST /api/order/entrustment

**描述**: 发起委托订单

**权限**: USER

**请求体**:

```json
{
  "connection_order_id": 123
}
```

**响应**:

```json
{
  "code": 0,
  "message": "委托订单已创建",
  "data": {
    "id": 456,
    "order_no": "EO2026020300001",
    "connection_order_id": 123,
    "status": "PENDING_REVIEW"
  }
}
```

#### PUT /api/order/entrustment/:id/upload-agreement

**描述**: 上传委托协议

**权限**: PROVIDER (管户人)

**请求体**:

```json
{
  "agreement_url": "https://oss.example.com/agreement.pdf"
}
```

#### PUT /api/order/entrustment/:id/approve

**描述**: 审核委托订单

**权限**: ADMIN

**请求体**:

```json
{
  "approved": true,
  "note": "材料完整，审核通过"
}
```

**响应**:

```json
{
  "code": 0,
  "message": "审核通过",
  "data": {
    "id": 456,
    "status": "APPROVED"
  }
}
```

#### PUT /api/order/entrustment/:id/accept-handler

**描述**: 业务受理人接受任务

**权限**: PROVIDER (业务受理权限)

**响应**:

```json
{
  "code": 0,
  "message": "任务已接受",
  "data": {
    "id": 456,
    "handler_id": 5,
    "status": "PROCESSING"
  }
}
```

#### PUT /api/order/entrustment/:id/complete

**描述**: 完成委托订单

**权限**: PROVIDER (业务受理人)

**请求体**:

```json
{
  "completion_note": "银行审批已通过，手续办理完成",
  "bank_result": "APPROVED"
}
```

---

## 💳 支付模块 (payment)

### POST /api/payment/create

**描述**: 创建支付订单

**权限**: 需认证

**请求体**:

```json
{
  "order_type": "CONNECTION",
  "order_id": 123,
  "payment_type": "JSAPI"
}
```

**响应**:

```json
{
  "code": 0,
  "message": "支付订单已创建",
  "data": {
    "payment_no": "PAY2026020300001",
    "amount": 5000,
    "payment_params": {
      // 微信支付参数
      "appId": "wx1234567890",
      "timeStamp": "1234567890",
      "nonceStr": "abc123",
      "package": "prepay_id=wx1234567890",
      "signType": "RSA",
      "paySign": "abc123..."
    }
  }
}
```

### POST /api/payment/callback/wechat

**描述**: 微信支付回调

**权限**: 公开

**请求体**: 微信支付回调数据

**响应**:

```json
{
  "code": "SUCCESS",
  "message": "成功"
}
```

### GET /api/payment/:id/status

**描述**: 查询支付状态

**权限**: 需认证

**响应**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "payment_no": "PAY2026020300001",
    "order_no": "CO2026020300001",
    "amount": 5000,
    "status": "PAID",
    "paid_at": "2026-02-03T15:00:00.000Z"
  }
}
```

### POST /api/payment/refund

**描述**: 申请退款

**权限**: ADMIN

**请求体**:

```json
{
  "payment_id": 1,
  "reason": "订单取消"
}
```

---

## 📁 文件模块 (file)

### POST /api/file/upload

**描述**: 上传文件

**权限**: 需认证

**Content-Type**: `multipart/form-data`

**请求参数**:

| 参数 | 类型   | 必填 | 说明                           |
| ---- | ------ | ---- | ------------------------------ |
| file | File   | 是   | 文件（最大10MB）               |
| type | string | 否   | 文件类型（report/agreement等） |

**响应**:

```json
{
  "code": 0,
  "message": "上传成功",
  "data": {
    "id": 1,
    "filename": "report.pdf",
    "url": "https://oss.example.com/files/uuid/report.pdf",
    "size": 1024000,
    "mimetype": "application/pdf",
    "created_at": "2026-02-03T10:00:00.000Z"
  }
}
```

### DELETE /api/file/:id

**描述**: 删除文件

**权限**: 需认证（仅文件上传者或管理员）

**响应**:

```json
{
  "code": 0,
  "message": "删除成功"
}
```

---

## 💰 分佣模块 (commission)

### GET /api/commission/rules

**描述**: 获取分佣规则列表

**权限**: ADMIN

**查询参数**: `province`, `is_active`

**响应**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "province": null,
        "platform_rate": 0.3,
        "developer_rate": 0.05,
        "account_manager_rate": 0.2,
        "interviewer_rate": 0.2,
        "handler_rate": 0.2,
        "is_active": true
      }
    ],
    "total": 10
  }
}
```

### POST /api/commission/rules

**描述**: 创建分佣规则

**权限**: ADMIN

**请求体**:

```json
{
  "province": "北京市",
  "platform_rate": 0.3,
  "developer_rate": 0.05,
  "account_manager_rate": 0.2,
  "interviewer_rate": 0.2,
  "handler_rate": 0.2
}
```

### PUT /api/commission/rules/:id

**描述**: 更新分佣规则

**权限**: ADMIN

### GET /api/commission/records

**描述**: 获取分佣记录

**权限**: ADMIN 或 用户本人

**查询参数**: `order_no`, `recipient_id`, `status`, `page`, `limit`

**响应**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "order_no": "CO2026020300001",
        "order_amount": 5000,
        "commission_type": "ACCOUNT_MANAGER",
        "recipient": {
          "id": 2,
          "nickname": "李经理"
        },
        "amount": 1000,
        "rate": 0.2,
        "status": "PAID",
        "paid_at": "2026-02-03T15:00:00.000Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

## 🏦 银行模块 (bank)

### GET /api/bank/list

**描述**: 获取银行列表

**权限**: 需认证

**响应**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "中国工商银行",
        "code": "ICBC",
        "created_at": "2026-02-01T10:00:00.000Z"
      }
    ]
  }
}
```

### GET /api/bank/:id/branches

**描述**: 获取银行分行列表

**权限**: 需认证

**响应**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "bank_id": 1,
        "name": "中国工商银行北京分行",
        "province": "北京市",
        "city": "北京市",
        "address": "北京市朝阳区XX路XX号"
      }
    ]
  }
}
```

---

## 💸 提现模块 (withdrawal)

### POST /api/withdrawal/create

**描述**: 创建提现申请

**权限**: 需认证

**请求体**:

```json
{
  "amount": 1000,
  "account_type": "BANK_CARD",
  "account_info": {
    "bank_name": "中国工商银行",
    "account_holder": "张三",
    "account_number": "6222021234567890"
  }
}
```

**响应**:

```json
{
  "code": 0,
  "message": "提现申请已提交",
  "data": {
    "id": 1,
    "withdrawal_no": "WD2026020300001",
    "amount": 1000,
    "status": "PENDING",
    "created_at": "2026-02-03T10:00:00.000Z"
  }
}
```

### GET /api/withdrawal/list

**描述**: 获取提现记录列表

**权限**: 需认证

**查询参数**: `status`, `page`, `limit`

### PUT /api/withdrawal/:id/approve

**描述**: 审核提现申请

**权限**: ADMIN

**请求体**:

```json
{
  "approved": true,
  "note": "审核通过"
}
```

---

## 🎁 邀请模块 (invitation)

### GET /api/invitation/code

**描述**: 获取邀请码

**权限**: 需认证

**响应**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "invitation_code": "ABC123456",
    "commission_total": 5000,
    "invitee_count": 10
  }
}
```

### POST /api/invitation/accept

**描述**: 接受邀请

**权限**: 需认证

**请求体**:

```json
{
  "invitation_code": "ABC123456"
}
```

**响应**:

```json
{
  "code": 0,
  "message": "邀请已接受",
  "data": {
    "id": 2,
    "inviter": {
      "id": 1,
      "nickname": "张三"
    }
  }
}
```

### GET /api/invitation/records

**描述**: 获取邀请记录

**权限**: 需认证

**响应**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "invitee": {
          "id": 2,
          "nickname": "李四",
          "phone": "139****1234"
        },
        "status": "ACCEPTED",
        "commission_amount": 500,
        "created_at": "2026-02-03T10:00:00.000Z"
      }
    ],
    "total": 10
  }
}
```

---

## 💬 反馈模块 (feedback)

### POST /api/feedback/create

**描述**: 提交反馈

**权限**: 需认证

**请求体**:

```json
{
  "content": "系统运行流畅，建议增加夜间模式",
  "images": ["https://oss.example.com/screenshot1.jpg"]
}
```

**响应**:

```json
{
  "code": 0,
  "message": "反馈已提交",
  "data": {
    "id": 1,
    "status": "PENDING",
    "created_at": "2026-02-03T10:00:00.000Z"
  }
}
```

### GET /api/feedback/list

**描述**: 获取反馈列表

**权限**: 需认证（用户看自己的，管理员看全部）

**查询参数**: `status`, `page`, `limit`

### PUT /api/feedback/:id/reply

**描述**: 回复反馈

**权限**: ADMIN

**请求体**:

```json
{
  "reply": "感谢您的建议，我们会考虑增加夜间模式"
}
```

---

## 📊 运营管理模块 (admin)

### 客户管理

#### GET /api/admin/customers

**描述**: 获取客户列表

**权限**: ADMIN

**查询参数**: `phone`, `role`, `is_verified`, `page`, `limit`

**响应**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "phone": "13800138000",
        "nickname": "张三",
        "role": "USER",
        "is_verified": true,
        "created_at": "2026-02-01T10:00:00.000Z",
        "order_count": 10,
        "total_spent": 50000
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

#### GET /api/admin/customers/:id

**描述**: 获取客户详情

**权限**: ADMIN

### 服务商管理

#### GET /api/admin/service-providers

**描述**: 获取服务商列表

**权限**: ADMIN

**查询参数**: `type`, `status`, `page`, `limit`

**响应**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "北京XX金融服务有限公司",
        "type": "SERVICE_PROVIDER",
        "region": "北京市",
        "contact_person": "王经理",
        "contact_phone": "13900139000",
        "status": "ACTIVE",
        "member_count": 5,
        "order_count": 100
      }
    ],
    "total": 50
  }
}
```

#### POST /api/admin/service-providers

**描述**: 创建服务商

**权限**: ADMIN

**请求体**:

```json
{
  "name": "北京XX金融服务有限公司",
  "type": "SERVICE_PROVIDER",
  "region": "北京市",
  "contact_person": "王经理",
  "contact_phone": "13900139000"
}
```

#### PUT /api/admin/service-providers/:id

**描述**: 更新服务商信息

**权限**: ADMIN

#### PUT /api/admin/service-providers/:id/status

**描述**: 更新服务商状态

**权限**: ADMIN

**请求体**:

```json
{
  "status": "SUSPENDED",
  "reason": "违反平台规定"
}
```

### 订单管理

#### GET /api/admin/orders

**描述**: 获取所有订单列表

**权限**: ADMIN

**查询参数**: `order_type`, `status`, `page`, `limit`

**响应**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 123,
        "order_no": "CO2026020300001",
        "order_type": "CONNECTION",
        "status": "IN_REVIEW",
        "user": {
          "id": 1,
          "phone": "138****1234",
          "nickname": "张三"
        },
        "amount": 1000000,
        "price": 5000,
        "created_at": "2026-02-03T10:00:00.000Z"
      }
    ],
    "total": 200
  }
}
```

#### GET /api/admin/orders/:id

**描述**: 获取订单详情

**权限**: ADMIN

### 财务管理

#### GET /api/admin/withdrawals

**描述**: 获取提现申请列表

**权限**: ADMIN

**查询参数**: `status`, `page`, `limit`

**响应**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "withdrawal_no": "WD2026020300001",
        "user": {
          "id": 1,
          "nickname": "张三",
          "phone": "138****1234"
        },
        "amount": 1000,
        "account_type": "BANK_CARD",
        "account_info": {
          "bank_name": "中国工商银行",
          "account_number": "622202****7890"
        },
        "status": "PENDING",
        "created_at": "2026-02-03T10:00:00.000Z"
      }
    ],
    "total": 30
  }
}
```

#### GET /api/admin/transactions

**描述**: 获取交易流水

**权限**: ADMIN

**查询参数**: `type`, `start_date`, `end_date`, `page`, `limit`

### 数据统计

#### GET /api/admin/statistics

**描述**: 获取平台统计数据

**权限**: ADMIN

**查询参数**: `date_range` (today/week/month/year)

**响应**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "overview": {
      "total_users": 1000,
      "total_orders": 500,
      "total_amount": 5000000,
      "total_commission": 1500000
    },
    "orders": {
      "pending": 50,
      "in_review": 30,
      "waiting_purchase": 20,
      "in_offline": 15,
      "confirmed": 100,
      "cancelled": 10
    },
    "revenue": {
      "today": 10000,
      "week": 70000,
      "month": 300000
    }
  }
}
```

---

## 📝 状态码说明

### HTTP状态码

| 状态码 | 说明         |
| ------ | ------------ |
| 200    | 请求成功     |
| 201    | 创建成功     |
| 400    | 请求参数错误 |
| 401    | 未认证       |
| 403    | 无权限       |
| 404    | 资源不存在   |
| 409    | 资源冲突     |
| 500    | 服务器错误   |

### 业务错误码

| code | message      | 说明                 |
| ---- | ------------ | -------------------- |
| 0    | success      | 成功                 |
| 1001 | 用户已存在   | 注册时手机号已注册   |
| 1002 | 用户不存在   | 登录时用户不存在     |
| 1003 | 密码错误     | 登录时密码错误       |
| 2001 | 订单不存在   | 订单ID无效           |
| 2002 | 订单状态错误 | 订单状态不允许此操作 |
| 3001 | 支付失败     | 支付处理失败         |
| 4001 | 分佣失败     | 分佣计算失败         |

---

## 🔗 相关链接

- **完整Swagger文档**: http://localhost:3000/api/docs
- **NestJS文档**: https://docs.nestjs.com
- **项目GitHub**: https://github.com/yourusername/yinhang-backend

---

**文档版本**: v1.0
**创建日期**: 2026-02-03
**最后更新**: 2026-02-03
