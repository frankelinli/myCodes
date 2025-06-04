WordPress中除了`bloginfo()`函数外，还有许多类似的函数用于获取和显示网站各种信息，包括内容信息、主题信息、用户信息等。这些函数是WordPress主题开发的重要工具，可以帮助站长轻松获取所需的数据并显示在页面中。

![image-20250513232826635](C:\Users\wingxu\AppData\Roaming\Typora\typora-user-images\image-20250513232826635.png)

## 核心信息获取函数汇总

```php
<?php
function display_wordpress_info_functions() {
    ?>
    <div class="wp-info-container">
        <h2>WordPress 信息获取函数示例</h2>
        
        <h3>站点基本信息</h3>
        <ul>
            <li><strong>bloginfo('name')</strong>: <?php bloginfo('name'); ?></li>
            <li><strong>get_bloginfo('url')</strong>: <?php echo get_bloginfo('url'); ?></li>
            <li><strong>home_url()</strong>: <?php echo home_url(); ?></li>
            <li><strong>site_url()</strong>: <?php echo site_url(); ?></li>
        </ul>
        
        <h3>主题相关信息</h3>
        <ul>
            <li><strong>get_template_directory_uri()</strong>: <?php echo get_template_directory_uri(); ?></li>
            <li><strong>get_stylesheet_directory_uri()</strong>: <?php echo get_stylesheet_directory_uri(); ?></li>
            <li><strong>wp_get_theme()->get('Name')</strong>: <?php echo wp_get_theme()->get('Name'); ?></li>
            <li><strong>wp_get_theme()->get('Version')</strong>: <?php echo wp_get_theme()->get('Version'); ?></li>
        </ul>
        
        <h3>文章/页面信息</h3>
        <ul>
            <?php if(is_singular()) : ?>
                <li><strong>the_title()</strong>: <?php the_title(); ?></li>
                <li><strong>get_the_title()</strong>: <?php echo get_the_title(); ?></li>
                <li><strong>get_the_ID()</strong>: <?php echo get_the_ID(); ?></li>
                <li><strong>get_permalink()</strong>: <?php echo get_permalink(); ?></li>
                <li><strong>get_the_date()</strong>: <?php echo get_the_date(); ?></li>
                <li><strong>get_the_author()</strong>: <?php echo get_the_author(); ?></li>
                <li><strong>get_the_author_meta('display_name')</strong>: <?php echo get_the_author_meta('display_name'); ?></li>
            <?php else : ?>
                <li>这些函数需要在WordPress循环内使用</li>
            <?php endif; ?>
        </ul>
        
        <h3>分类/标签信息</h3>
        <ul>
            <?php if(is_category()) : ?>
                <li><strong>single_cat_title()</strong>: <?php single_cat_title(); ?></li>
                <li><strong>category_description()</strong>: <?php echo category_description(); ?></li>
            <?php elseif(is_tag()) : ?>
                <li><strong>single_tag_title()</strong>: <?php single_tag_title(); ?></li>
                <li><strong>tag_description()</strong>: <?php echo tag_description(); ?></li>
            <?php else : ?>
                <li>这些函数需要在分类或标签页面使用</li>
            <?php endif; ?>
        </ul>
        
        <h3>用户信息</h3>
        <ul>
            <?php if(is_user_logged_in()) : ?>
                <li><strong>wp_get_current_user()->display_name</strong>: <?php echo wp_get_current_user()->display_name; ?></li>
                <li><strong>wp_get_current_user()->user_email</strong>: <?php echo wp_get_current_user()->user_email; ?></li>
            <?php else : ?>
                <li>用户未登录</li>
            <?php endif; ?>
        </ul>
        
        <h3>菜单和小工具相关</h3>
        <ul>
            <li><strong>has_nav_menu('primary')</strong>: <?php echo has_nav_menu('primary') ? 'Yes' : 'No'; ?></li>
            <li><strong>is_active_sidebar('sidebar-1')</strong>: <?php echo is_active_sidebar('sidebar-1') ? 'Yes' : 'No'; ?></li>
        </ul>
    </div>

    <style>
        .wp-info-container {
            max-width: 900px;
            margin: 20px auto;
            padding: 20px;
            background: #fff;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            border-radius: 5px;
        }
        .wp-info-container h2 {
            color: #23282d;
            border-bottom: 2px solid #00a0d2;
            padding-bottom: 10px;
        }
        .wp-info-container h3 {
            color: #0073aa;
            margin-top: 20px;
            background: #f7f7f7;
            padding: 8px;
            border-left: 4px solid #00a0d2;
        }
        .wp-info-container ul {
            list-style: none;
            padding-left: 10px;
        }
        .wp-info-container li {
            margin-bottom: 8px;
            padding: 8px;
            background: #f9f9f9;
            border-bottom: 1px solid #eee;
        }
        .wp-info-container strong {
            color: #e44;
            font-family: monospace;
        }
    </style>
    <?php
}

// 在主题中调用此函数
// add_action('wp_footer', 'display_wordpress_info_functions');
?>
```

