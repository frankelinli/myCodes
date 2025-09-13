---
author: haoye
categories:
- 随记
date: '2025-05-06T21:57:05'
id: 224
tags: []
title: WordPress对象和数组的固定属性
---

在 WordPress 中，`WP_User` 对象有一些固定的属性，这些属性来源于 WordPress 数据库中 `wp_users` 表的字段。以下是
`WP_User` 对象中的主要固定属性：

### WP_User 对象的固定属性

  * **ID** : 用户的唯一标识符。
  * **user_login** : 用户的登录名。
  * **user_pass** : 用户的加密密码。
  * **user_nicename** : 用户的别名（URL 友好）。
  * **user_email** : 用户的电子邮件地址。
  * **user_url** : 用户的个人网站 URL。
  * **user_registered** : 用户注册的日期和时间。
  * **user_activation_key** : 用户激活密钥（用于密码重置等）。
  * **user_status** : 用户状态（通常为 0）。
  * **display_name** : 用户的显示名称

### 访问这些属性

你可以通过 `WP_User` 对象直接访问这些属性。例如：

    
    
    <?php
    require( dirname(__FILE__) . '/wp-load.php' );
    
    // 获取一个用户对象
    $user = get_userdata(1); // 假设用户ID为1
    
    // 访问固定属性
    echo "User ID: " . $user->ID . "<br>";
    echo "User Login: " . $user->user_login . "<br>";
    echo "User Nicename: " . $user->user_nicename . "<br>";
    echo "User Email: " . $user->user_email . "<br>";
    echo "User URL: " . $user->user_url . "<br>";
    echo "User Registered: " . $user->user_registered . "<br>";
    echo "Display Name: " . $user->display_name . "<br>";
    ?>
    

### 其他相关对象和属性

除了上面的固定属性，`WP_User` 对象还包含一些与用户权限和角色相关的属性和方法：

  * **caps** : 用户的权限数组。
  * **cap_key** : 用户权限键。
  * **roles** : 用户角色数组。
  * **allcaps** : 用户所有权限数组。
  * **filter** : 过滤器。

这些属性和方法用于管理和检查用户的权限和角色。例如：

    
    
    <?php
    // 检查用户是否是管理员
    if (in_array('administrator', $user->roles)) {
        echo "This user is an administrator.";
    }
    
    // 检查用户是否有某个权限
    if ($user->has_cap('edit_posts')) {
        echo "This user can edit posts.";
    }
    ?>
    

通过这些固定属性和方法，你可以灵活地管理和访问 WordPress 用户的各种信息。

在 WordPress 中，除了 `WP_User` 对象外，还有许多其他对象和数组，它们也有固定的属性。以下是一些常见的 WordPress
对象及其固定属性：

### 1\. `WP_Post` 对象

`WP_Post` 对象表示一个文章（帖子），包括页面、自定义文章类型等。以下是 `WP_Post` 对象的固定属性：

  * **ID** : 文章的唯一标识符。
  * **post_author** : 文章的作者ID。
  * **post_date** : 文章的发布时间。
  * **post_date_gmt** : 文章的GMT发布时间。
  * **post_content** : 文章内容。
  * **post_title** : 文章标题。
  * **post_excerpt** : 文章摘要。
  * **post_status** : 文章状态（如 `publish`、`draft`）。
  * **comment_status** : 评论状态（如 `open`、`closed`）。
  * **ping_status** : Pingback 状态（如 `open`、`closed`）。
  * **post_password** : 文章密码。
  * **post_name** : 文章别名（slug）。
  * **to_ping** : 将要 Ping 的列表。
  * **pinged** : 已经 Ping 的列表。
  * **post_modified** : 文章最后修改时间。
  * **post_modified_gmt** : 文章最后修改的GMT时间。
  * **post_content_filtered** : 过滤后的文章内容。
  * **post_parent** : 父文章ID（用于页面层级）。
  * **guid** : 全局唯一标识符。
  * **menu_order** : 菜单排序。
  * **post_type** : 文章类型（如 `post`、`page`）。
  * **post_mime_type** : 文章的 MIME 类型（用于附件）。
  * **comment_count** : 文章的评论数。

### 2\. `WP_Term` 对象

