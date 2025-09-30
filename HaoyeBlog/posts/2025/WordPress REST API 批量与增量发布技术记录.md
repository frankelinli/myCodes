---
id: 404

title: wordpress rest api 批量与增量发布技术记录
slug: wordpress rest api 批量与增量发布技术记录

categories:
  - notes
tags: []
---

![image-20250918004211388](https://haoyeblog-1319658309.cos.ap-guangzhou.myqcloud.com/image-20250918004211388.png)

## 已实现批量与增量发布能力，核心点总结如下：

## 已完成功能

1. 重构 publish.js
   - 提供可复用的 `export async function publishFile(mdPath, { preserveSlugOnUpdate })`
   - 直接运行 `node publish.js xxx.md` 仍保持原 CLI 行为
   - 更新策略：更新时默认不再发送 `slug`，保护 SEO URL

2. 新增 batch_publish.js
   - 递归扫描 posts（可用 `--root=` 指定）目录下所有 `.md/.markdown`
   - 维护 `.publish-cache.json`（记录文件 hash、文章 id、slug、更新时间）
   - 默认仅发布新增或内容有变化的文件
   - 参数：
     - `--all` 全量强制重发
     - `--dry-run` 只显示将要发布的文件
     - `--delay-ms=NUM` 控制每次 API 调用间隔
     - `--root=DIR` 指定根目录
     - `--help` 查看帮助

3. README 已追加批量发布使用文档



![image-20250918004531750](https://haoyeblog-1319658309.cos.ap-guangzhou.myqcloud.com/image-20250918004531750.png)

## 使用示例

### 单篇发布（保持原行为）
```powershell
node publish.js posts\\example.md
```

### 查看将要增量发布的文件（不执行）
```powershell
node batch_publish.js --dry-run
```

### 正式增量发布
```powershell
node batch_publish.js
```

### 强制全量重发
```powershell
node batch_publish.js --all
```

### 指定子目录并降低频率
```powershell
node batch_publish.js --root=posts\\notes --delay-ms=400
```

## 缓存文件
生成于项目根目录：`.publish-cache.json`
- 删除该文件相当于清空历史状态（或使用 `--all`）
- 结构包含 `hash`（内容 SHA1）、`id`（WP 文章 ID）、`slug`、`updatedAt`

## 后续可扩展建议（如需我可继续实现）
- `--since=<git-ref>` 基于 `git diff` 选文件
- 发布失败重试与汇总报告
- `--concurrency=N` 并发（需小心 WP 限流）
- 输出统计：成功数 / 失败数
- 检测本地缺少 `slug` 时自动用文件名生成（当前仍强制要求提供）

如果现在你希望：
A) 增加基于 git 差异的增量逻辑  
B) 增加失败重试  
C) 增加并发控制  
D) 其它 —— 直接告诉我

