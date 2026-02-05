---
id: 1155
title: SFTP_全面介绍和配置说明
slug: SFTP_全面介绍和配置说明
categories:
  - notes
tags: []
---

## 什么是 SFTP？

**SFTP (SSH File Transfer Protocol)** 是一种基于 SSH 的文件传输协议，用于在本地计算机和远程服务器之间安全地传输文件。

相比 FTP：

- ✅ **更安全** - 加密传输，防止密码被截获
- ✅ **更稳定** - 基于 SSH，连接更可靠
- ✅ **权限管理** - 支持复杂的权限控制
- ✅ **自动同步** - VS Code 可自动上传/下载

---

## 一、基础连接配置

### 1.1 必需参数

```json
{
  "protocol": "sftp",              // 协议类型：sftp 或 ftp
  "host": "example.com",           // 服务器地址（IP 或域名）
  "port": 22,                      // SFTP 端口（SSH 默认端口）
  "username": "webuser",           // SSH 登录用户名
  "password": "your_password"      // 密码（不推荐）或
}
```

**解释：**

- `protocol` - 选择 "sftp" 使用 SSH 加密连接
- `host` - 你的服务器域名或 IP 地址
- `port` - 通常 SFTP 用 22 端口（SSH 端口）
- `username` - 在服务器上的用户账户
- `password` - 明文密码（安全性低）

**示例：**

```json
{
  "protocol": "sftp",
  "host": "123.45.67.89",          // 阿里云/腾讯云等服务器 IP
  "port": 22,
  "username": "ubuntu",
  "password": "your_secure_password"
}
```

### 1.2 使用密钥登录（推荐）

```json
{
  "protocol": "sftp",
  "host": "example.com",
  "port": 22,
  "username": "webuser",
  "privateKeyPath": "~/.ssh/id_rsa",  // 本地私钥路径
  "passphrase": ""                    // 私钥密码（如果有的话）
}
```

**解释：**

- `privateKeyPath` - 本地 SSH 私钥文件位置
  - Windows: `C:\Users\你的用户名\.ssh\id_rsa`
  - Mac/Linux: `~/.ssh/id_rsa`
- `passphrase` - 私钥的密码（可选，有些私钥没有密码）

**优势：**

- 不暴露密码在配置文件中
- 更安全的身份验证方式
- 自动化部署时必需

**如何生成 SSH 密钥？**

```bash
# 在本地命令行执行
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa

# 然后上传公钥到服务器
ssh-copy-id -i ~/.ssh/id_rsa.pub user@host
```

---

## 二、路径配置

### 2.1 远程和本地路径

```json
{
  "remotePath": "/home/webuser/www/html",  // 服务器上的工作目录
  "localPath": "${workspaceFolder}",       // 本地工作目录
}
```

**解释：**

- `remotePath` - 在服务器上的目录
  - 示例：WordPress 站点根目录 `/var/www/wordpress`
  - 示例：云虚拟主机 `/home/user/public_html`
- `localPath` - 本地 VS Code 项目目录
  - `${workspaceFolder}` 会自动替换为当前项目根目录

**常见路径：**

| 主机类型   | remotePath 示例                     |
| ---------- | ----------------------------------- |
| 阿里云 ECS | `/home/ubuntu/www`                  |
| 腾讯云 CVM | `/home/lighthouse/www`              |
| 虚拟主机   | `/home/username/public_html`        |
| VPS        | `/var/www/html` 或 `/home/user/www` |
| 宝塔面板   | `/www/wwwroot/example.com`          |

**查找你的 remotePath：**

```bash
# SSH 连接后，查看当前目录
pwd

# 查看 Web 根目录
ls /var/www/html
# 或
ls ~/public_html
```

---

## 三、自动同步配置

### 3.1 上传配置

```json
{
  "uploadOnSave": true,            // 文件保存时自动上传到服务器
  "uploadExclude": [               // 上传时排除的文件
    ".git",
    ".gitignore",
    "node_modules",
    ".DS_Store",
    "*.log",
    ".env",
    "config.local.php"
  ]
}
```

