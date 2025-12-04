---
id: 41
title: astra hook添加百度统计代码到网站head
slug: astra-hook%e6%b7%bb%e5%8a%a0%e7%99%be%e5%ba%a6%e7%bb%9f%e8%ae%a1%e4%bb%a3%e7%a0%81%e5%88%b0%e7%bd%91%e7%ab%99head
date: '2025-04-17T01:13:31'
categories:
  - notes
tags: []
url: https://haoyelaiga.com/astra-hook%e6%b7%bb%e5%8a%a0%e7%99%be%e5%ba%a6%e7%bb%9f%e8%ae%a1%e4%bb%a3%e7%a0%81%e5%88%b0%e7%bd%91%e7%ab%99head/
---

astra hook添加百度统计代码到网站head; 通过 Astra Hooks 添加代码时，当你创建一个 **自定义布局（Custom Layout）** 并选择 **Hooks** 时，是可以直接将代码粘贴到编辑器的。最好切换到“code editor”模式

### 方法一：使用astra site builder可视化hook

1. **创建自定义布局**：

- 登录 WordPress 后台。
- 进入 **外观 > 自定义布局**。
- 点击 **添加新布局**，创建一个新的自定义布局。

2. **设置布局类型为 Hooks**：\
   – 在右侧的“布局设置”部分：

   - 将“布局类型”设置为 **Hooks**。
   - 选择挂钩位置：根据需要选择 **wp\_head**（将代码添加到 `<head>` 标签中）或 **wp\_footer**（将代码添加到 `<body>` 标签结束前）。
   - 示例：选择 `wp_head`，用于插入百度统计代码到 `<head>` 部分。

3. **粘贴代码到编辑器**：\
   – 在**内容编辑器**中，直接切换到 **文本模式**（Text）或使用代码块（Code Block）。\
   – 然后粘贴你的百度统计代码：

   `html <script>
   var _hmt = _hmt || [];
   (function() {
   var hm = document.createElement("script");
   hm.src = "https://hm.baidu.com/hm.js?2rrffdsfd878446f8167883dkewe3dk03k7";
   var s = document.getElementsByTagName("script")[0];
   s.parentNode.insertBefore(hm, s);
   })(); </script>`

4. **设置显示规则**：\
   – 在右侧的“显示规则”部分，选择 **Entire Website**（整个网站）——这样代码会加载到所有页面。\
   – 如果只想在某些页面加载，可以根据需要设置特定的显示条件。

5. **保存并发布布局**：\
   – 点击 **发布** 按钮保存你的自定义布局。

***

**粘贴代码时的注意事项**

- 将代码直接粘贴到编辑器中，不需要额外的 HTML 包裹。
- 如果使用的是区块编辑器（Gutenberg），确保选择代码块或切换到 HTML 模式。

:::tip

不要在可视化模式下粘贴代码，以免代码被格式化或破坏。

:::

***

完成以上步骤后，百度统计代码会通过 Astra 的 Hooks 功能插入到指定位置（如 `<head>` 或 `<body>`），并在前端生效。

### 方法二：通过 Astra 自定义代码功能

如果不使用 Astra Pro，也可以通过 WordPress 的自定义代码功能添加百度统计代码：

1. **进入主题自定义代码**：

- 在 WordPress 后台，进入 **外观 > 自定义 > 附加 CSS/JS**。

2. **插入代码**：

- 找到添加 JS 或 HTML 的入口（通常在“高级设置”或“额外的代码”部分），然后粘贴以下代码：

“\`js

“\`

### 方法三：直接编辑主题的 `functions.php` 文件

如果你熟悉代码，也可以直接将百度统计代码添加到主题的 `functions.php` 文件中。

```
function add_baidu_analytics() {
    echo '<script>
    var _hmt = _hmt || [];
    (function() {
      var hm = document.createElement("script");
      hm.src = "https://hm.baidu.com/hm.js?2rrffdsfd878446f8167883dkewe3dk03kikaadfd3332d6756f";
      var s = document.getElementsByTagName("script")[0]; 
      s.parentNode.insertBefore(hm, s);
    })();
    </script>';
}
add_action('wp_head', 'add_baidu_analytics'); // 将代码插入到 <head> 部分   
```

在PHP里插入HTML/JavaScript代码有两种主要方式：\
1\. echo 输出\
2\. PHP的结束标记 `?>` 直接输出

在这个场景下，不使用echo的原因是：

1. 当输出大段HTML/JavaScript时，使用 `?>` 直接输出更易读和维护：

```
function add_baidu_analytics() {
    ?>
    <script>
    // JavaScript代码
    </script>
    <?php
}
```

而不是：

```
function add_baidu_analytics() {
    echo '<script>
    // JavaScript代码
    </script>';
}
```

2. 使用 `?>` 方式可以避免：\
   – 引号嵌套问题\
   – 转义字符的使用\
   – 长字符串拼接的复杂性

3. 当使用heredoc语法时，确实应该使用echo：

```
function add_baidu_analytics() {
    echo <<<EOT
    <script>
    // JavaScript代码
    </script>
    EOT;
}
```

所以总结：\
– 短字符串：用 echo\
– 大段HTML/JS：用 `?>` 直接输出\
– heredoc格式：用 echo
