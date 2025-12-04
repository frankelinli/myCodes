# 页面发布功能使用说明

## 目录结构

```
HaoyeBlog/
├── posts/              # 文章目录 (post类型)
│   ├── 2024/
│   └── 2025/
├── pages/              # 页面目录 (page类型)
│   └── about.md        # 示例页面
├── publish.js          # 发布脚本
└── batch_publish.js    # 批量发布脚本
```

## 使用方式

### 1. 发布单个文章
```bash
node publish.js posts/2024/my-article.md
```

### 2. 发布单个页面
```bash
node publish.js pages/about.md
```

### 3. 批量处理所有新修改的内容
```bash
node batch_publish.js
```

### 4. 只批量处理文章
```bash
node batch_publish.js --posts
```

### 5. 只批量处理页面
```bash
node batch_publish.js --pages
```

### 6. 预览模式（不实际发布）
```bash
node batch_publish.js --dry-run
```

### 7. 强制处理所有内容
```bash
node batch_publish.js --all
```

### 8. 调试模式
```bash
# Windows PowerShell
$env:DEBUG_PUBLISH="1"; node publish.js pages/about.md

# Linux/Mac
DEBUG_PUBLISH=1 node publish.js pages/about.md
```

## 页面特有字段

在 pages 目录的 Markdown 文件中，可以使用以下特殊字段：

```yaml
---
title: 页面标题
slug: page-slug
parent: 0           # 父页面ID（可选）
menu_order: 1       # 菜单排序（可选）
featured_image: 123 # 特色图片ID（可选）
---
```

## 自动识别规则

- **posts/** 目录下的文件 → 自动识别为文章(post)
- **pages/** 目录下的文件 → 自动识别为页面(page)

## 注意事项

1. 页面不需要设置 categories 和 tags（即使设置了也会被忽略）
2. 页面支持层级结构（通过 parent 字段）
3. 页面支持菜单排序（通过 menu_order 字段）
4. frontmatter 结构保持不变，无需修改现有文件

## 测试建议

1. 先测试发布单个页面：
   ```bash
   node publish.js pages/about.md
   ```

2. 检查 WordPress 后台是否正确创建了页面

3. 测试批量处理：
   ```bash
   node batch_publish.js --pages --dry-run
   ```

4. 确认无误后正式发布：
   ```bash
   node batch_publish.js --pages
   ```