**解释：**

- `uploadOnSave` - 开启后，你编辑代码并保存，文件会自动上传到服务器
  - 用途：快速测试网站改动，无需手动上传
  - 缺点：网络慢时可能卡顿
- `uploadExclude` - 列出不需要上传的文件/文件夹
  - `.git` - 版本控制文件（不需要上传）
  - `node_modules` - 依赖包（服务器已安装）
  - `.env` - 环保信息（不要上传）
  - `*.log` - 日志文件（自动生成）

### 3.2 下载配置

```json
{
  "downloadOnOpen": false,         // 打开文件时自动下载最新版本
  "syncDownloadDirTree": false     // 同步下载目录结构
}
```

**解释：**

- `downloadOnOpen` - 如果文件在服务器被修改，打开时自动下载最新版本
  - 场景：多人协作，需要同步最新版本
  - 通常关闭（false），避免不必要的下载
- `syncDownloadDirTree` - 自动创建远程的目录结构到本地
  - 通常关闭，除非需要完整同步项目结构

### 3.3 删除同步配置

```json
{
  "deleteRemote": true,            // 本地删除文件时，自动删除服务器的文件
  "confirmDelete": true            // 删除前需要确认（防止误删）
}
```

**解释：**

- `deleteRemote` - 开启后，你在本地删除文件，服务器的相应文件也会被删除
  - 场景：修改项目结构，需要同步删除
  - 危险：容易误删重要文件
  - 建议：`true` + `confirmDelete: true` 配合使用
- `confirmDelete` - 删除前弹窗确认
  - 保护措施，防止不小心删错

---

## 四、性能优化配置

### 4.1 并发上传

```json
{
  "concurrency": 4                 // 同时上传的文件数量
}
```

**解释：**

- 数值范围：1-10（越高越快，但占用更多网络带宽）
- 建议值：
  - 网络快：4-6
  - 网络一般：2-3
  - 网络慢或不稳定：1-2

**示例场景：**

```json
// 快速稳定网络
"concurrency": 6

// 不稳定网络
"concurrency": 1

// 折中方案
"concurrency": 3
```

### 4.2 超时配置

```json
{
  "timeout": 30,                   // 连接超时时间（秒）
  "connectTimeout": 30             // 建立连接超时
}
```

**解释：**

- 多少秒内未收到服务器响应，则认为连接超时
- 建议值：30-60 秒
- 网络差的情况下调大：60-120

---

## 五、文件过滤配置

### 5.1 忽略文件列表

```json
{
  "ignore": [
    ".git",                    // Git 版本控制
    ".gitignore",              // Git 配置
    "node_modules",            // NPM 依赖
    "vendor",                  // Composer 依赖（PHP）
    ".DS_Store",               // Mac 系统文件
    "Thumbs.db",               // Windows 系统文件
    "*.log",                   // 日志文件
    ".env",                    // 环境配置（含密码）
    ".env.local",
    "config.local.php",
    "wp-config.php",           // WordPress 配置
    "debug.log",
    "*.swp",                   // Vim 备份文件
    "*.swo",
    ".idea",                   // IDE 配置
    ".vscode",
    "*.psd",                   // 大的设计文件
    "*.zip",
    "*.rar"
  ]
}
```

**解释：**

- 这些文件/文件夹在上传时会被跳过
- 支持通配符 `*` 匹配
- 为什么忽略：
  - `.git` - 只在本地需要
  - `node_modules` - 很大，且服务器有 `npm install`
  - `.env` - 包含敏感信息（密码、API KEY）
  - `*.log` - 日志文件自动生成，不需要上传

### 5.2 使用单独的忽略文件

```json
{
  "ignoreFile": ".ftpignore"       // 从文件读取忽略列表
}
```

**`.ftpignore` 文件内容：**

```
.git
node_modules
vendor
.env
*.log
```

---

