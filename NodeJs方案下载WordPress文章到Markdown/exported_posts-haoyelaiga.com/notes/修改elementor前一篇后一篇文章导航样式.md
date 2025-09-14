---
id: 253
title: 修改elementor前一篇后一篇文章导航样式
date: '2025-05-07T00:00:44'
author: haoye
categories:
  - notes
tags: []
url: https://haoyelaiga.com/%e4%bf%ae%e6%94%b9elementor%e5%89%8d%e4%b8%80%e7%af%87%e5%90%8e%e4%b8%80%e7%af%87%e6%96%87%e7%ab%a0%e5%af%bc%e8%88%aa%e6%a0%b7%e5%bc%8f/
---

最终成果如图：

![image-20240802132538323](https://docu-1319658309.cos.ap-guangzhou.myqcloud.com/image-20240802132538323.png)

## 一行内显示；

修改代码使两个导航元素在同一行显示。这里是更新后的 HTML 和 CSS：

```
<style>
  .elementor-post-navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .elementor-post-navigation__link {
    flex: 1;
  }

  .elementor-post-navigation__link a {
    display: flex;
    align-items: center;
    padding: 10px 15px;
    border: 1px solid #ccc;
    border-radius: 10px;
    text-decoration: none;
    color: #333;
    transition: border-color 0.3s ease;
  }

  .elementor-post-navigation__link a:hover {
    border-color: #666;
  }

  .elementor-post-navigation__prev a {
    justify-content: flex-start;
  }

  .elementor-post-navigation__next a {
    justify-content: flex-end;
    text-align: right;
  }

  .post-navigation__arrow-wrapper {
    font-size: 1.5em;
    margin: 0 10px;
  }

  .elementor-post-navigation__link__prev,
  .elementor-post-navigation__link__next {
    display: flex;
    flex-direction: column;
  }

  .post-navigation__prev--label,
  .post-navigation__next--label {
    font-size: 0.8em;
    color: #666;
  }

  .post-navigation__prev--title,
  .post-navigation__next--title {
    font-weight: bold;
  }
</style>
```

这个更新版本的主要变化包括：

1. 使用 flexbox 布局让两个导航元素在同一行显示。
2. 调整了内部元素的对齐方式，使”Previous”靠左对齐，”Next”靠右对齐。
3. 增加了一些间距和调整，以改善整体布局和可读性。
4. 保留了圆角边框和悬停时边框颜色加深的效果。

这个设计现在应该会在同一行显示两个导航元素，并且在较宽的屏幕上看起来更加平衡。在较窄的屏幕上，它们会自动换行。

## 2个导航框的间隙

要让两个框中间隔开一些距离，您可以在CSS中修改以下部分：

在 `.elementor-post-navigation` 选择器中添加一个 `gap` 属性。例如：

```
.elementor-post-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px; /* 添加这一行 */
}
```

这里的 `20px` 是两个框之间的间距，您可以根据需要调整这个值。如果您想要更大的间距，可以增加这个值，比如 `30px` 或 `40px`。如果想要更小的间距，则可以减小这个值。

这个修改会在两个导航元素之间创建一个固定的间距，使它们看起来更加分离。
