---
author: haoye
categories:
- 随记
date: '2025-05-11T18:14:13'
id: 276
tags: []
title: WordPress帖子-登录后阅读全文
---

## 使用段落数截断WordPress文章内容显示给未登录用户

在管理WordPress网站时，有时我们希望未登录用户只能看到文章的一部分内容，以此激励他们登录或注册。这篇博文将介绍如何通过截断文章内容到前5个段落来实现这一功能。

### 问题描述

我们希望在WordPress网站上，只显示文章的前5个段落给未登录用户。初始尝试是通过字数截断内容，但这可能会导致HTML标签中断，进而破坏页面布局。为避免这种情况，我们决定使用段落数来截断内容。

### 最终解决方案

我们将通过以下步骤实现这一功能：

  1. 创建一个函数 `truncate_content_by_paragraphs`，该函数将内容截断到指定的段落数。
  2. 使用 `the_content` 过滤器，在文章内容输出前调用截断函数。
  3. 添加自定义样式，让“登录后阅读全文”的链接更加美观。

#### 1\. 创建 `truncate_content_by_paragraphs` 函数

这个函数将内容按段落分割，并截断到指定的段落数。

    
    
    function truncate_content_by_paragraphs($content, $num_paragraphs) {
        // 使用正则表达式匹配段落
        $paragraphs = preg_split('/(<\/p>)/i', $content, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY);
    
        // 如果段落数少于或等于需要的段落数，返回完整内容
        if (count($paragraphs) / 2 <= $num_paragraphs) {
            return $content;
        }
    
        // 截断到指定段落数
        $excerpt = '';
        for ($i = 0; $i < $num_paragraphs * 2; $i++) {
            $excerpt .= $paragraphs[$i];
        }
    
        return $excerpt . '...';
    }
    

#### 2\. 使用 `the_content` 过滤器

我们将创建一个过滤器函数 `partial_content_for_guests`，在文章内容输出前调用
`truncate_content_by_paragraphs` 函数。

    
    
    function partial_content_for_guests($content) {
        if ((is_single() || is_singular('your_custom_post_type')) && !is_user_logged_in()) {
            // 设置要显示的段落数
            $excerpt_paragraphs = 5; // 设置为按段落截断
    
            // 使用自定义函数 truncate_content_by_paragraphs 截断内容
            $excerpt = truncate_content_by_paragraphs($content, $excerpt_paragraphs);
    
            // 检查是否内容被截断
            if ($excerpt !== $content) {
                $login_url = wp_login_url(get_permalink());
                $more_link = '<a class="read-more-link" href="' . $login_url . '"> 登录后阅读全文</a>';
                $content = $excerpt . ' ' . $more_link;
            }
        }
    
        return $content;
    }
    add_filter('the_content', 'partial_content_for_guests');
    

#### 3\. 添加自定义样式

为了使“登录后阅读全文”的链接更加美观，我们可以添加一些自定义样式。

    
    
    function add_custom_styles() {
        echo '
        <style>
            .read-more-link {
                display: inline-block;
                padding: 10px 20px;
                margin-top: 20px;
                background-color: #0073aa;
                color: #ffffff;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                transition: background-color 0.3s ease;
            }
            .read-more-link:hover {
                background-color: #005a87;
            }
        </style>
        ';
    }
    add_action('wp_head', 'add_custom_styles');
    

### 完整代码示例

以下是完整的代码示例，您可以将其添加到主题或者子主题的 `functions.php` 文件中：

    
    
    function truncate_content_by_paragraphs($content, $num_paragraphs) {
        $paragraphs = preg_split('/(<\/p>)/i', $content, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY);
    
        if (count($paragraphs) / 2 <= $num_paragraphs) {
            return $content;
        }
    
        $excerpt = '';
        for ($i = 0; $i < $num_paragraphs * 2; $i++) {
            $excerpt .= $paragraphs[$i];
        }
    
        return $excerpt . '...';
    }
    
    function partial_content_for_guests($content) {
        if ((is_single() || is_singular('your_custom_post_type')) && !is_user_logged_in()) {
            $excerpt_paragraphs = 5;
    
            $excerpt = truncate_content_by_paragraphs($content, $excerpt_paragraphs);
    
            if ($excerpt !== $content) {
                $login_url = wp_login_url(get_permalink());
                $more_link = '<a class="read-more-link" href="' . $login_url . '"> 登录后阅读全文</a>';
                $content = $excerpt . ' ' . $more_link;
            }
        }
    
        return $content;
    }
    add_filter('the_content', 'partial_content_for_guests');
    
    function add_custom_styles() {
        echo '
        <style>
            .read-more-link {
                display: inline-block;
                padding: 10px 20px;
                margin-top: 20px;
                background-color: #0073aa;
                color: #ffffff;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                transition: background-color 0.3s ease;
            }
            .read-more-link:hover {
                background-color: #005a87;
            }
        </style>
        ';
    }
    add_action('wp_head', 'add_custom_styles');
    

### 代码详细解释

#### 1\. `truncate_content_by_paragraphs` 函数

