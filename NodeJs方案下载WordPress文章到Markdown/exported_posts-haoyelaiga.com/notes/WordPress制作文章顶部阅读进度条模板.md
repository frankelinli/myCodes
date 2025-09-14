---
id: 132
title: WordPress制作文章顶部阅读进度条模板
date: '2025-04-19T12:17:14'
author: haoye
categories:
  - notes
tags: []
url: https://haoyelaiga.com/wordpress%e5%88%b6%e4%bd%9c%e6%96%87%e7%ab%a0%e9%a1%b6%e9%83%a8%e9%98%85%e8%af%bb%e8%bf%9b%e5%ba%a6%e6%9d%a1%e6%a8%a1%e6%9d%bf/
---

在WordPress博客中添加阅读进度条可以显著提升用户体验，鼓励读者完成整篇文章的阅读。本文将介绍如何使用jQuery以模块化的方式在WordPress主题中实现这一功能，使代码更易于维护和管理。

## 实现步骤

### 1. 创建目录结构

在你的子主题目录中创建一个新的文件夹，命名为`template-parts`。

### 2. 创建PHP模板文件

在`template-parts`文件夹中创建一个名为`reading-progress-bar.php`的文件，内容如下：

```
<?php
/**
 * Template part for displaying reading progress bar
 *
 * @package Your_Theme_Name
 */

if ( !is_single() ) {
    return;
}
?>

<div id="reading-progress"></div>

<script src="<?php echo get_stylesheet_directory_uri(); ?>/template-parts/reading-progress-bar.js"></script>
```

:::tip

`if ( !is_single() ) {
return;
}`的作用分析：

这段代码的作用是确保阅读进度条只在单篇文章页面显示。让我详细解释一下：

1. `is_single()` 是一个 WordPress 函数：\
   – 当访问的是单篇文章页面时，它返回 true。\
   – 在其他页面（如首页、分类页、标签页等）返回 false。

2. `!is_single()` 对 `is_single()` 的结果进行取反：\
   – 在非单篇文章页面时为 true。\
   – 在单篇文章页面时为 false。

3. `if ( !is_single() ) { return; }` 的逻辑是：\
   – 如果不是单篇文章页面，立即返回，不执行后面的代码。\
   – 这样可以确保进度条只在单篇文章页面显示。

4. `?>` 标记 PHP 代码段的结束。在这个条件判断之后，如果条件不满足（即是单篇文章页面），就会继续执行后面的 HTML 和 JavaScript 代码。

这段代码的主要目的是：

1. 控制进度条的显示范围：只在用户阅读单篇文章时显示进度条。

2. 提高性能：在不需要进度条的页面（如首页、归档页等）避免加载不必要的 HTML 和 JavaScript。

3. 提升用户体验：确保进度条只在合适的页面出现，不会在不适合的页面造成干扰。

如果你想在其他类型的页面也显示进度条，可以修改这个条件。例如：

- 在页面（Page）和文章（Post）都显示：\
  `php
  if ( !is_single() && !is_page() ) {
  return;
  }`

- 在任何类型的内容页面都显示：\
  `php
  if ( !is_singular() ) {
  return;
  }`

通过调整这个条件，你可以灵活地控制进度条在哪些页面显示，从而适应不同的需求。

:::

### 3. 创建JS文件

在同一个`template-parts`文件夹中创建`reading-progress-bar.js`文件，使用jQuery重写代码：

```
jQuery(document).ready(function($) {
    var $progressBar = $('#reading-progress');
    if ($progressBar.length === 0) {
        $progressBar = $('<div id="reading-progress"></div>');
        $('body').append($progressBar);
    }

    $(window).on('scroll resize', function() {
        var scrollTop = $(window).scrollTop();
        var docHeight = $(document).height();
        var winHeight = $(window).height();
        var scrollPercent = (scrollTop) / (docHeight - winHeight);
        var scrollPercentRounded = Math.round(scrollPercent * 100);

        $progressBar.css('width', scrollPercentRounded + '%');
    });
});
```

