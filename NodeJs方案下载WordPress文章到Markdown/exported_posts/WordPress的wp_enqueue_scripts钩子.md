---
id: 228
title: WordPress的wp_enqueue_scripts钩子
date: '2025-05-06T21:57:08'
author: haoye
categories:
  - notes
tags: []
---

`wp_enqueue_style` 和 `wp_enqueue_script` 函数本身并不会直接将样式和脚本添加到你的网站中。它们只是将这些资源注册到 WordPress 的队列中。而 `wp_enqueue_scripts` 钩子（hook）则是 WordPress 实际加载这些队列中的资源的时机。

### `wp_enqueue_style` 和 `wp_enqueue_script`函数

让我们详细解释一下：

1. `wp_enqueue_style` 和 `wp_enqueue_script`:\
   – 这些函数用于注册和排队（enqueue）样式表和脚本。\
   – 它们告诉 WordPress 你想要加载哪些 CSS 和 JavaScript 文件。\
   – 但是，仅仅调用这些函数并不会立即将文件添加到页面中。

2. `wp_enqueue_scripts` 钩子:\
   – 这是一个 WordPress 动作（action）钩子，它在页面准备加载脚本和样式时被触发。\
   – 它为主题和插件提供了一个适当的时机来注册和排队它们的样式表和脚本。

3. `add_action('wp_enqueue_scripts', 'your_function')`:\
   – 这行代码告诉 WordPress：”当你准备加载脚本和样式时，请调用 ‘your\_function'”。\
   – 在这个函数中，你可以使用 `wp_enqueue_style` 和 `wp_enqueue_script` 来注册你的资源。

4. 为什么要这样做：\
   – 这种方法允许 WordPress 在正确的时间加载资源，确保它们以正确的顺序加载，并避免冲突。\
   – 它还允许 WordPress 优化资源加载，例如合并和压缩文件。\
   – 这种方法使得主题和插件可以协调工作，而不会相互干扰。

5. 执行顺序：\
   – WordPress 首先运行所有附加到 `wp_enqueue_scripts` 钩子的函数。\
   – 这些函数注册和排队所有需要的样式和脚本。\
   – 然后，WordPress 在适当的时候（通常是在 `<head>` 标签中或页面底部）输出这些资源。

总之，这种方法提供了一个集中的、可控的方式来管理网站的 CSS 和 JavaScript 资源，这是 WordPress 主题和插件开发中的一个重要概念。

### 只有`wp_enqueue_scripts` 钩子，没有 `wp_enqueue_style` 钩子

您的理解是正确的。在 WordPress 中，确实没有 `wp_enqueue_style` 钩子。让我详细解释一下：

1. `wp_enqueue_scripts` 钩子：\
   – 这是一个动作（action）钩子，用于enqueue（加入队列）both 样式表和脚本。\
   – 尽管名字中包含 “scripts”，但它同时用于样式表和脚本。

2. 为什么没有单独的 `wp_enqueue_style` 钩子：\
   – WordPress 设计者决定使用一个统一的钩子来处理所有前端资源（CSS 和 JavaScript）。\
   – 这简化了开发过程，并确保所有资源在同一时间点被加入队列。

3. `wp_enqueue_style` 和 `wp_enqueue_script` 函数：\
   – 这些是函数，不是钩子。它们用于将特定的样式表或脚本加入 WordPress 的加载队列。\
   – 这些函数通常在附加到 `wp_enqueue_scripts` 钩子的函数中调用。

4. 使用示例：

```
function my_enqueue_styles_and_scripts() {
    // Enqueue styles
    wp_enqueue_style('my-style', get_stylesheet_uri());

    // Enqueue scripts
    wp_enqueue_script('my-script', get_template_directory_uri() . '/js/script.js', array(), '1.0', true);
}
add_action('wp_enqueue_scripts', 'my_enqueue_styles_and_scripts');
```

5. 其他相关钩子：\
   – `admin_enqueue_scripts`：用于在管理后台加入队列样式和脚本。\
   – `login_enqueue_scripts`：用于在登录页面加入队列样式和脚本。

6. 为什么这样设计：\
   – 统一使用 `wp_enqueue_scripts` 可以确保样式和脚本在正确的时间和顺序被加载。\
   – 它简化了资源管理，使主题和插件开发者可以在一个地方处理所有前端资源。

总之，WordPress 中没有专门的 `wp_enqueue_style` 钩子。所有前端样式和脚本都应该通过 `wp_enqueue_scripts` 钩子来加入队列。这是 WordPress 的标准做法，也是最佳实践。
