---
id: 1156
title: custom.js只在浏览器运行-搜索引擎看不到
slug: custom.js只在浏览器运行-搜索引擎看不到
categories:
  - notes
tags: []
---

cusmtom.js里通过JS代码运行的效果，是在浏览器运行还是服务器运行？搜索引擎能看到吗？**我用JavaScript添加的内容，搜索引擎能看到吗？它是在哪里执行的？**

这个问题看似简单，但对网站的SEO优化和功能设计有很大影响。今天就来彻底搞清楚这个问题。

**JavaScript代码运行在浏览器里，不是服务器。**

### 详细说明

让我们追踪一个网页的加载过程：

```
1. 用户访问网站
   ↓
2. 浏览器向服务器发送请求
   ↓
3. 服务器返回 HTML 文件
   ↓
4. 浏览器解析 HTML，加载 CSS 和 JavaScript 文件
   ↓
5. 浏览器执行 JavaScript 代码 ← 【是这里！】
   ↓
6. 页面内容动态更新，用户看到最终效果
```

**关键点：**

- 服务器的工作：生成和发送 HTML
- 浏览器的工作：解析 HTML，执行 JavaScript，修改页面

### 代码示例

比如这段 jQuery 代码：

```javascript
jQuery(function ($) {
    // 添加读进度条
    var progressBar = $('<div id="reading-progress-bar"></div>').css({
        position: 'fixed',
        top: 0,
        left: 0,
        height: '3px',
        background: 'linear-gradient(to right, #007bff, #0056b3)',
        width: 0,
        zIndex: 9999
    });
    $('body').prepend(progressBar);
});
```

这个代码中的所有操作：

- `$('body').prepend()` ← 浏览器执行
- 修改 DOM 结构 ← 浏览器执行
- 添加样式 ← 浏览器执行

都是在**用户的浏览器**里发生的，而不是在服务器。

## 搜索引擎能看到吗？

### 答案：**大多数情况下看不到**

搜索引擎爬虫（如Google爬虫、百度爬虫）访问你的网站时：

1. ❌ **不执行JavaScript** - 大多数爬虫只解析HTML代码，不运行JS
2. ❌ **看不到动态添加的内容** - JS在浏览器里添加的内容，爬虫看不到
3. ❌ **不能索引这些内容** - 看不到的内容就无法被搜索引擎索引

### 例外情况

Google 的爬虫比较特殊，它有JavaScript渲染能力，**可能**会执行你的JS代码。但是：

- 并非所有JavaScript都能被谷歌完美渲染
- 复杂的动态效果可能无法正确解析
- 其他搜索引擎（百度、必应等）基本不执行JS

## 实际影响

### 场景1：用JS添加装饰性内容

```javascript
// 添加怀旧2007年消息、阅读进度条、悬停效果等
```

✓ **影响：无** - 这些是交互效果，搜索引擎不需要索引

### 场景2：用JS添加关键内容（SEO重要）

```javascript
// 用JS动态添加标题、描述、关键词等
```

✗ **影响：严重** - 搜索引擎看不到，无法优化排名

### 场景3：用PHP在服务端添加内容

```php
// 在 functions.php 或主题模板中输出内容
echo '<div class="content">重要的SEO内容</div>';
```

✓ **影响：最好** - 内容在HTML中，搜索引擎能看到

## 如何判断你的代码在哪里运行？

### 快速判断法

| 代码特征                    | 执行位置 |
| :-------------------------- | :------- |
| jQuery、DOM操作             | 浏览器   |
| 事件监听（click、scroll等） | 浏览器   |
| 动画效果、CSS修改           | 浏览器   |
| PHP代码（<?>                | 服务器   |
| 数据库查询                  | 服务器   |
| 文件操作                    | 服务器   |

### 实际例子

```javascript
// ✓ 浏览器运行
jQuery(function ($) {
    $('img').on('mouseenter', function () {
        $(this).css({ transform: 'scale(1.05)' });
    });
});
// ✓ 服务器运行
<?php
function add_custom_content() {
    echo '<div class="important-content">这是SEO内容</div>';
}
add_filter('the_content', 'add_custom_content');
?>
```

## 最佳实践建议

### 对于装饰和交互效果

👉 **用JavaScript实现** - 可以轻松实现复杂效果，不影响SEO

- 阅读进度条
- 图片悬停效果
- 飘窗广告
- 动画过渡

### 对于重要内容（SEO相关）

👉 **用PHP/服务端实现** - 确保搜索引擎能看到

- 文章标题和描述
- 关键词
- 结构化数据（Schema）
- 导航菜单

### 对于内容可访问性

👉 **混合使用** - 服务端输出基础内容，JS增强交互

```php
<?php
// 服务端：输出基础内容（搜索引擎看得到）
echo '<article class="entry-content">';
echo the_content();
echo '<div class="retro-message">基础怀旧内容</div>';
echo '</article>';
?>
// 浏览器：增强交互效果（用户体验更好）
jQuery(function ($) {
    $('.retro-message').addClass('fade-in-animation');
    // 添加更多交互效果
});
```

## 总结

1. **JavaScript在浏览器运行** - 在用户的浏览器里执行，不是服务器
2. **搜索引擎看不到JS内容** - 大多数爬虫不执行JavaScript代码
3. **需要区分场景** - 装饰效果用JS，重要内容用PHP
4. **遵循最佳实践** - 渐进增强，确保内容可访问和可索引

记住这一句话就够了：**如果搜索引擎需要看到，就用PHP；如果只是用户体验，就用JavaScript。**

---

## 但是，custom.js文件本身必须在服务器上，传输给访客的浏览器里。



这涉及到 Web 的基本原理。

**浏览器无法直接读取你电脑上的文件。**

## 浏览器怎么获取 custom.js？

```
用户打开网页
   ↓
浏览器解析 HTML，看到：
<script src="/wp-content/themes/xxx/custom.js"></script>
   ↓
浏览器向服务器发送请求：
"给我 /wp-content/themes/xxx/custom.js"
   ↓
服务器返回 custom.js 的内容
   ↓
浏览器接收文件，执行 JavaScript 代码
```

## 为什么不能直接从电脑读？

想象如果浏览器可以随意读取你电脑硬盘上的文件，会发生什么：

```javascript
// 恶意网站可以这样做
<script>
    // 读你电脑上的密码文件
    fetch('file:///C:/Users/你的用户名/Documents/密码.txt')
</script>
```

所以浏览器设计上就**禁止直接访问本地文件**（出于安全考虑）。

## 必须要在服务器上

✓ **custom.js 必须放在服务器上**，因为：
- HTML 文件在服务器上
- 浏览器只能读取服务器发送的文件
- 这样才能通过网络传输到用户的浏览器

## 实际流程

你的 WordPress 主题文件：

```
服务器 (WordPress)
  ├─ index.php → 生成 HTML
  │   └─ 包含: <script src="custom.js"></script>
  │
  └─ custom.js → 浏览器下载并执行
```

用户访问博客：
1. 服务器发送 HTML（里面包含对 custom.js 的引用）
2. 浏览器看到 HTML 里的 `<script src="...">` 标签
3. 浏览器自动请求 custom.js
4. 服务器返回 custom.js 代码
5. 浏览器执行这个代码

:::info  **总结：** 

虽然 JavaScript 最终在浏览器执行，但它的**源文件必须在服务器上**，因为浏览器需要通过网络下载才能获取。

:::
