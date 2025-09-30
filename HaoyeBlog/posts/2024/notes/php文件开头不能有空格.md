---
id: 60
title: php文件开头不能有空格
slug: php%e6%96%87%e4%bb%b6%e5%bc%80%e5%a4%b4%e4%b8%8d%e8%83%bd%e6%9c%89%e7%a9%ba%e6%a0%bc
date: '2025-04-17T07:26:12'
categories:
  - notes
tags: []
url: https://haoyelaiga.com/php%e6%96%87%e4%bb%b6%e5%bc%80%e5%a4%b4%e4%b8%8d%e8%83%bd%e6%9c%89%e7%a9%ba%e6%a0%bc/
---



![](https://haoyeblog-1319658309.cos.ap-guangzhou.myqcloud.com/OIP-C.rAzIUHScvAJZYEnsOYB3oAHaNK)

#### 错误示例 (❌ 会导致错误)

假设我们有一个名为 `test.php` 的文件：

php

```
// 注意：这里有一个空行，上面可能有一个不可见的空格

<?php
// 尝试设置一个Cookie
setcookie("username", "John", time() + 3600);

// 尝试重定向
header('Location: page2.php');
?>
```



**执行结果：**
浏览器会显示一个类似这样的致命错误：
`Warning: Cannot modify header information - headers already sent by (output started at /path/to/test.php:1)`

**错误分析：**
在 `<?php` 标签之前有一个空行（可能由编辑器自动生成或不小心按了回车）。这个空行已经被当作内容输出给了浏览器。当PHP引擎执行到 `setcookie()` 和 `header()` 时，它试图发送HTTP头，但发现内容已经输出了，所以无法再发送头信息，于是报错。

------

#### 正确示例 (✅)

**1. 纯净的PHP文件**
对于只包含PHP代码的文件，确保 `<?php` 是文件的绝对第一个字符。

php

```
<?php
// 这是文件的第一行，第一个字符是 '<'
setcookie("username", "John", time() + 3600);
header('Location: page2.php');
// 后续所有逻辑代码...
// 文件结尾可以不写 ?>，这样能避免结尾空格导致的问题
```

