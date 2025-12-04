---
id: 575
title: WordPress管理后台设置里添加维护模式开关
slug: WordPress管理后台设置里添加维护模式开关
categories:
  - notes
tags: []
---

自己在WordPress管理后台的“设置”里添加“维护模式”开关。

- 维护模式下返回503状态码，对SEO更友好
- 管理员可以继续正常访问站点
- 简单的开关控制
- 维护模式菜单移到"设置"菜单下

![image-20250920163345190](https://images.haoyelaiga.com/image-20250920163345190.png)

![image-20250920163552965](https://images.haoyelaiga.com/image-20250920163552965.png)

```php

// 添加维护模式功能
function csrwiki_maintenance_mode() {
    // 添加设置菜单 - 放到"设置"下
    add_action('admin_menu', function() {
        add_options_page(
            '维护模式设置', 
            '维护模式', 
            'manage_options', 
            'maintenance-settings', 
            'csrwiki_maintenance_settings_page'
        );
    });

    // 注册设置
    add_action('admin_init', function() {
        register_setting('maintenance-settings-group', 'maintenance_mode_active');
    });

    // 在wp加载早期检查维护模式
    add_action('wp', 'csrwiki_check_maintenance_mode');
}
// 检查维护模式状态
function csrwiki_check_maintenance_mode() {
    // 如果维护模式已启用且当前用户不是管理员
    if (get_option('maintenance_mode_active') && !current_user_can('manage_options')) {
        // 确保不是wp-admin页面
        if (!is_admin() && !wp_doing_ajax()) {
            wp_die(
                '<div style="text-align: center; padding: 50px 20px;">
                    <h1>网站维护中</h1>
                    <p>我们正在进行系统维护，请稍后再访问。</p>
                </div>',
                '网站维护中',
                array(
                    'response' => 503,
                    'back_link' => false,
                )
            );
        }
    }
}

// 设置页面HTML
function csrwiki_maintenance_settings_page() {
    ?>
    <div class="wrap">
        <h1>维护模式设置</h1>
        <form method="post" action="options.php">
            <?php settings_fields('maintenance-settings-group'); ?>
            <?php do_settings_sections('maintenance-settings-group'); ?>
            <table class="form-table">
                <tr>
                    <th scope="row">维护模式状态</th>
                    <td>
                        <label>
                            <input type="checkbox" name="maintenance_mode_active" value="1" <?php checked(1, get_option('maintenance_mode_active'), true); ?> />
                            启用维护模式
                        </label>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}

// 初始化维护模式功能
csrwiki_maintenance_mode();
```

### 如果开关不开启，代码就不工作，不会影响性能

是的，性能影响可以忽略不计。让我解释代码执行过程：

1. 插件注册了两个主要行为：
   - admin_menu hook：仅在后台运行时加载
   - admin_init hook：仅在后台运行时加载
   - wp hook：虽然每次都会执行，但只是一个简单的条件判断

2. 具体分析维护模式关闭时的执行流程：
```php
function csrwiki_check_maintenance_mode() {
    // 当维护模式未开启时，这个if判断直接返回
    if (get_option('maintenance_mode_active') && !current_user_can('manage_options')) {
        // 维护模式关闭时，这里面的代码完全不会执行
    }
}
```

性能开销极小，原因：
- get_option() 是WordPress核心函数，有内置缓存
- 条件判断失败后立即返回
- 没有额外的数据库查询
- 没有额外的文件加载
- 不会执行任何DOM操作

所以你完全不用担心性能问题。这是一个非常轻量级的功能实现。
