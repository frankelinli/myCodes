---
id: 214
title: inc里的小功能设置开启关闭按钮
slug: inc%e9%87%8c%e7%9a%84%e5%b0%8f%e5%8a%9f%e8%83%bd%e8%ae%be%e7%bd%ae%e5%bc%80%e5%90%af%e5%85%b3%e9%97%ad%e6%8c%89%e9%92%ae
date: '2025-05-03T23:07:58'
categories:
  - notes
tags: []
url: https://haoyelaiga.com/inc%e9%87%8c%e7%9a%84%e5%b0%8f%e5%8a%9f%e8%83%bd%e8%ae%be%e7%bd%ae%e5%bc%80%e5%90%af%e5%85%b3%e9%97%ad%e6%8c%89%e9%92%ae/
---

下面是一个简化版的功能加载器，它会自动检测 inc 目录中的所有 PHP 文件，并让用户选择性地启用它们。当你需要添加新功能时，只需在 inc 目录中创建新的 PHP 文件，系统会自动将其添加到设置页面中。

```
/**
 * 添加主题设置页面
 */
function haowiki_theme_settings_page() {
    add_menu_page(
        '主题功能设置',
        '主题功能',
        'manage_options',
        'haowiki-settings',
        'haowiki_render_settings_page',
        'dashicons-admin-generic',
        60
    );
}
add_action('admin_menu', 'haowiki_theme_settings_page');

/**
 * 渲染设置页面
 */
function haowiki_render_settings_page() {
    ?>
    <div class="wrap">
        <h1>主题功能设置</h1>
        <form method="post" action="options.php">
            <?php
            settings_fields('haowiki_theme_options');
            do_settings_sections('haowiki-settings');
            submit_button();
            ?>
        </form>
    </div>
    <?php
}

/**
 * 获取inc目录中的所有PHP文件
 */
function haowiki_get_inc_files() {
    $inc_dir = get_stylesheet_directory() . '/inc';
    $files = array();

    if (is_dir($inc_dir)) {
        $dir_contents = scandir($inc_dir);

        foreach ($dir_contents as $file) {
            $file_path = $inc_dir . '/' . $file;
            if (is_file($file_path) && pathinfo($file_path, PATHINFO_EXTENSION) === 'php') {
                // 获取不带扩展名的文件名作为功能ID
                $module_id = pathinfo($file, PATHINFO_FILENAME);

                // 读取文件头部注释以获取功能名称
                $file_content = file_get_contents($file_path);
                $module_name = $module_id; // 默认名称

                // 尝试从文件注释中提取功能名称
                if (preg_match('/\*\s*功能名称:\s*(.+)$/mi', $file_content, $matches)) {
                    $module_name = trim($matches[1]);
                }

                $files[$module_id] = array(
                    'name' => $module_name,
                    'path' => $file_path
                );
            }
        }
    }

    return $files;
}

/**
 * 注册设置选项
 */
function haowiki_register_settings() {
    register_setting('haowiki_theme_options', 'haowiki_enabled_modules');

    add_settings_section(
        'haowiki_modules_section',
        '可用功能模块',
        function() { echo '选择要启用的功能模块:'; },
        'haowiki-settings'
    );

    // 自动获取模块列表
    $modules = haowiki_get_inc_files();
    $enabled_modules = get_option('haowiki_enabled_modules', array());

    // 添加复选框
    foreach ($modules as $id => $module) {
        add_settings_field(
            'module_' . $id,
            $module['name'],
            function() use ($id, $enabled_modules) {
                $checked = in_array($id, (array)$enabled_modules) ? 'checked' : '';
                echo '<input type="checkbox" id="' . $id . '" name="haowiki_enabled_modules[]" value="' . $id . '" ' . $checked . '>';
            },
            'haowiki-settings',
            'haowiki_modules_section'
        );
    }
}
add_action('admin_init', 'haowiki_register_settings');

/**
 * 加载已启用的模块
 */
function haowiki_load_enabled_modules() {
    $enabled_modules = get_option('haowiki_enabled_modules', array());
    $available_modules = haowiki_get_inc_files();

    // 加载启用的模块
    foreach ((array)$enabled_modules as $module_id) {
        if (isset($available_modules[$module_id])) {
            require_once $available_modules[$module_id]['path'];
        }
    }
}
add_action('after_setup_theme', 'haowiki_load_enabled_modules');
```

### 使用方法：

1. 将此代码添加到你的子主题的 functions.php 文件中
2. 确保你的子主题中有 inc 目录
3. 在 inc 目录中创建功能模块的 PHP 文件
4. 在每个 PHP 文件头部添加注释以说明功能名称（可选）

### PHP 文件头部注释示例：

```
<?php
/**
 * 功能名称: 阅读按钮功能
 * 描述: 为文章列表添加"阅读"按钮
 */

// 功能代码...
```

这个简化版本会：

1. 自动扫描 inc 目录中的所有 PHP 文件
2. 尝试从文件注释中获取功能名称（如果没有注释，则使用文件名）
3. 在设置页面中显示所有可用功能模块
4. 只加载用户选择启用的模块

这种方法的优点是：

- 你不需要手动更新模块列表，系统会自动检测新添加的文件
- 每个功能都保持在独立的文件中，便于维护
- 用户可以轻松选择需要的功能
