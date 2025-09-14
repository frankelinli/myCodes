---
id: 151
title: WordPress admin ajax的简单示例-文章底部显示点赞数量
date: '2025-04-19T14:47:17'
author: haoye
categories:
  - notes
tags: []
url: https://haoyelaiga.com/wordpress-admin-ajax%e7%9a%84%e7%ae%80%e5%8d%95%e7%a4%ba%e4%be%8b-%e6%96%87%e7%ab%a0%e5%ba%95%e9%83%a8%e6%98%be%e7%a4%ba%e7%82%b9%e8%b5%9e%e6%95%b0%e9%87%8f/
---

Admin-Ajax 是 WordPress 实现无刷新交互的核心机制，广泛应用于多种场景。最常见的用途包括表单提交处理（如评论、联系表单、会员注册）；实现动态内容加载（如无限滚动加载文章、AJAX 搜索功能）；用户交互反馈（如点赞、收藏、投票系统）；以及后台管理功能（如媒体库处理、批量操作文章）。它的优势在于无需刷新页面即可更新内容，提升用户体验；同时与 WordPress 安全机制集成，通过 nonce 验证保障网站安全；此外还支持同时处理登录和未登录用户的不同权限需求。无论简单功能还是复杂应用，Admin-Ajax 都是现代 WordPress 网站实现动态交互的标准方案。

WordPress admin-ajax 的入门实例摘要：这个实例将创建一个简单的点赞功能，实时显示在网站底部。下面是具体实现方案，已经按照模块化结构设计好。

### 首先，创建 `inc/ajax-likes.php` 文件：

```
<?php
// 注册 AJAX 操作
function haowiki_ajax_likes_setup() {
    // 注册给登录和未登录用户的 AJAX 动作
    add_action('wp_ajax_update_like_count', 'haowiki_update_like_count');
    add_action('wp_ajax_nopriv_update_like_count', 'haowiki_update_like_count');

    // 加载前端脚本
    add_action('wp_enqueue_scripts', 'haowiki_enqueue_like_scripts');
}
add_action('init', 'haowiki_ajax_likes_setup');

// 加载必要的JS脚本
function haowiki_enqueue_like_scripts() {
    wp_localize_script('jquery', 'haowiki_likes', array(
        'ajax_url' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('haowiki-likes-nonce')
    ));
}

// 处理AJAX请求的回调函数
function haowiki_update_like_count() {
    // 验证安全性
    check_ajax_referer('haowiki-likes-nonce', 'nonce');

    // 获取当前点赞数
    $likes = (int)get_option('haowiki_total_likes', 0);

    // 增加点赞数
    $likes++;
    update_option('haowiki_total_likes', $likes);

    // 返回新的点赞数
    wp_send_json_success(array('likes' => $likes));

    wp_die(); // 结束AJAX请求
}

// 添加页脚显示内容
function haowiki_display_likes_footer() {
    $likes = get_option('haowiki_total_likes', 0);
    echo '<div id="haowiki-likes-counter" class="haowiki-footer-likes">';
    echo '<span class="like-count">' . esc_html($likes) . '</span> 人喜欢HaoWiki ';
    echo '<button id="haowiki-like-button" class="like-button">👍 点赞</button>';
    echo '</div>';
}
add_action('wp_footer', 'haowiki_display_likes_footer');
?>
```

接下来在 `custom.js` 中添加前端代码：

```
jQuery(document).ready(function($) {
    // 点赞按钮点击事件
    $('#haowiki-like-button').on('click', function() {
        $.ajax({
            type: 'POST',
            url: haowiki_likes.ajax_url,
            data: {
                action: 'update_like_count',
                nonce: haowiki_likes.nonce
            },
            success: function(response) {
                if(response.success) {
                    // 更新显示的点赞数
                    $('.like-count').text(response.data.likes);

                    // 添加一个简单的动画效果
                    $('#haowiki-likes-counter').addClass('liked');
                    setTimeout(function() {
                        $('#haowiki-likes-counter').removeClass('liked');
                    }, 700);
                }
            }
        });
    });
});
```