这段jQuery代码比原生JavaScript更加简洁，并且利用了jQuery的跨浏览器兼容性。

### 4. 添加CSS样式

在你的子主题的`style.css`文件中添加以下CSS样式：

```
#reading-progress {
    position: fixed;
    top: 0;
    left: 0;
    width: 0;
    height: 4px;
    background: #007bff; /* 自定义颜色 */
    z-index: 9999;
    transition: width 0.3s ease;
}
```

### 5. 在主题中引入模板

在你的主题的`footer.php`文件中，在`wp_footer()`函数调用之前添加以下代码：

```
<?php get_template_part( 'template-parts/reading-progress-bar' ); ?>
```

### 6. 确保jQuery加载

大多数时候忽略此步骤。WordPress主题默认已经加载了jQuery。如果你的主题没有加载jQuery，你需要在`functions.php`文件中添加以下代码：

```
function enqueue_jquery() {
    wp_enqueue_script('jquery');
}
add_action('wp_enqueue_scripts', 'enqueue_jquery');
```

## 优势

使用jQuery实现的模块化方法有以下几个优点：

1. **简洁的代码**：jQuery提供了更简洁的语法，使代码更易读和维护。

2. **跨浏览器兼容性**：jQuery处理了大多数跨浏览器的兼容性问题，使得代码在不同浏览器中都能正常工作。

3. **与WordPress生态系统兼容**：大多数WordPress主题和插件都使用jQuery，使用它可以更好地与整个生态系统集成。

4. **模块化结构**：将功能相关的代码分离到不同的文件中，使得代码结构更加清晰，易于维护。

5. **性能考虑**：虽然引入jQuery可能会增加一些加载时间，但大多数WordPress站点已经加载了jQuery，所以不会造成额外的性能负担。

6. **灵活性**：如果需要在其他类型的页面上显示进度条，只需修改PHP模板文件中的条件判断即可。

## 本文中的条件显示逻辑

这涉及到 WordPress 模板系统的工作原理。让我详细解释一下 `get_template_part()` 函数的执行过程：

1. `get_template_part()` 函数的调用：\
   当执行 `<?php get_template_part( 'template-parts/reading-progress-bar' ); ?>` 时，WordPress 会尝试加载指定的模板文件。

2. 文件加载：\
   WordPress 会查找并加载 `template-parts/reading-progress-bar.php` 文件。

3. PHP 执行：\
   一旦文件被加载，PHP 解释器开始执行文件中的代码。

4. 条件判断：\
   在 `reading-progress-bar.php` 文件开头，会遇到条件判断：\
   `php
   if ( !is_single() ) {
   return;
   }`

5. 非单篇文章页面的情况：\
   – 如果当前页面不是单篇文章，`!is_single()` 返回 true。\
   – PHP 执行 `return` 语句。\
   – `reading-progress-bar.php` 文件的执行立即终止。\
   – 控制权返回到调用 `get_template_part()` 的地方。

6. 结果：\
   – 在非单篇文章页面，`reading-progress-bar.php` 文件被加载和执行，但不会输出任何内容。\
   – 文件中 `return` 语句之后的代码（包括 HTML 和 JavaScript）不会被执行或输出。

7. 继续执行：\
   WordPress 继续执行 `get_template_part()` 之后的代码。

重要的是要理解：

- `get_template_part()` 总是会被调用和执行，无论是什么类型的页面。
- 但是，由于 `reading-progress-bar.php` 文件中的条件判断，在非单篇文章页面上，这个函数调用实际上不会产生任何输出或副作用。

这种方法的优点：

1. 模块化：允许您将特定功能的代码封装在单独的文件中。
2. 灵活性：可以在不同类型的页面上重用相同的模板部分，只需在模板文件内部进行条件判断。
3. 性能：虽然文件会被加载，但由于早期的条件判断，不会执行或输出不必要的代码。

总的来说，这是一种既灵活又高效的方法，允许您在保持代码模块化的同时，精确控制特定功能在不同页面类型上的行为。
