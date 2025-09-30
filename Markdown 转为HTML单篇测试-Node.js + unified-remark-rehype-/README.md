# md-render-lab

本地 Markdown 渲染测试项目（Node.js + unified/remark/rehype），支持（浅色主题 + Prism 高亮）：

- TOC 目录自动生成
- SEO 元数据（`<head>`：OG/Twitter/JSON-LD）
- 代码高亮：Prism（rehype-prism-plus），样式见 `public/prism.css`
- GFM（表格、任务列表、删除线等）
- 自动生成标题锚点与链接
- 本地静态预览服务

## 使用

1. 安装依赖

```powershell
npm install
```

2. 构建

```powershell
npm run build
```

3. 本地预览（默认 8080）

```powershell
npm run serve
```

打开浏览器访问 `http://localhost:8080`。

## 备注

- 可放多篇 Markdown，扩展构建脚本做批量渲染。
- 默认使用 Prism（轻量）；如需更强高亮质量可切到 `shiki`（已在依赖中，暂未启用）。
