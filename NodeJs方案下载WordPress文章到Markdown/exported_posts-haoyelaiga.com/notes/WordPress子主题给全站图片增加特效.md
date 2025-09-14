---
id: 136
title: WordPress子主题给全站图片增加特效
date: '2025-04-19T12:17:17'
author: haoye
categories:
  - notes
tags: []
url: https://haoyelaiga.com/wordpress%e5%ad%90%e4%b8%bb%e9%a2%98%e7%bb%99%e5%85%a8%e7%ab%99%e5%9b%be%e7%89%87%e5%a2%9e%e5%8a%a0%e7%89%b9%e6%95%88/
---

使用jQuery可以简化JavaScript代码的编写，使其更加简洁和易于阅读。尽管近年来原生JavaScript的功能得到了极大的增强，并且许多现代Web开发框架（如React和Vue.js）提供了更高层次的抽象，但jQuery在某些情况下仍然很流行，特别是在维护旧项目或者在需要快速实现简单交互效果时。

下面是如何使用jQuery简化实现全站图片悬停时的卡片式立体弹出效果的代码：

### 步骤 1：添加自定义CSS

首先，在子主题的 `style.css` 文件中添加CSS样式：

```
/* 图片悬停效果 */
img.hover-effect {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

img.hover-effect:hover {
    transform: translateY(-10px) scale(1.1);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}
```

### 步骤 2：添加jQuery代码

接下来，在子主题文件夹中创建一个新的jQuery文件，例如 `hover-effect.js`，并添加以下代码：

```
jQuery(document).ready(function($) {
    $('img').addClass('hover-effect');
});
```

### 综合步骤回顾

1. **编辑 `style.css` 文件**：添加悬停效果的CSS样式。
2. **创建 `hover-effect.js` 文件**：编写jQuery代码，将CSS类应用到全站的图片上。
3. **编辑 `functions.php` 文件**：加载jQuery和自定义JavaScript文件。

### 关于jQuery的流行度

尽管原生JavaScript的发展使得许多jQuery的功能可以通过纯JavaScript来实现，但jQuery仍然在一些情况下被广泛使用，特别是：

- **维护旧项目**：许多旧项目依赖jQuery，完全移除它们需要大量的重构工作。
- **简单快速的解决方案**：对于简单的DOM操作和事件处理，jQuery仍然是一个方便的选择。
- **插件生态系统**：jQuery拥有丰富的插件生态系统，许多插件和库仍然依赖jQuery。

然而，对于新项目，特别是大型和复杂的应用，现代JavaScript框架和库如React、Vue.js和Angular通常是更好的选择。
