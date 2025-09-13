---
id: 272
title: elementor让元素自动滚动条
date: '2025-05-11T18:14:10'
author: haoye
categories:
  - notes
tags: []
---

要在Elementor中为一个元素设置自动竖向滚动条，您可以使用自定义CSS样式来实现。以下是步骤：

1. **打开Elementor编辑器**并选择您要设置滚动条的元素。

2. **进入元素的高级设置**：\
   – 在右侧面板中，找到并点击“高级”标签。

3. **添加自定义CSS**：\
   – 在“自定义CSS”区域中，添加以下CSS代码：

```
selector {
    max-height: 400px; /* 设置容器的最大高度，根据需要调整 */
    overflow-y: auto;  /* 启用竖向滚动条 */
}
```

以下是一个完整的HTML和CSS示例，展示如何在一个容器内实现竖向滚动条：

```
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>自动滚动条示例</title>
    <style>
        .scroll-container {
            max-height: 400px; /* 设置最大高度 */
            overflow-y: auto;  /* 启用竖向滚动条 */
            border: 1px solid #ccc;
            padding: 10px;
        }
    </style>
</head>
<body>
    <div class="scroll-container">
        <p>这是一个带有自动竖向滚动条的容器。</p>
        <p>内容过多时会自动出现滚动条。</p>
        <p>添加更多内容以演示滚动条效果。</p>
        <p>添加更多内容以演示滚动条效果。</p>
        <p>添加更多内容以演示滚动条效果。</p>
        <p>添加更多内容以演示滚动条效果。</p>
        <p>添加更多内容以演示滚动条效果。</p>
        <p>添加更多内容以演示滚动条效果。</p>
        <p>添加更多内容以演示滚动条效果。</p>
        <p>添加更多内容以演示滚动条效果。</p>
        <p>添加更多内容以演示滚动条效果。</p>
        <p>添加更多内容以演示滚动条效果。</p>
    </div>
</body>
</html>
```

在Elementor中，您可以将上述CSS代码应用到特定的元素上，而不是使用`.scroll-container`类。通过Elementor的自定义CSS功能直接为选中的元素添加样式即可。

希望这对您有所帮助！如果您有任何其他问题，请随时提问。