`WP_Term` 对象表示一个分类（taxonomy）项，比如分类目录、标签等。以下是 `WP_Term` 对象的固定属性：

  * **term_id** : 分类项的唯一标识符。
  * **name** : 分类项名称。
  * **slug** : 分类项别名。
  * **term_group** : 分类项组。
  * **term_taxonomy_id** : 分类法ID。
  * **taxonomy** : 分类法名称。
  * **description** : 分类项描述。
  * **parent** : 父分类项ID。
  * **count** : 分类项的文章数量。

### 3\. `WP_Comment` 对象

`WP_Comment` 对象表示一个评论。以下是 `WP_Comment` 对象的固定属性：

  * **comment_ID** : 评论的唯一标识符。
  * **comment_post_ID** : 评论所属文章的ID。
  * **comment_author** : 评论作者。
  * **comment_author_email** : 评论作者的电子邮件。
  * **comment_author_url** : 评论作者的URL。
  * **comment_author_IP** : 评论作者的IP地址。
  * **comment_date** : 评论日期。
  * **comment_date_gmt** : 评论的GMT日期。
  * **comment_content** : 评论内容。
  * **comment_karma** : 评论的Karma值。
  * **comment_approved** : 评论的审核状态。
  * **comment_agent** : 评论的用户代理。
  * **comment_type** : 评论类型（如 `pingback`、`trackback`）。
  * **comment_parent** : 父评论ID。
  * **user_id** : 评论作者的用户ID（如果评论作者是注册用户）。

### 4\. `WP_Option` 对象

`WP_Option` 对象表示一个 WordPress 配置选项。以下是 `WP_Option` 对象的固定属性：

  * **option_id** : 选项的唯一标识符。
  * **option_name** : 选项名称。
  * **option_value** : 选项值。
  * **autoload** : 是否自动加载这个选项（`yes` 或 `no`）。

### 5\. `WP_Query` 对象

`WP_Query` 对象用于查询和检索文章。以下是 `WP_Query` 对象的固定属性：

  * **query** : 查询参数数组。
  * **query_vars** : 查询变量数组。
  * **queried_object** : 查询的对象（如分类、作者等）。
  * **queried_object_id** : 查询对象的ID。
  * **request** : SQL 查询语句。
  * **posts** : 查询到的文章数组。
  * **post_count** : 查询到的文章数量。
  * **current_post** : 当前文章索引。
  * **in_the_loop** : 是否在循环中。
  * **found_posts** : 总共找到的文章数量。
  * **max_num_pages** : 最大页数。
  * **is_single** : 是否单篇文章。
  * **is_preview** : 是否预览。
  * **is_page** : 是否页面。
  * **is_archive** : 是否归档。
  * **is_date** : 是否日期归档。
  * **is_year** : 是否年份归档。
  * **is_month** : 是否月份归档。
  * **is_day** : 是否日期归档。
  * **is_time** : 是否时间归档。
  * **is_author** : 是否作者归档。
  * **is_category** : 是否分类归档。
  * **is_tag** : 是否标签归档。
  * **is_tax** : 是否自定义分类归档。
  * **is_search** : 是否搜索结果。
  * **is_feed** : 是否RSS订阅。
  * **is_comment_feed** : 是否评论订阅。
  * **is_trackback** : 是否Trackback。
  * **is_home** : 是否首页。
  * **is_404** : 是否404页面。
  * **is_paged** : 是否分页。
  * **is_admin** : 是否后台。
  * **is_attachment** : 是否附件。
  * **is_singular** : 是否单篇文章或页面。
  * **is_robots** : 是否robots.txt。
  * **is_posts_page** : 是否文章页。
  * **is_post_type_archive** : 是否自定义文章类型归档。

### 完整示例

以下是如何访问 `WP_Post` 对象的固定属性的示例：

    
    
    <?php
    require( dirname(__FILE__) . '/wp-load.php' );
    
    // 获取一篇文章对象
    $post = get_post(1); // 假设文章ID为1
    
    // 访问固定属性
    echo "Post ID: " . $post->ID . "<br>";
    echo "Post Author: " . $post->post_author . "<br>";
    echo "Post Date: " . $post->post_date . "<br>";
    echo "Post Content: " . $post->post_content . "<br>";
    echo "Post Title: " . $post->post_title . "<br>";
    echo "Post Status: " . $post->post_status . "<br>";
    echo "Post Name: " . $post->post_name . "<br>";
    echo "Post Type: " . $post->post_type . "<br>";
    ?>
    

通过这些固定属性，你可以轻松地管理和访问 WordPress 中的各种对象的信息。

