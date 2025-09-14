---
id: 238
title: 使用SCF自定义字段实现作者头像
date: '2025-05-06T22:00:54'
author: haoye
categories:
  - notes
tags: []
url: https://haoyelaiga.com/%e4%bd%bf%e7%94%a8scf%e8%87%aa%e5%ae%9a%e4%b9%89%e5%ad%97%e6%ae%b5%e5%ae%9e%e7%8e%b0%e4%bd%9c%e8%80%85%e5%a4%b4%e5%83%8f/
---

在使用 Astra 子主题时，结合 Astra 的钩子和 ACF （SCF）来实现 **自定义作者头像** 是一个非常灵活的方法。以下是完整的实现步骤，包括如何利用 Astra 的钩子系统与 ACF 配合，动态显示作者头像。

## **1. Astra 钩子简介**

Astra 提供了丰富的钩子（Hooks），可以让你在主题的特定位置插入自定义内容，而无需直接修改主题核心文件。

常用的 Astra 钩子包括：\
– `astra_entry_top`：文章内容顶部。\
– `astra_entry_bottom`：文章内容底部。\
– `astra_after_entry_content`：文章内容之后。\
– `astra_before_entry_content`：文章内容之前。\
– `astra_primary_content_top`：主内容区域顶部。\
– `astra_primary_content_bottom`：主内容区域底部。

在这里，我们可以通过钩子在文章页面（如 `single.php` 模板）中显示作者头像。

***

## **2. 创建 ACF 自定义字段**

如果你还没有为作者添加头像字段，可以按照以下步骤操作：

### **步骤 1：安装 ACF 插件**

- 安装并激活 **Advanced Custom Fields** 插件。

### **步骤 2：添加自定义头像字段**

1. 进入 WordPress 后台，点击 **Custom Fields > Add New**。
2. 创建一个新的字段组，命名为 **“作者头像”**。
3. 添加一个字段：\
   – **Field Label**：头像\
   – **Field Name**：`custom_author_avatar`\
   – **Field Type**：选择 **Image**。\
   – **Return Format**：选择 `Image URL` 或 `Image Array`（推荐选择 `Image Array`，方便后续调用）。
4. 设置字段组的显示规则：\
   – **Location**：选择 **User Role** 等于 **所有角色** 或者指定为 **Author**。
5. 保存字段组。

这样，每个用户在后台 **用户 > 编辑** 页面中都可以上传头像。

***

## **3. 使用 Astra 钩子显示作者头像**

接下来，我们通过 Astra 钩子将作者头像动态显示在文章页面的适当位置。

### **步骤 1：在子主题的 functions.php 文件中添加代码**

将以下代码添加到 Astra 子主题的 `functions.php` 文件中：

```
<?php
// 使用 Astra 钩子在文章内容顶部显示作者头像
add_action('astra_entry_top', 'display_custom_author_avatar');

function display_custom_author_avatar() {
    // 仅在单篇文章页面显示
    if (!is_single()) {
        return;
    }

    // 获取文章作者的 ID
    $author_id = get_the_author_meta('ID');

    // 获取作者头像字段（ACF）
    $author_avatar = get_field('custom_author_avatar', 'user_' . $author_id);

    // 如果设置了自定义头像，显示头像；否则显示默认 Gravatar
    if ($author_avatar) {
        echo '<div class="custom-author-avatar" style="text-align: center; margin-bottom: 20px;">';
        echo '<img src="' . esc_url($author_avatar['url']) . '" alt="作者头像" style="width: 100px; height: 100px; border-radius: 50%;">';
        echo '</div>';
    } else {
        // 显示默认 Gravatar
        echo '<div class="custom-author-avatar" style="text-align: center; margin-bottom: 20px;">';
        echo get_avatar($author_id, 100);
        echo '</div>';
    }
}
?>
```

***

### **步骤 2：代码解析**

1. **钩子 `astra_entry_top`**：\
   – 这个钩子会在文章内容的顶部运行，适合用来显示作者头像。

2. **`is_single()`**：\
   – 确保头像只在单篇文章页面显示，而不会出现在文章列表、页面等其他地方。

3. **`get_the_author_meta('ID')`**：\
   – 获取当前文章的作者 ID。

4. **`get_field('custom_author_avatar', 'user_' . $author_id)`**：\
   – 使用 ACF 的 `get_field()` 函数获取用户的自定义头像字段。\
   – 注意：ACF 的用户字段需要加上 `user_` 前缀。

5. **回退到默认 Gravatar**：\
   – 如果作者没有设置自定义头像，使用 WordPress 默认的 `get_avatar()` 函数显示 Gravatar 头像。

6. **样式调整**：\
   – 使用简单的行内样式（如 `border-radius: 50%`）将头像显示为圆形。你也可以通过 CSS 文件进一步调整样式。

***

## **4. 自定义样式（可选）**

你可以通过 Astra 子主题的 `style.css` 文件进一步美化头像样式：

```
.custom-author-avatar {
    text-align: center;
    margin-bottom: 20px;
}

.custom-author-avatar img {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

***

## **5. 测试效果**

1. 上传作者头像：\
   – 登录 WordPress 后台，点击 **用户 > 编辑用户**，在“作者头像”字段上传头像。

2. 查看前端页面：\
   – 打开单篇文章页面，确认头像显示在文章内容的顶部。

***

## **6. 如果需要显示更多作者信息**

如果你希望显示更多作者信息（如作者姓名、简介、社交链接等），可以扩展代码，例如：

```
<?php
add_action('astra_entry_top', 'display_custom_author_info');

function display_custom_author_info() {
    if (!is_single()) {
        return;
    }

    $author_id = get_the_author_meta('ID');
    $author_avatar = get_field('custom_author_avatar', 'user_' . $author_id);
    $author_name = get_the_author();
    $author_bio = get_the_author_meta('description');

    echo '<div class="custom-author-info" style="text-align: center; margin-bottom: 20px;">';

    // 显示头像
    if ($author_avatar) {
        echo '<img src="' . esc_url($author_avatar['url']) . '" alt="作者头像" style="width: 100px; height: 100px; border-radius: 50%;">';
    } else {
        echo get_avatar($author_id, 100);
    }

    // 显示作者姓名
    echo '<h3 style="margin: 10px 0;">' . esc_html($author_name) . '</h3>';

    // 显示作者简介
    if ($author_bio) {
        echo '<p>' . esc_html($author_bio) . '</p>';
    }

    echo '</div>';
}
?>
```

***

## **总结**

1. **钩子使用**：利用 Astra 的钩子（如 `astra_entry_top`）轻松插入自定义内容。
2. **ACF 配合**：通过 ACF 为用户添加自定义字段（头像），获取并显示在前端页面。
3. **样式调整**：通过简单的 CSS 美化头像展示效果。

这种方式既能利用 Astra 的钩子灵活插入内容，又能通过 ACF 提供强大的字段管理功能，非常适合站长快速实现定制化功能！
