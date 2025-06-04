这段代码会在主菜单的末尾添加一个"显示钩子"按钮，点击后会在当前URL后添加

`show_hooks=1`参数并重新加载页面。按钮设置了特殊的样式使其更容易被注意到，且只对管理员可见。

我将使用wp_nav_menu_items钩子在主菜单末尾添加一个显示钩子的按钮，仅对管理员可见。

```php
/**
 * 在主菜单的末尾添加一个"显示钩子"按钮
 */
function haowiki_add_hook_viewer_to_menu($items, $args) {
    // 只在前台显示，并且只对管理员显示
    if (is_admin() || !current_user_can('administrator')) {
        return $items;
    }
    
    // 确保我们只在主菜单添加按钮
    // 注意：'primary'是大多数主题的主菜单位置，您可能需要根据Astra主题调整
    if ($args->theme_location != 'primary') {
        return $items;
    }
    
    // 获取当前URL
    $current_url = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
    
    // 检查URL中是否已有参数
    $separator = (strpos($current_url, '?') !== false) ? '&' : '?';
    
    // 生成带有show_hooks参数的URL
    $hooks_url = $current_url . $separator . 'show_hooks=1';
    
    // 创建按钮HTML
    $hook_button = '<li class="menu-item hook-viewer-menu-item">';
    $hook_button .= '<a href="' . esc_url($hooks_url) . '" style="background-color: #2271b1; color: white; padding: 0 15px; border-radius: 3px; margin-left: 10px;">';
    $hook_button .= '显示钩子';
    $hook_button .= '</a></li>';
    
    // 将按钮添加到菜单末尾
    return $items . $hook_button;
}
add_filter('wp_nav_menu_items', 'haowiki_add_hook_viewer_to_menu', 10, 2);

/**
 * 为菜单中的钩子按钮添加样式
 */
function haowiki_add_menu_button_styles() {
    // 只在前台为管理员添加样式
    if (is_admin() || !current_user_can('administrator')) {
        return;
    }
    
    ?>
    <style>
        .hook-viewer-menu-item a {
            background-color: #2271b1 !important;
            color: white !important;
            transition: background-color 0.3s !important;
        }
        .hook-viewer-menu-item a:hover {
            background-color: #135e96 !important;
            color: white !important;
        }
    </style>
    <?php
}
add_action('wp_head', 'haowiki_add_menu_button_styles');
```



如果按钮没有显示出来，可能需要根据Astra主题调整菜单位置标识符。Astra主题的主菜单位置可能是'primary'、'main_menu'或其他标识符。您可以通过在functions.php中添加以下测试代码来查看所有已注册的菜单位置：

```php
function haowiki_debug_menu_locations() {
    if (current_user_can('administrator')) {
        echo '<pre>';
        print_r(get_registered_nav_menus());
        echo '</pre>';
    }
}
add_action('wp_footer', 'haowiki_debug_menu_locations');
```

然后根据输出结果调整上述代码中的菜单位置标识符。