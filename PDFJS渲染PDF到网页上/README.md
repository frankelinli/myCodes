# PDF 查看器

使用 Mozilla 官方 PDF.js Viewer 构建的现代化 PDF 阅读器。

## 🚀 快速开始

1. 在项目目录启动本地服务器：

```bash
python -m http.server 8000
```

2. 在浏览器打开：

```
http://localhost:8000/viewer.html
```

## ✨ 功能特性

- 📖 完整的 PDF 阅读体验
- 🔍 搜索功能
- 🖨️ 打印支持
- 🔄 旋转和缩放
- 📱 完全响应式（PC/手机友好）
- 🎨 侧边栏缩略图导航

## 📁 文件结构

```
.
├── viewer.html      # 主入口文件
├── khfu.pdf         # PDF 文件
└── README.md        # 本文件
```

## ⚠️ 重要提示

- 必须使用 **本地服务器** 运行（不能直接双击 HTML 文件）
- 确保 PDF 文件与 HTML 在同一目录
- 浏览器需要支持 JavaScript 和 Fetch API
