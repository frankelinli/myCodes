---
id: 194
title: 纯手工代码创建WordPress的Contact-About-Proudct-Login等页面
date: '2025-04-28T23:10:24'
author: haoye
categories:
  - notes
tags: []
url: https://haoyelaiga.com/%e7%ba%af%e6%89%8b%e5%b7%a5%e4%bb%a3%e7%a0%81%e5%88%9b%e5%bb%bawordpress%e7%9a%84contact-about-proudct-login%e7%ad%89%e9%a1%b5%e9%9d%a2/
---

作为站点管理员，在生产环境中创建 `Contact`、`About Us`、`Landing`、`Login` 和 `Product` 页面，应该遵循最佳实践以确保站点的性能、安全性和可维护性。以下是详细步骤和建议：

### 1. 使用一个通用的页面模板

创建一个通用页面模板可以简化管理和维护。

#### 创建通用页面模板

1. **在主题目录中创建一个新文件** `template-general.php`：

   “\`php\
   \<?php\
   /*\
   Template Name: General Page\&#xA;*/\
   get\_header();\
   ?>

   \<?php\
   // 获取当前页面的 slug\
   $page\_slug = $post->post\_name;

   ```
   // 根据 slug 加载不同的内容
   switch ($page_slug) {
       case 'contact':
           get_template_part('template-parts/content', 'contact');
           break;
       case 'about-us':
           get_template_part('template-parts/content', 'about-us');
           break;
       case 'landing':
           get_template_part('template-parts/content', 'landing');
           break;
       case 'login':
           get_template_part('template-parts/content', 'login');
           break;
       case 'product':
           get_template_part('template-parts/content', 'product');
           break;
       default:
           // 默认内容
           the_content();
           break;
   }
   ?>
   ```

   \<?php\
   get\_footer();\
   ?>\
   “\`

2. **在主题目录中创建 `template-parts` 文件夹**，并在其中创建以下文件，每个文件对应一种页面类型的内容：

   - `content-contact.php`
   - `content-about-us.php`
   - `content-landing.php`
   - `content-login.php`
   - `content-product.php`

#### 添加内容模板

##### content-contact.php

```
<div id="contact">
    <h1>Contact Us</h1>
    <form action="<?php the_permalink(); ?>" method="post">
        <label for="name">Name</label>
        <input type="text" id="name" name="name" required>

        <label for="email">Email</label>
        <input type="email" id="email" name="email" required>

        <label for="message">Message</label>
        <textarea id="message" name="message" required></textarea>

        <button type="submit">Send</button>
    </form>
</div>

<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = sanitize_text_field($_POST['name']);
    $email = sanitize_email($_POST['email']);
    $message = sanitize_textarea_field($_POST['message']);

    // 处理表单数据，例如发送电子邮件
    wp_mail('your-email@example.com', 'Contact Form Submission', $message, 'From: '.$name.' <'.$email.'>');

    echo '<p>Thank you for your message!</p>';
}
?>
```

##### content-about-us.php

```
<div id="about-us">
    <h1>About Us</h1>
    <p>Welcome to our company! Here is some information about us...</p>
    <!-- 添加更多关于公司的信息 -->
</div>
```

##### content-landing.php

```
<div id="landing">
    <h1>Welcome to Our Landing Page</h1>
    <p>This is our landing page. Here you can find more information about our services.</p>
    <!-- 添加更多营销内容和行动呼吁 -->
</div>
```

##### content-login.php

```
<div id="login">
    <h1>Login</h1>
    <?php wp_login_form(); ?>
</div>
```

##### content-product.php

```
<div id="product">
    <h1>Our Products</h1>
    <p>Here are some of our products:</p>
    <!-- 列出产品或产品详情 -->
</div>
```

### 2. 创建页面并应用模板

1. **登录到你的 WordPress 后台**。

2. **导航到 “页面” -> “新建页面”**。

3. **填写页面标题**（例如，”Contact”）。

4. 在右侧的 “页面属性” 框中，找到 “模板” 选项。

5. 从下拉菜单中选择 “General Page” 模板。

6. **发布页面**。

7. :::info

**确保每个页面的 slug** 与模板中的条件匹配，例如 `contact`、`about-us`、`landing`、`login`、`product`。

:::

### 3. 安全性和数据验证

确保处理用户输入时进行适当的清理和验证，以防止安全漏洞，例如跨站脚本（XSS）和SQL注入。

```
$name = sanitize_text_field($_POST['name']);
$email = sanitize_email($_POST['email']);
$message = sanitize_textarea_field($_POST['message']);
```

### 4. 添加自定义样式和脚本

为了确保不同页面具有统一的外观和交互性，可以在 `functions.php` 文件中添加自定义样式和脚本。

```
function enqueue_custom_styles_and_scripts() {
    wp_enqueue_style('custom-styles', get_template_directory_uri() . '/css/custom-styles.css');
    wp_enqueue_script('custom-scripts', get_template_directory_uri() . '/js/custom-scripts.js', array('jquery'), null, true);
}
add_action('wp_enqueue_scripts', 'enqueue_custom_styles_and_scripts');
```

### 5. 备份和测试

1. **备份站点**：在进行任何更改之前，确保对站点进行完整备份。
2. **测试页面**：在生产环境中发布之前，在开发环境或暂存环境中测试每个页面的功能和样式。

### 总结

通过创建一个通用的页面模板并将不同页面的内容分离到单独的 `content` 模板文件中，你可以有效地管理和维护多个页面。这种方法不仅减少了重复代码，还提高了代码的可维护性和扩展性，同时也避免了在页面模板列表中看到一长串模板选项的困扰。这种结构清晰、易于管理，并符合生产环境中的最佳实践。