这个函数通过正则表达式将内容分割成段落，然后根据指定的段落数量进行截断。这样可以确保 HTML 标签不会中断，从而避免页面布局被破坏。

#### 2\. `partial_content_for_guests` 函数

这个过滤器函数在文章内容输出前调用 `truncate_content_by_paragraphs`
函数。它首先检查当前页面是否为单篇文章或自定义文章类型，并且用户是否未登录。如果满足条件，则截断内容并添加“登录后阅读全文”的链接。

#### 3\. 添加自定义样式

为了使“登录后阅读全文”的链接更加美观，我们添加了自定义 CSS 样式。这个样式将链接显示为按钮，增加一些间距和背景颜色，并且在鼠标悬停时改变颜色。

### 总结

通过上述步骤，我们成功地实现了一个功能，使得未登录用户只能看到文章的前5个段落。这种方法不仅避免了 HTML
标签中断的问题，还能有效地激励用户登录或注册。如果您有类似的需求，可以尝试在您的 WordPress 网站上使用这个解决方案。

* * *

## 手动添加截断位置，自己控制，想在哪里添加，就在哪里显示“阅读更多”。

好的，我们可以通过在文章内容中手动添加一个标记来控制截断位置。这样您就可以精确地控制在何处截断内容，并显示“登录后阅读全文”的链接。

以下步骤将帮助您实现这一功能：

  1. 在文章内容中添加一个标记，例如 `<!--more-->`。
  2. 创建一个函数来根据这个标记截断内容。
  3. 使用 `the_content` 过滤器在文章内容输出前调用截断函数。
  4. 添加自定义样式，让“登录后阅读全文”的链接更加美观。

### 1\. 在文章内容中添加标记

在您希望截断的地方添加 `<!--more-->` 标记。例如：

    
    
    <p>这是文章的第一段。</p>
    <p>这是文章的第二段。</p>
    <!--more-->
    <p>这是文章的第三段。</p>
    <p>这是文章的第四段。</p>
    

### 2\. 创建截断函数

我们将创建一个函数 `truncate_content_at_marker`，它会根据标记截断内容。

    
    
    function truncate_content_at_marker($content) {
        if (!is_user_logged_in()) {
            // 查找标记的位置
            $marker_pos = strpos($content, '<!--more-->');
    
            // 如果找到了标记，则截断内容
            if ($marker_pos !== false) {
                $excerpt = substr($content, 0, $marker_pos);
    
                // 获取登录页面URL
                $login_url = wp_login_url(get_permalink());
    
                // 创建“登录后阅读全文”的链接
                $more_link = '<a class="read-more-link" href="' . $login_url . '"> 登录后阅读全文</a>';
    
                // 返回截断后的内容加上“登录后阅读全文”的链接
                return $excerpt . ' ' . $more_link;
            }
        }
        // 如果用户已登录或没有找到标记，则返回完整内容
        return $content;
    }
    

### 3\. 使用 `the_content` 过滤器

我们将使用 `the_content` 过滤器在文章内容输出前调用 `truncate_content_at_marker` 函数。

    
    
    add_filter('the_content', 'truncate_content_at_marker');
    

### 4\. 添加自定义样式

为了使“登录后阅读全文”的链接更加美观，我们可以添加一些自定义样式。

    
    
    function add_custom_styles() {
        echo '
        <style>
            .read-more-link {
                display: inline-block;
                padding: 10px 20px;
                margin-top: 20px;
                background-color: #0073aa;
                color: #ffffff;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                transition: background-color 0.3s ease;
            }
            .read-more-link:hover {
                background-color: #005a87;
            }
        </style>
        ';
    }
    add_action('wp_head', 'add_custom_styles');
    

### 完整代码示例

以下是完整的代码示例，您可以将其添加到主题的 `functions.php` 文件中：

    
    
    function truncate_content_at_marker($content) {
        if (!is_user_logged_in()) {
            $marker_pos = strpos($content, '<!--more-->');
    
            if ($marker_pos !== false) {
                $excerpt = substr($content, 0, $marker_pos);
                $login_url = wp_login_url(get_permalink());
                $more_link = '<a class="read-more-link" href="' . $login_url . '"> 登录后阅读全文</a>';
                return $excerpt . ' ' . $more_link;
            }
        }
        return $content;
    }
    add_filter('the_content', 'truncate_content_at_marker');
    
    function add_custom_styles() {
        echo '
        <style>
            .read-more-link {
                display: inline-block;
                padding: 10px 20px;
                margin-top: 20px;
                background-color: #0073aa;
                color: #ffffff;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                transition: background-color 0.3s ease;
            }
            .read-more-link:hover {
                background-color: #005a87;
            }
        </style>
        ';
    }
    add_action('wp_head', 'add_custom_styles');
    

### 总结

通过在文章内容中手动添加 `<!--more-->`
标记，您可以精确控制内容在何处截断，并显示“登录后阅读全文”的链接。这个方法不仅灵活，而且易于实现，适合各种不同的内容和页面布局。

希望这篇博文对您有所帮助！如果您有任何问题或建议，请在评论区留言。