## 六、完整配置示例

### 示例 1：WordPress 博客站点

```json
{
  "name": "WordPress Blog",
  "protocol": "sftp",
  "host": "blog.example.com",
  "port": 22,
  "username": "wordpress_user",
  "privateKeyPath": "~/.ssh/id_rsa",
  "remotePath": "/var/www/wordpress",
  "localPath": "${workspaceFolder}",
  "uploadOnSave": true,
  "deleteRemote": true,
  "confirmDelete": true,
  "concurrency": 3,
  "timeout": 30,
  "ignore": [
    ".git",
    "node_modules",
    ".env",
    "wp-config.php",
    "*.log",
    ".DS_Store",
    "wp-content/uploads",           // WordPress 上传文件夹
    "wp-content/cache"              // 缓存文件夹
  ]
}
```

**说明：**

- 使用密钥认证（安全）
- 保存时自动上传（快速测试）
- 删除时需要确认（防止误删）
- 忽略上传的文件等

### 示例 2：生产环境服务器

```json
{
  "name": "Production Server",
  "protocol": "sftp",
  "host": "prod.server.com",
  "port": 2222,                    // 自定义 SSH 端口
  "username": "deploy_user",
  "privateKeyPath": "~/.ssh/deploy_key",
  "passphrase": "your_key_password",
  "remotePath": "/home/deploy/app",
  "localPath": "${workspaceFolder}",
  "uploadOnSave": false,           // 禁用自动上传（更谨慎）
  "deleteRemote": false,           // 禁用自动删除（保护数据）
  "confirmDelete": true,           // 如果删除，需要确认
  "concurrency": 1,                // 低并发（稳定性优先）
  "timeout": 60,                   // 更长超时
  "ignore": [
    ".git",
    ".gitignore",
    "node_modules",
    "vendor",
    ".env.local",
    ".env.*.local",
    "*.log",
    "node_modules"
  ]
}
```

**说明：**

- 关闭自动上传（手动确认后上传）
- 禁用自动删除（防止数据丢失）
- 低并发和长超时（生产环境稳定性）
- 自定义 SSH 端口（提高安全性）

### 示例 3：团队开发环境

```json
{
  "name": "Team Development",
  "protocol": "sftp",
  "host": "dev.company.com",
  "port": 22,
  "username": "dev_user",
  "privateKeyPath": "~/.ssh/company_rsa",
  "remotePath": "/www/development",
  "localPath": "${workspaceFolder}",
  "uploadOnSave": true,
  "downloadOnOpen": true,          // 打开文件时下载最新版本
  "deleteRemote": true,
  "confirmDelete": true,
  "concurrency": 2,
  "ignore": [
    ".git",
    ".gitignore",
    "node_modules",
    "vendor",
    ".env.local",
    ".env.*.local",
    "composer.lock",               // PHP 锁定文件（每个人的可能不同）
    ".vscode",
    ".idea",
    "*.log"
  ]
}
```

**说明：**

- 同时支持上传和下载（多人协作）
- 打开文件时下载最新版本
- 合理的并发和超时配置

---

## 七、配置文件位置和格式

### 7.1 配置文件创建

在 VS Code 项目中创建 `.vscode/sftp.json`：

```bash
# Windows / Mac / Linux 都适用
项目根目录/
├── .vscode/
│   └── sftp.json          ← 创建这个文件
├── src/
├── public/
└── ...
```

### 7.2 支持多个服务器配置

```json
[
  {
    "name": "Production Server",
    "protocol": "sftp",
    "host": "prod.example.com",
    "port": 22,
    "username": "prod_user",
    "privateKeyPath": "~/.ssh/prod_key",
    "remotePath": "/var/www/prod",
    "localPath": "${workspaceFolder}",
    "uploadOnSave": false,
    "concurrency": 1
  },
  {
    "name": "Development Server",
    "protocol": "sftp",
    "host": "dev.example.com",
    "port": 22,
    "username": "dev_user",
    "privateKeyPath": "~/.ssh/dev_key",
    "remotePath": "/var/www/dev",
    "localPath": "${workspaceFolder}",
    "uploadOnSave": true,
    "concurrency": 3
  }
]
```

