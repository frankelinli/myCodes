---
id: 108
title: WordPress REST API简易指南
date: '2025-04-17T21:35:50'
author: haoye
categories:
  - notes
tags: []
---

WordPress REST API简易指南。以下是一个完整的WordPress REST API演示，实现了一个简单的计数器功能，展示API的基本工作原理。

## 后端部分 (functions.php)

```
// 1. 注册REST API端点
function haowiki_register_counter_api() {
    register_rest_route('haowiki/v1', '/counter', array(
        // GET请求 - 获取计数器值
        array(
            'methods' => 'GET',
            'callback' => 'haowiki_get_counter',
            'permission_callback' => '__return_true' // 允许所有人读取
        ),
        // POST请求 - 增加计数器值
        array(
            'methods' => 'POST',
            'callback' => 'haowiki_update_counter',
            'permission_callback' => function() {
                return is_user_logged_in(); // 只允许已登录用户更新
            }
        )
    ));
}
add_action('rest_api_init', 'haowiki_register_counter_api');

// 2. 定义回调函数
function haowiki_get_counter() {
    $counter = get_option('haowiki_counter', 0);
    return array('count' => $counter);
}

function haowiki_update_counter() {
    $counter = get_option('haowiki_counter', 0);
    $counter++;
    update_option('haowiki_counter', $counter);
    return array('count' => $counter);
}

// 3. 添加前端脚本和必要数据
function haowiki_counter_scripts() {
    wp_enqueue_script('haowiki-counter', get_stylesheet_directory_uri() . '/js/counter.js', array('jquery'), '1.0', true);

    wp_localize_script('haowiki-counter', 'haowikiData', array(
        'apiUrl' => rest_url('haowiki/v1/counter'),
        'nonce' => wp_create_nonce('wp_rest'),
        'isLoggedIn' => is_user_logged_in()
    ));
}
add_action('wp_enqueue_scripts', 'haowiki_counter_scripts');
```

## 前端JavaScript (js/counter.js)

```
jQuery(document).ready(function($) {
    // 1. 获取WordPress传递的数据
    const apiUrl = haowikiData.apiUrl;
    const nonce = haowikiData.nonce;
    const isLoggedIn = haowikiData.isLoggedIn;

    // 2. 定义与API交互的函数
    function getCounter() {
        $.get(apiUrl, function(response) {
            $('#counter-value').text(response.count);
        });
    }

    // 3. 设置界面交互
    $('#increment-button').on('click', function() {
        if (!isLoggedIn) {
            alert('请先登录再增加计数');
            return;
        }

        $.ajax({
            url: apiUrl,
            method: 'POST',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('X-WP-Nonce', nonce);
            },
            success: function(response) {
                $('#counter-value').text(response.count);
            },
            error: function() {
                alert('操作失败，请刷新页面后重试');
            }
        });
    });

    // 4. 页面加载时获取初始数据
    getCounter();
});
```

## 页面HTML (添加到任意页面)

```
<div id="counter-demo" style="padding:20px; background:#f5f5f5; border-radius:5px; margin-bottom:20px;">
    <h3>REST API计数器演示</h3>
    <p>当前计数: <span id="counter-value">加载中...</span></p>
    <button id="increment-button">增加计数</button>
</div>
```

## REST API的工作原理解析

这个简单示例展示了WordPress REST API的核心工作原理：

1. **端点注册**：通过`register_rest_route()`创建API URL映射，定义哪些HTTP方法被接受以及由哪些函数处理
2. **命名空间**：使用`haowiki/v1`作为命名空间，防止与其他插件冲突并支持API版本控制
3. **权限控制**：通过`permission_callback`定义谁可以访问端点，实现安全控制
4. **数据操作**：回调函数中使用WordPress核心函数（如`get_option`）操作数据
5. **数据传递**：使用`wp_localize_script()`将后端数据安全地传递给前端JavaScript
6. **请求处理**：\
   – GET请求用于读取数据（获取计数）\
   – POST请求用于修改数据（增加计数）\
   – 使用nonce令牌防止CSRF攻击
7. **响应处理**：WordPress自动将回调函数返回的PHP数组转换为JSON响应

这种方式的优势：

- 使用标准HTTP方法表达意图
- 回调函数返回PHP数组即可，无需手动处理JSON转换
- 内置权限和安全检查
- 与现代JavaScript框架兼容
- 客户端和服务器端分离，便于开发

这个示例创建的API端点为`/wp-json/haowiki/v1/counter`，可使用任何HTTP客户端工具（如浏览器、Postman或curl）测试。

您提出了一个重要问题。REST API的主要优势不仅仅是性能，而是一种全新的架构方式，带来了多方面的好处：

## REST API的关键优势

### 1. 用户体验改进（而非纯性能）

- **无页面刷新交互**：用户可以保持当前上下文，不会丢失状态或滚动位置
- **部分内容更新**：只更新需要变化的元素，而非整个页面
- **顺畅的交互感**：减少页面闪烁和重新加载的视觉中断

### 2. 前后端分离架构

- **关注点分离**：后端专注于数据处理，前端专注于展示与交互
- **并行开发**：前端和后端团队可以独立工作，只要API契约不变
- **技术栈灵活性**：前端可以使用React、Vue等现代框架，而不受WordPress模板系统限制

### 3. 性能考量（次要但重要）

- **减少数据传输**：只传输必要的JSON数据，而非完整HTML
- **减轻服务器负担**：避免重新生成整个页面模板
- **更好的缓存策略**：API响应可以独立缓存

### 4. 多端支持

- **一次开发，多处使用**：同一API可同时支持网站、移动应用、桌面程序等
- **第三方集成**：外部服务可以通过API与您的WordPress站点交互

### 5. 可扩展性

- **微服务架构**：将复杂功能分解为独立的API端点
- **负载分布**：API服务可以独立扩展，不影响内容展示层

## 实际性能差异

在实际应用中，REST API并不总是比传统WordPress更”快”：

1. **首次加载**：REST API方案可能需要更多初始资源（框架代码等）
2. **额外请求**：API调用会增加HTTP请求数量
3. **双重处理**：服务器处理API请求，客户端处理返回数据

但REST API的价值在于它带来的架构优势和用户体验改善，而非纯粹的加载速度。最佳实践是针对具体需求选择合适的方法：

- **内容为主的静态页面**：传统WordPress渲染可能更高效
- **高交互性功能**：REST API方案体验更佳
- **混合方案**：首次加载使用服务器渲染，后续交互使用API

我们的计数器示例虽小，但展示了REST API的核心优势：实现了无刷新的内容更新，提供了更现代、流畅的用户体验。这种架构方式为WordPress站长提供了构建复杂、交互式应用的基础。
