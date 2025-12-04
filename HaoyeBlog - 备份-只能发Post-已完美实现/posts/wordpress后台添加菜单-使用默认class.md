---
id: 985
title: wordpress后台添加菜单-使用默认样式
slug: wordpress后台添加菜单-使用默认样式
categories:
  - notes
tags: []
---

本文提供WordPress后台菜单开发代码示例，展示如何添加一级菜单“导出文章URL”及其页面。页面使用默认WordPress样式类（如wrap、widefat），无需额外CSS即可保持后台风格统一。代码包含文章列表展示功能，可扩展为CSV导出等。

---

在WordPress写个后台一级菜单，使用WordPress的默认类样式。下面是一个完整的 WordPress 插件式代码示例，它会在后台左侧添加一个一级菜单“导出文章URL”，点击后进入一个页面，展示文章列表（标题 + 链接），并使用 WordPress 后台默认样式（只写 class，不加任何 CSS，这样它会使用后台默认样式，足够了，又方便快捷）。

[pay_content]这里是付费内容，只有支付后才能看到.

![image-20251015215947270](https://haoyelaiga.com/wp-content/uploads/2025/10/image-20251015215947270.webp)

### 📦 完整代码示例：创建后台一级菜单页面

将这段代码放入你的插件文件或主题的 `functions.php` 中：

```php
<?php
// 注册后台菜单
add_action('admin_menu', function() {
  add_menu_page(
    '导出文章URL',         // 页面标题
    '导出文章URL',         // 菜单标题
    'manage_options',       // 权限
    'export-post-urls',     // slug
    'export_post_urls',     // 回调函数
    'dashicons-download',   // 图标（可选）
    25                      // 菜单位置（可选）
  );
});

// 页面内容回调函数
function export_post_urls() {
  echo '<div class="wrap">';
  echo '<h1>导出文章URL</h1>';

  // 成功提示（可选）
  echo '<div class="notice notice-success"><p>以下是所有文章的链接：</p></div>';

  // 导出按钮（可扩展为下载 CSV）
  echo '<a href="#" class="button button-primary">导出为 CSV</a>';

  // 查询文章
  $posts = get_posts([
    'numberposts' => -1,
    'post_type' => 'post',
    'post_status' => 'publish',
  ]);

  // 表格展示
  echo '<table class="widefat striped">';
  echo '<thead><tr><th>标题</th><th>链接</th></tr></thead>';
  echo '<tbody>';
  foreach ($posts as $post) {
    $title = esc_html($post->post_title);
    $url = esc_url(get_permalink($post));
    echo "<tr><td>{$title}</td><td><a href='{$url}' target='_blank'>{$url}</a></td></tr>";
  }
  echo '</tbody>';
  echo '</table>';

  echo '</div>';
}
```

### 说明

- ✅ 使用了 `wrap`、`widefat`、`button`、`notice` 等后台标准 class。
- ✅ 所有样式都自动继承 WordPress 后台，无需额外 CSS。
- ✅ 可扩展为 CSV 下载、筛选文章类型、分页等功能。
- ✅ 图标使用了 `dashicons-download`，你也可以换成其他 Dashicons 图标。

### 添加一个二级菜单页面（使用默认 class）

一个简单的 WordPress 后台页面，挂在某个已有一级菜单下作为二级菜单项，并且页面内容只展示基础结构，使用默认 class，不加任何样式。下面是最简洁的实现方式：

```php
<?php
add_action('admin_menu', function() {
  // 添加到“设置”菜单下（也可以换成其他父菜单）
  add_submenu_page(
    'options-general.php',     // 父级菜单 slug（这里是“设置”）
    '导出文章URL',             // 页面标题
    '导出文章URL',             // 子菜单标题
    'manage_options',          // 所需权限
    'export-post-urls',        // 子菜单 slug
    'export_post_urls'         // 回调函数:写到funcstions.php
  );
});

```

![image-20251015222155754](https://haoyelaiga.com/wp-content/uploads/2025/10/image-20251015222155754.webp)

### 页面效果说明

- 页面标题使用 `<h1>`，自动继承后台字体和间距。
- 描述文字使用 `description` 类，风格与后台一致。
- 按钮使用 `button button-primary`，是 WordPress 默认的蓝色主按钮。
- 所有结构都包裹在 `wrap` 容器中，确保页面宽度和排版符合后台规范。

如果你想挂在其他菜单下，比如你自己的插件菜单，只需把 `options-general.php` 改成你自己的 slug。

:::tip :+1:

这样就掌握了WordPress 后台开发的一个关键理念：**只用 class，不写 CSS，就能自动继承后台样式**。这不仅让页面风格统一，还能减少维护成本，避免样式冲突。

:::



WordPress 后台菜单系统不仅强大，而且高度可扩展。掌握它之后，你可以构建出专业级的插件界面、工具页、内容管理系统，甚至是完整的 SaaS 控制台。下面我来系统性地讲解 WordPress 后台菜单的核心知识点、技术细节、常用函数和最佳实践。

## 后台菜单系统的核心结构

WordPress 后台菜单由两类组成：

| 类型     | 函数                 | 说明                             |
| -------- | -------------------- | -------------------------------- |
| 一级菜单 | `add_menu_page()`    | 创建左侧主菜单项                 |
| 二级菜单 | `add_submenu_page()` | 添加子菜单项，挂在某个一级菜单下 |

每个菜单项都可以绑定一个页面回调函数，用于渲染页面内容。

------

## 常用函数详解

### 1. `add_menu_page()`

创建一级菜单：

```php
add_menu_page(
  $page_title,       // 页面标题
  $menu_title,       // 菜单标题
  $capability,       // 权限（如 'manage_options'）
  $menu_slug,        // 唯一标识
  $callback,         // 页面内容函数
  $icon_url,         // 图标（dashicons 或 URL）
  $position          // 菜单位置（数字）
);
```

### 2. `add_submenu_page()`

添加子菜单：

```php
add_submenu_page(
  $parent_slug,      // 父菜单 slug
  $page_title,
  $menu_title,
  $capability,
  $menu_slug,
  $callback
);
```

### 3. `remove_menu_page()` / `remove_submenu_page()`

隐藏菜单项（常用于权限控制或简化界面）：

```php
remove_menu_page('tools.php');
remove_submenu_page('options-general.php', 'privacy.php');
```

------

## 技术细节与扩展技巧

### ✅ 权限控制

使用 `current_user_can()` 判断用户是否有权限访问菜单或页面。

### ✅ 图标使用

使用 Dashicons 图标类名，例如：

```php
'dashicons-admin-tools'
'dashicons-download'
'dashicons-media-document'
```

完整图标列表：[Dashicons 官方文档](https://developer.wordpress.org/resource/dashicons/)

### ✅ 页面结构建议

使用 WordPress 默认 class，如：

- `wrap`：页面容器
- `button`, `button-primary`：按钮
- `widefat`, `striped`：表格
- `form-table`：表单字段
- `notice notice-success`：提示框

### ✅ 页面 URL

后台页面的访问路径为：

```
wp-admin/admin.php?page=你的菜单slug
```

------

## 常见菜单挂载点（父级 slug）

| 菜单名称   | 父级 slug             |
| ---------- | --------------------- |
| 设置       | `options-general.php` |
| 工具       | `tools.php`           |
| 外观       | `themes.php`          |
| 插件       | `plugins.php`         |
| 用户       | `users.php`           |
| 自定义菜单 | 你自己定义的 slug     |

------

## 高级玩法

### 动态菜单生成

根据用户角色、插件状态、选项值动态添加或隐藏菜单。

### React + PHP 混合后台

使用 `admin_enqueue_scripts()` 加载 React 应用，结合 REST API 构建现代化后台界面

### 菜单简化插件

使用插件如 *Simplify Admin Menus* 来隐藏不必要的菜单项，提升用户体验  

------

## 最佳实践

- ✅ 使用默认 class，保持样式一致性
- ✅ 权限控制严谨，避免暴露敏感功能
- ✅ 菜单结构清晰，避免混乱
- ✅ 页面内容模块化，便于维护
- ✅ 图标统一，提升辨识度
- ✅ 页面 slug 命名规范，避免冲突

[Microsoft Copilot: Your AI companion](https://copilot.microsoft.com/chats/qMGUvqEJeAssyAfedKDZH)

 [/pay_content]