然后在 SFTP 面板选择要连接的服务器。

---

## 八、常见错误及解决方案

### 问题 1：连接超时

**错误信息：** `Connection timeout`

**解决：**

```json
{
  "timeout": 60,              // 改为更大的值
  "port": 2222                // 检查是否用了非标准 SSH 端口
}
```

### 问题 2：权限拒绝（Permission denied）

**错误信息：** `Permission denied (publickey,password)`

**解决：**

1. 检查用户名是否正确
2. 检查私钥文件权限：`chmod 600 ~/.ssh/id_rsa`
3. 在服务器检查公钥是否已授权：`cat ~/.ssh/authorized_keys`

### 问题 3：找不到远程路径

**错误信息：** `No such file or directory`

**解决：**

```bash
# SSH 连接到服务器后，查找正确的路径
pwd                              # 查看当前目录
ls -la                          # 列出文件
cd /var/www/html && pwd         # 查看网站根目录
```

### 问题 4：.env 被上传到服务器

**错误信息：** 机密信息泄露

**解决：**

```json
{
  "ignore": [
    ".env",                      // 忽略 .env
    ".env.local",
    ".env.*.local"
  ]
}
```

---

## 九、最佳实践

### ✅ 安全性

- ✅ **使用 SSH 密钥** 而不是密码
- ✅ **不要提交 sftp.json 到 Git**（含密钥路径）
- ✅ **忽略 .env 文件**（含数据库密码等）
- ✅ **使用强密码**保护私钥
- ✅ **限制 remotePath 权限**（避免误删系统文件）

**.gitignore 中添加：**

```
.vscode/sftp.json
.env
.env.local
```

### ✅ 性能

- ✅ **合理设置并发数** (2-4)
- ✅ **排除大文件夹**（node_modules, vendor）
- ✅ **关闭不需要的下载** (`downloadOnOpen: false`)

### ✅ 可靠性

- ✅ **开启 confirmDelete** 防止误删
- ✅ **使用版本控制** (.git) 作为备份
- ✅ **定期备份** 重要文件
- ✅ **分离开发/生产** 配置

### ⚠️ 注意事项

| 配置项          | 开发环境 | 生产环境 |
| --------------- | -------- | -------- |
| `uploadOnSave`  | true     | false    |
| `deleteRemote`  | true     | false    |
| `concurrency`   | 3-4      | 1-2      |
| `confirmDelete` | true     | true     |
| `timeout`       | 30       | 60       |

---

## 十、常用命令行操作

如果 VS Code SFTP 不可用，也可以用命令行：

```bash
# 上传文件到服务器
scp -i ~/.ssh/id_rsa ~/local/file.php user@host:/remote/path/

# 下载文件从服务器
scp -i ~/.ssh/id_rsa user@host:/remote/path/file.php ~/local/

# 同步整个文件夹（上传）
rsync -avz -e "ssh -i ~/.ssh/id_rsa" ~/local/ user@host:/remote/

# 同步整个文件夹（下载）
rsync -avz -e "ssh -i ~/.ssh/id_rsa" user@host:/remote/ ~/local/
```

---

## 总结

SFTP 配置的核心点：

1. **连接信息** - host、port、username、认证方式
2. **路径映射** - remotePath 和 localPath
3. **自动同步** - uploadOnSave、deleteRemote 等
4. **性能优化** - concurrency、timeout
5. **文件过滤** - ignore 排除不需要的文件
6. **安全性** - 使用密钥、忽略敏感文件

配置好后，你就可以在 VS Code 里编辑代码，自动同步到服务器，快速看到效果了！ 🚀

---

**最后的建议：**

> 开发时用 VS Code SFTP 快速调试，重要文件用 Git 版本控制备份。安全和效率都不能少！