在 `style.css` 添加样式：

```
.haowiki-footer-likes {
    text-align: center;
    padding: 10px;
    background: #f9f9f9;
    margin-top: 20px;
}

.like-button {
    background: #0073aa;
    color: white;
    border: none;
    padding: 5px 15px;
    border-radius: 3px;
    cursor: pointer;
    transition: all 0.3s;
}

.like-button:hover {
    background: #005177;
}

.haowiki-footer-likes.liked {
    animation: like-pulse 0.7s ease-in-out;
}

@keyframes like-pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}
```

最后，在 `functions.php` 中引入模块：

```
// 引入AJAX点赞功能
require_once get_stylesheet_directory() . '/inc/ajax-likes.php';
```

这个示例展示了完整的admin-ajax使用流程：注册AJAX动作、创建处理函数、前端发送请求和更新界面，简单易懂又有实用价值。

### 数据存储介绍

关于点赞数据的存储：这个示例将点赞数据保存在WordPress的options表中。具体来说，通过`update_option('haowiki_total_likes', $likes)`函数，将点赞总数以’haowiki\_total\_likes’为键存储在wp\_options表里。这是一种简单的全站点赞计数方式，适合这个演示用例。

当用户点击点赞按钮时，AJAX请求会触发`haowiki_update_like_count()`函数，该函数先通过`get_option('haowiki_total_likes', 0)`获取当前计数，增加后再用`update_option()`更新回数据库。这种方式的优点是实现简单，但如果你需要更复杂的功能（如按文章单独计数或限制用户重复点赞），则需要使用自定义表或post meta数据来存储更详细的信息。

WordPress的options表非常适合存储这类全站范围的小型数据，无需创建额外的数据表结构。

### admin ajax 思路和概念介绍

WordPress的admin-ajax系统提供了一种标准方式实现异步交互功能。以下是整个开发思路和关键概念：

### 核心概念

1. **Admin-Ajax端点**：WordPress提供的`admin-ajax.php`是处理AJAX请求的统一入口点。
2. **Action Hook**：通过`wp_ajax_{action}`和`wp_ajax_nopriv_{action}`钩子注册处理函数，分别处理已登录和未登录用户的请求。
3. **Nonce验证**：使用WordPress的nonce系统确保请求安全性，防止CSRF攻击。
4. **数据存储**：根据需求选择合适的存储位置（options表、post meta、自定义表等）。

### 开发步骤概述

1. **后端准备**：\
   – 注册AJAX处理函数\
   – 创建安全验证机制\
   – 设计数据处理和存储逻辑
2. **前端准备**：\
   – 将必要参数（如ajax\_url和nonce）传递给JavaScript\
   – 编写发送AJAX请求的前端代码\
   – 处理返回结果并更新UI
3. **数据流程**：\
   – 用户交互触发JavaScript事件\
   – 前端发送AJAX请求到admin-ajax.php\
   – WordPress路由到对应处理函数\
   – 处理函数执行逻辑并返回结果\
   – 前端接收结果并更新页面

### 技术要点

1. **wp\_localize\_script**：用于将PHP变量传递给JavaScript脚本，是连接前后端的桥梁。
2. **wp\_send\_json\_success/error**：标准化AJAX响应格式，方便前端处理。
3. **check\_ajax\_referer**：验证请求合法性的关键函数。
4. **wp\_die**：正确终止AJAX请求的方法。

### 数据存储选择

- **wp\_options**：适合全站共享的简单数据（如示例中的总点赞数）。
- **post\_meta**：适合与特定文章关联的数据（如单篇文章的点赞数）。
- **user\_meta**：适合与用户关联的数据（如用户点赞历史）。
- **自定义表**：适合复杂、高性能需求的数据结构。

WordPress的admin-ajax系统虽然看起来简单，但非常灵活强大，可以实现从简单的点赞功能到复杂的表单处理、实时搜索、内容过滤等各种交互功能，是现代WordPress开发中不可或缺的一部分。
