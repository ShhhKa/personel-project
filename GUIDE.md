# 个人记忆库 v3 搭建指南

## 前置要求

- Node.js 18+（[nodejs.org](https://nodejs.org)）
- Cloudflare 账号（[dash.cloudflare.com](https://dash.cloudflare.com) 免费注册）
- claude.ai Pro/Max 订阅

---

## 搭建步骤

### 1. 解压并安装依赖

```bash
cd memory-hub-v3
npm install
```

### 2. 登录 Cloudflare

```bash
npx wrangler login
```

### 3. 创建数据库

```bash
npx wrangler d1 create memory-hub-db
```

输出中的 `database_id` 复制到 `wrangler.toml` 替换 `"在这里填入你的数据库ID"`。

### 4. 初始化表结构

```bash
npm run db:init
```

### 5. 部署

```bash
npm run deploy
```

记下输出的 URL，如 `https://memory-hub.xxx.workers.dev`。

- 浏览器打开该 URL → 前端页面
- MCP 端点 → `https://memory-hub.xxx.workers.dev/mcp`

### 6. 连接 Claude

claude.ai → Settings → Connectors → Add custom connector → 填入 MCP URL → Add

### 7. 新对话中启用

输入框左边 "+" → Connectors → 开启记忆库

---

## 安全（可选）

编辑 `wrangler.toml` 取消 AUTH_TOKEN 注释并设密码，重新 `npm run deploy`。

Claude 连接器 URL 改为：`https://xxx.workers.dev/mcp?token=你的密码`

---

## 搭好后的第一件事

在前端页面或通过 Claude 往 core 层写入初始记忆：

**1. 各层使用规范**
```
core: 永久信息（偏好、规则、身份）
daily: 临时信息（5天过期，对话摘要、近期事件）
diary: 每天一篇日记（带心情标签）
```

**2. 收工流程规则**
```
当用户说"收工/晚安/今天结束"时：
①read(type=todo,status=pending) 检查今日待办
②write(type=memory,layer=daily) 写今日总结
③write(type=memory,layer=diary,mood=...) 写日记
④delete(type=memory,layer=daily,days=5) 清理过期
```

**3. 你的基本偏好**
```
语言、风格、常用分类等
```

---

## 使用示例

```
"读一下深层记忆"
"这周有什么待办？"
"添加日程：下周三14:00在会议室开会，分类工作"
"添加循环规则：每周一三五早上9点站会"
"把那个开会日程推迟到周四"
"给背单词打个卡"
"写一篇今天的日记，心情开心"
"收工"
"导出所有数据"
```

---

## 常见问题

| 问题 | 解决 |
|------|------|
| 部署报错 Durable Objects | 确保 Cloudflare 邮箱已验证 |
| 前端打不开 | 访问根路径 `/`，不是 `/mcp` |
| 循环日程没生成 | Cron 每天 03:00 UTC 执行，新规则次日生效。也可手动让 Claude 调 read(type=rule) 确认规则存在 |
| 想改 daily 过期天数 | `src/index.ts` 搜索 `-5 days` 修改，重新部署 |
| 多设备共享 | 同一 URL 可添加到多个 Claude 账号 |
| 数据导出 | 浏览器访问 `/api/export` 或让 Claude 帮你导出 |
| 免费额度够吗 | Workers 10万次/天，D1 5GB+500万读/天，个人使用绰绰有余 |
