---
author: haoye
categories:
- 随记
date: '2025-05-09T00:14:35'
id: 258
tags: []
title: 使用wp_enqueue_script来加载JS和CSS
---

使用 `wp_enqueue_script` 而不是直接在 `<head>` 中插入脚本，有以下几个重要的原因：

# wp_enqueue_script 加载js

### 1\. **依赖管理**

`wp_enqueue_script` 允许你声明脚本的依赖关系。如果一个脚本依赖于另一个脚本（例如，许多脚本依赖于 jQuery），你可以通过
`wp_enqueue_script` 确保依赖脚本在正确的顺序加载。

    
    
    wp_enqueue_script('custom-js', get_template_directory_uri() . '/js/custom.js', array('jquery'), null, true);
    

在上面的代码中，`custom-js` 脚本依赖于 `jquery`，WordPress 会确保 `jquery` 在 `custom-js` 之前加载。

### 2\. **避免重复加载**

`wp_enqueue_script` 会跟踪所有被排队的脚本，避免重复加载同一个脚本。这样可以减少不必要的 HTTP 请求，提高页面加载速度。

### 3\. **插件兼容性**

通过 `wp_enqueue_script`
加载脚本，确保你的主题和插件可以互相兼容。插件开发者通常会使用相同的机制加载他们的脚本，这样可以避免脚本冲突和重复加载。

### 4\. **条件加载**

你可以根据特定条件加载脚本。例如，只在特定页面或模板加载某些脚本，这样可以减少页面的负载。

    
    
    if (is_page('contact')) {
        wp_enqueue_script('contact-form-js', get_template_directory_uri() . '/js/contact-form.js', array(), null, true);
    }
    

### 5\. **性能优化**

`wp_enqueue_script` 提供了一个 `in_footer` 参数，允许你在页面底部加载脚本，这样可以提高页面的初始渲染速度。

    
    
    wp_enqueue_script('custom-js', get_template_directory_uri() . '/js/custom.js', array(), null, true);
    

### 6\. **版本控制**

你可以通过 `wp_enqueue_script` 的第四个参数指定脚本的版本号，这样可以确保用户总是加载最新版本的脚本，避免缓存问题。

    
    
    wp_enqueue_script('custom-js', get_template_directory_uri() . '/js/custom.js', array(), '1.0.0', true);
    

### 7\. **兼容性检查**

WordPress 核心团队会定期更新 `wp_enqueue_script`
的实现，以确保它与最新的浏览器和最佳实践保持一致。使用这个函数可以保证你的网站在未来的兼容性。

### 总结

使用 `wp_enqueue_script` 加载 JavaScript 脚本，不仅可以利用 WordPress
提供的依赖管理、避免重复加载、性能优化等功能，还能确保你的主题和插件兼容性更好。如果你希望构建一个高效、可维护、与插件兼容的 WordPress
主题，强烈建议使用 `wp_enqueue_script` 来加载你的脚本。

* * *

# wp_enqueue_style加载CSS

当然，我可以帮您将这个Font
Awesome的CSS文件在functions.php中引入。这是一个很好的做法，因为它可以集中管理你的网站资源，并且可以更好地控制资源的加载。

在你的WordPress主题的functions.php文件中，你可以添加以下代码：

    
    
    function enqueue_font_awesome() {
        wp_enqueue_style('font-awesome', 'https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/font-awesome/4.7.0/css/font-awesome.min.css', array(), '4.7.0', 'all');
    }
    add_action('wp_enqueue_scripts', 'enqueue_font_awesome');
    

这段代码的工作原理如下：

  1. 我们定义了一个名为 `enqueue_font_awesome` 的函数。

  2. 在这个函数中，我们使用 WordPress 的 `wp_enqueue_style` 函数来正确地加载 CSS 文件。

  * 第一个参数 'font-awesome' 是这个样式的唯一标识符。
  * 第二个参数是 CSS 文件的 URL。
  * 第三个参数 `array()` 表示这个样式没有依赖其他样式。
  * 第四个参数 '4.7.0' 是版本号，有助于浏览器缓存管理。
  * 最后一个参数 'all' 表示这个样式适用于所有媒体类型。

  3. 我们使用 `add_action` 函数将 `enqueue_font_awesome` 函数挂钩到 WordPress 的 `wp_enqueue_scripts` 动作上。这确保了 CSS 文件会在适当的时候被加载。

将这段代码添加到你的functions.php文件后，WordPress将会在每个页面的`<head>`部分自动包含Font Awesome的CSS文件。

这种方法的优点包括：

  1. 集中管理：所有的脚本和样式引用都在一个地方管理。
  2. 更好的控制：你可以轻松地控制在哪些页面加载这个资源。
  3. 避免冲突：WordPress会自动处理重复加载的问题。
  4. 更易维护：如果需要更新Font Awesome版本，你只需要在一个地方修改。

记住，在添加这段代码后，你应该从你的HTML中移除原来的`<link>`标签，因为现在WordPress会自动处理Font Awesome的加载。