## 常用的WordPress信息获取函数分类

### 1. 站点基本信息函数

- `bloginfo()` - 输出网站信息
- `get_bloginfo()` - 获取网站信息
- `home_url()` - 获取网站首页URL
- `site_url()` - 获取WordPress安装URL
- `admin_url()` - 获取管理后台URL
- `get_locale()` - 获取当前语言设置

### 2. 主题相关函数

- `get_template_directory()` - 获取父主题目录路径
- `get_template_directory_uri()` - 获取父主题URL
- `get_stylesheet_directory()` - 获取当前主题目录路径
- `get_stylesheet_directory_uri()` - 获取当前主题URL
- `wp_get_theme()` - 获取主题对象
- `get_theme_mod()` - 获取主题自定义设置

### 3. 文章/页面信息函数

- `the_title()` - 输出文章标题
- `get_the_title()` - 获取文章标题
- `the_content()` - 输出文章内容
- `get_the_content()` - 获取文章内容
- `the_excerpt()` - 输出文章摘要
- `get_the_excerpt()` - 获取文章摘要
- `the_permalink()` - 输出文章永久链接
- `get_permalink()` - 获取文章永久链接
- `the_ID()` - 输出文章ID
- `get_the_ID()` - 获取文章ID
- `get_post_type()` - 获取文章类型
- `get_post_meta()` - 获取文章元数据

### 4. 分类/标签/分类法信息函数

- `single_cat_title()` - 输出当前分类名称
- `single_tag_title()` - 输出当前标签名称
- `the_category()` - 输出文章分类列表
- `get_the_category()` - 获取文章分类对象
- `the_tags()` - 输出文章标签列表
- `get_the_tags()` - 获取文章标签对象
- `get_taxonomy()` - 获取分类法信息
- `get_term()` - 获取分类项信息

### 5. 用户相关函数

- `wp_get_current_user()` - 获取当前用户对象
- `get_userdata()` - 获取用户数据
- `get_the_author()` - 获取文章作者名称
- `get_the_author_meta()` - 获取作者元数据
- `is_user_logged_in()` - 检查用户是否已登录

### 6. 菜单和小工具相关函数

- `wp_nav_menu()` - 显示导航菜单
- `has_nav_menu()` - 检查菜单位置是否注册
- `is_active_sidebar()` - 检查边栏是否激活
- `dynamic_sidebar()` - 显示动态边栏

### 7. 查询相关函数

- `is_home()` - 检查是否为博客首页
- `is_front_page()` - 检查是否为网站首页
- `is_single()` - 检查是否为单篇文章页面
- `is_page()` - 检查是否为页面
- `is_category()` - 检查是否为分类页面
- `is_tag()` - 检查是否为标签页面
- `is_archive()` - 检查是否为归档页面
- `is_search()` - 检查是否为搜索结果页面

使用这些函数时，记得良好的做法是将相关功能模块化，这样可以更容易地维护代码。例如，你可以创建单独的函数来处理特定类型的信息获取，然后在需要的地方调用这些函数。