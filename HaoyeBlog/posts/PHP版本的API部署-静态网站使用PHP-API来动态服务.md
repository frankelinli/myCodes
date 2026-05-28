# 部署文档 — dou-docs + GICS API

> 最后更新：2025-05-25  
> 服务器：`111.230.81.144`（腾讯云 Lighthouse，CentOS 7）

---

## 一、整体架构

```
本地 Windows (VS Code / PowerShell)
        │
        │  npm run ship（build + git push）
        ▼
服务器 /var/repo/docusaTest.git (bare repo)
        │  post-receive hook
        ▼
/www/wwwroot/docusaTest/    ← Docusaurus 静态文件 + gics-api.php
        │  Nginx（port 99）+ PHP-FPM（PHP 8.1）
        ▼
用户浏览器
        │  fetch http://111.230.81.144:99/gics-api.php
        ▼
/www/gics-api/.env.local    ← DeepSeek API Key
        │  curl → api.deepseek.com
        ▼
DeepSeek AI（返回 GICS 分类 JSON）
```

---

## 二、服务器端配置（已完成，勿重复操作）

### 2.1 环境

| 项目 | 值 |
|---|---|
| OS | CentOS 7 (glibc 2.17) |
| PHP | **8.1**（宝塔面板安装，PHP-FPM） |
| Nginx | 宝塔自带 |
| Node.js / PM2 | **已移除**，不再使用 |

### 2.2 目录结构

```
/www/wwwroot/docusaTest/
    gics-api.php            GICS API（PHP，随静态站一起部署）
    .user.ini               PHP open_basedir 配置（chattr +i 锁定）
    ...（Docusaurus 静态文件）

/www/gics-api/
    .env.local              DeepSeek API Key（不进 Git，勿删除）

/var/repo/docusaTest.git/   Git bare repo，post-receive 自动同步静态文件
```

### 2.3 `.env.local` 内容（`/www/gics-api/.env.local`）

```
DEEPSEEK_API_KEY=sk-d286c5d780284082b6b808ed82ad0c0e
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```

> ⚠️ 此文件不进 Git，不要删除，PHP API 从这里读取密钥。

### 2.4 PHP open_basedir（`/www/wwwroot/docusaTest/.user.ini`）

```ini
open_basedir=/www/wwwroot/docusaTest/:/tmp/:/www/gics-api/
```

> 该文件已设置 `chattr +i` 不可变属性，修改前需：`chattr -i /www/wwwroot/docusaTest/.user.ini`

### 2.5 Git bare repo + post-receive hook

`/var/repo/docusaTest.git/hooks/post-receive` 内容（大意）：

```bash
#!/bin/bash
GIT_WORK_TREE=/www/wwwroot/docusaTest git checkout -f main
```

本地 `.deploy-git` 对应这个 remote：

```bash
git --git-dir=.deploy-git remote get-url origin
# => root@111.230.81.144:/var/repo/docusaTest.git
```

### 2.6 Nginx 配置

文件：`/www/server/panel/vhost/nginx/111.230.81.144.conf`

- 监听 port **99**，serve `/www/wwwroot/docusaTest`
- PHP 文件交给 PHP-FPM 处理（宝塔默认配置）
- Docusaurus SPA 路由支持 `try_files $uri $uri/ /index.html`

### 2.7 腾讯云防火墙

已开放：
- TCP **99** — Docusaurus 静态站 + GICS API

---

## 三、本地开发与部署流程

### 3.1 日常开发

```bash
# 启动本地开发服务器（热更新）
npm run start

# 仅构建，不发布
npm run build
```

### 3.2 发布静态站 + PHP API 到服务器

```bash
npm run ship
# 等价于：npm run build && npm run upload
# upload = git push 到 /var/repo/docusaTest.git
# post-receive hook 自动更新 /www/wwwroot/docusaTest（含 gics-api.php）
```

访问：`http://111.230.81.144:99`

> `gics-api.php` 位于 `scripts/gics-api.php`，通过 post-receive hook 随静态站一起部署。

### 3.3 更新 DeepSeek API Key

```powershell
C:\windows\System32\OpenSSH\ssh.exe -i "$env:USERPROFILE\.ssh\id_rsa" root@111.230.81.144
# 然后：
vi /www/gics-api/.env.local
# 修改 DEEPSEEK_API_KEY=...
# 保存即生效（PHP 每次请求重新读取，无需重启）
```

---

## 四、功能使用说明

### GICS Checker 页面

访问：`http://111.230.81.144:99/gics-checker`

1. 在文本框输入企业主营业务描述（中英文均可）
2. 点击「分析」按钮
3. 等待约 2–5 秒，DeepSeek 返回 4 级 GICS 分类：
   - Sector（行业板块）
   - Industry Group（行业组）
   - Industry（行业）
   - Sub-Industry（子行业）
4. 结果包含置信度、判断理由、追问问题、备选分类

**API 端点**：

```
POST http://111.230.81.144:99/gics-api.php
Content-Type: application/json

{"query": "企业描述文字"}
```

**健康检查**：

```
GET http://111.230.81.144:99/gics-api.php
```

---

## 五、运维操作速查

### 检查 PHP API 状态

```powershell
Invoke-RestMethod -Uri "http://111.230.81.144:99/gics-api.php"
```

### API 手动测试（PowerShell）

```powershell
$body = '{"query":"化妆品工厂，做护肤品和彩妆"}'
Invoke-RestMethod -Uri "http://111.230.81.144:99/gics-api.php" `
  -Method POST -ContentType "application/json" -Body $body
```

> ⚠️ 禁止在 PowerShell 的 SSH 命令字符串里内嵌 JSON（双引号会被 PowerShell 提前消费）。

### 查看 PHP 错误日志

```powershell
C:\windows\System32\OpenSSH\ssh.exe -o RequestTTY=no -i "$env:USERPROFILE\.ssh\id_rsa" root@111.230.81.144 "tail -50 /www/wwwlogs/111.230.81.144.error.log"
```

---

## 六、已知注意事项

| 事项 | 说明 |
|---|---|
| PHP 无需重启 | 修改 `.env.local` 或 `gics-api.php` 后即刻生效，无 PM2/进程管理 |
| API Key 安全 | `.env.local` 不进 Git，勿将 Key 硬编码到前端代码或公开仓库 |
| 前端 API 地址 | `src/pages/gics-checker.tsx` 第 81 行，换服务器须修改并重新 `npm run ship` |
| DeepSeek 响应 JSON 格式 | 模型偶尔返回 Markdown 代码块，`extract_json()` 已处理 |
| DeepSeek 模型名 | `.env.local` 中 `DEEPSEEK_MODEL=deepseek-chat` |
| open_basedir | PHP 只能读取 `/www/wwwroot/docusaTest/`、`/tmp/`、`/www/gics-api/`，修改需 `chattr -i` |
| 端口 99 无 API 鉴权 | PHP API 完全公开，如需保护可加 IP 白名单 |