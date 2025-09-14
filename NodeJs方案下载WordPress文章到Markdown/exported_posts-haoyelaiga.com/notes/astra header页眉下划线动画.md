---
id: 39
title: astra header页眉下划线动画
date: '2025-04-17T01:13:30'
author: haoye
categories:
  - notes
tags: []
url: https://haoyelaiga.com/astra-header%e9%a1%b5%e7%9c%89%e4%b8%8b%e5%88%92%e7%ba%bf%e5%8a%a8%e7%94%bb/
---

对于Astra主题头部菜单导航的hover下划线动画效果，CSS伪元素即可实现：

### CSS代码：

```
.main-header-menu a {
    position: relative;
}

.main-header-menu a::after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: -2px;
    left: 0;
    background-color: currentColor;
    transition: width 0.2s ease-out;
    opacity: 1;
}

.main-header-menu a:hover::after {
    width: 100%;
}
```

### position: relative不可以去掉

`.main-header-menu a {
position: relative;
}`

不可以去掉。`position: relative` 是必需的，因为它建立了一个定位上下文，是下划线动画正常工作的关键。

原因是：

1. `::after` 伪元素使用了 `position: absolute`
2. 没有 `position: relative` 的父元素，绝对定位的下划线将相对于最近的已定位祖先元素定位
3. 这可能导致下划线出现在错误的位置

### 使用currentColor

使用currentColor，这样下划线颜色会自动跟随Astra主题设置的菜单颜色
