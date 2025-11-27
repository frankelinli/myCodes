---
id: 999
title: 对比前端和后端方案给WordPress文章链接在新窗口打开
slug: 对比前端和后端方案给WordPress文章链接在新窗口打开
categories:
  - notes
tags: []

---

本文介绍了两种实现外部链接在新窗口打开的方法：前端使用jQuery遍历页面链接，通过域名比较识别外部链接并添加target和rel属性；后端使用PHP正则匹配内容中的链接，解析域名后为外部链接添加相应属性。两种方案均能有效处理外部链接跳转并增强安全性。

[wechat_login_button]

[wechat_pay text="赞助我一杯咖啡" url="https://your-wechat-qrcode-url.com"]





[site_intro title="欢迎来到好嘢科技"]

## 前端JS方法，

遍历所有连接，给连接添加属性，让它在新窗口打开。

```js
jQuery(document).ready(function($) {
        // 获取当前域名
        var currentDomain = window.location.hostname;
        
        // 选择所有链接
        $('a').each(function() {
            var href = $(this).attr('href');
            
            // 确保链接存在且不是空链接、锚点链接或javascript链接
            if (href && href !== '#' && !href.startsWith('javascript:') && !href.startsWith('tel:') && !href.startsWith('mailto:')) {
                try {
                    // 尝试创建URL对象来解析链接
                    var url = new URL(href, window.location.href);
                    
                    // 检查链接是否为外部链接（不包含当前域名）
                    if (url.hostname !== currentDomain && url.hostname !== '') {
                        // 为外部链接添加target和rel属性
                        $(this).attr('target', '_blank');
                        $(this).attr('rel', 'noopener noreferrer');
                    }
                } catch(e) {
                    // 如果URL解析失败（可能是相对路径），则忽略
                    console.log('URL解析失败:', href);
                }
            }
        });
    });
    </script>
```

- **域名检测**：获取当前网站的域名
- **链接遍历**：使用jQuery遍历页面上的所有`<a>`标签
- **链接过滤**：排除以下类型的链接：
  - 空链接或`#`锚点链接
  - `javascript:`协议链接
  - `tel:`电话链接
  - `mailto:`邮件链接
- **外部链接判断**：
  - 使用`URL`对象解析链接
  - 比较链接域名与当前网站域名
  - 如果域名不同，则认为是外部链接
- **属性设置**：为外部链接添加：
  - `target="_blank"`：在新窗口打开
  - `rel="noopener noreferrer"`：增强安全性，防止新窗口访问原窗口

[pay_content]

## 服务器端PHP方式，

PHP端 过滤content,给链接添加外链属性

```php
<?php
/**
 * 功能名称: 所有外链在新窗口打开 - 服务器端方案
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * 通过内容过滤器处理外部链接
 */
function haowiki_add_external_link_target($content) {
    // 获取当前站点域名
    $site_url = parse_url(home_url(), PHP_URL_HOST);
    
    // 使用正则表达式匹配所有链接
    $content = preg_replace_callback(
        '/<a\s+([^>]*?)href=["\']([^"\']*)["\']([^>]*?)>/i',
        function($matches) use ($site_url) {
            $full_tag = $matches[0];
            $before_href = $matches[1];
            $href = $matches[2];
            $after_href = $matches[3];
            
            // 跳过特殊链接
            if (empty($href) || $href === '#' || 
                strpos($href, 'javascript:') === 0 || 
                strpos($href, 'mailto:') === 0 || 
                strpos($href, 'tel:') === 0) {
                return $full_tag;
            }
            
            // 解析URL
            $parsed_url = parse_url($href);
            
            // 检查是否为外部链接
            if (isset($parsed_url['host']) && $parsed_url['host'] !== $site_url) {
                // 检查是否已有target属性
                if (strpos($full_tag, 'target=') === false) {
                    $after_href .= ' target="_blank"';
                }
                // 检查是否已有rel属性
                if (strpos($full_tag, 'rel=') === false) {
                    $after_href .= ' rel="noopener noreferrer"';
                }
            }
            
            return '<a ' . $before_href . 'href="' . $href . '"' . $after_href . '>';
        },
        $content
    );
    
    return $content;
}

// 应用到内容过滤器
add_filter('the_content', 'haowiki_add_external_link_target');
add_filter('the_excerpt', 'haowiki_add_external_link_target');
add_filter('widget_text', 'haowiki_add_external_link_target');
```



**服务器端内容过滤方案**是最优的，因为：

- 不依赖JavaScript
- 性能最佳（服务器端一次处理）
- SEO最友好
- 用户体验最佳（无闪烁）

## nodejs本地预处理方案：

还有个第三个方案，邪修：本地nodejs-remark构建渲染，把所有外链都添加新窗口打开，然后把处理好的HTML发送到WordPress文章。

```js
// 为所有外部链接添加 target="_blank" 和 rel="noopener noreferrer"
function addTargetBlank() {
  return (tree) => {
    visit(tree, 'link', (node) => {
      const url = node.url;
      // 只处理外部链接
      if (!url.startsWith('http://yourdomain.com') && !url.startsWith('https://yourdomain.com')) {
        node.data = node.data || {};
        node.data.hProperties = node.data.hProperties || {};
        node.data.hProperties.target = '_blank';
        node.data.hProperties.rel = 'noopener noreferrer';
      }
    });
  };
}	
```

[/pay_content]
