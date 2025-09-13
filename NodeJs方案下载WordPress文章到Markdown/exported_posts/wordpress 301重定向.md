---
id: 68
title: wordpress 301重定向
date: '2025-04-17T07:26:18'
author: haoye
categories:
  - notes
tags: []
---

如果需要 **abc-分类页面** 和 **abc-分类下的所有文章** 都跳转，可以通过修改代码来覆盖这两种情况。以下是经过改进的代码：

### **完整的 PHP 跳转代码**

将以下代码添加到主题的 `functions.php` 文件中：

```
add_action('template_redirect', 'abc-_redirect_all');
function abc-_redirect_all() {
    // 定义跳转目标地址
    $redirect_url = 'https://testwiki.com/abc--introduction';

    // 检查是否是 abc- 分类页面
    if (is_category('abc-')) { // abc- 分类页面
        wp_redirect($redirect_url, 301); // 301 永久重定向
        exit;
    }

    // 检查是否是 abc- 分类下的文章
    if (is_single() && has_category('abc-')) { // 属于 abc- 分类的文章
        wp_redirect($redirect_url, 301); // 301 永久重定向
        exit;
    }
}
```

***

### **代码说明**

1. **跳转目标**：\
   – `$redirect_url` 定义了跳转的目标地址：`https://testwiki.com/abc--introduction`。\
   – 修改 `$redirect_url` 即可改变重定向目标。

2. **分类页面跳转**：\
   – `is_category('abc-')` 检查当前页面是否是 **abc- 分类页面**（`testwiki/category/abc-`）。\
   – 如果条件成立，调用 `wp_redirect()` 进行跳转，并使用 `301` 表示永久重定向。

3. **分类下文章跳转**：\
   – `is_single()` 确保是单篇文章页面。\
   – `has_category('abc-')` 检查该文章是否属于 **abc- 分类**。\
   – 如果条件成立，同样调用 `wp_redirect()` 跳转到目标地址。

4. **`exit;`**：\
   – 必须在 `wp_redirect()` 后调用 `exit;`，以终止后续代码执行，防止页面加载多余内容。

5. **301 重定向**：\
   – `wp_redirect($redirect_url, 301)` 使用了 **301 永久重定向**，这是 SEO 友好的做法，会通知搜索引擎该页面永久移动到新地址。

***

### **如何测试**

1. **测试分类页面跳转**：\
   – 访问 `https://yourwebsite.com/category/abc-`，应自动跳转到 `https://testwiki.com/abc--introduction`。

2. **测试分类下的文章跳转**：\
   – 访问属于 abc- 分类的文章页面（如 `https://yourwebsite.com/abc--article`），应自动跳转到目标地址。

3. **测试其他页面**：\
   – 访问其他分类或文章页面，确保它们不受影响。

***

### **扩展功能（动态控制跳转目标）**

如果未来有多个分类需要跳转，或者需要根据分类动态控制跳转目标，可以通过以下方式扩展代码：

#### 动态跳转目标

```
add_action('template_redirect', 'dynamic_redirect_by_category');
function dynamic_redirect_by_category() {
    // 获取当前分类的跳转目标
    $redirect_urls = array(
        'abc-' => 'https://testwiki.com/abc--introduction', // abc- 分类跳转目标
        'another-category' => 'https://example.com/another-target' // 其他分类跳转目标
    );

    // 检查是否是分类页面或分类下的文章
    if ((is_category() && array_key_exists(get_queried_object()->slug, $redirect_urls)) || 
        (is_single() && has_category(array_keys($redirect_urls)))) {
        $category_slug = is_category() ? get_queried_object()->slug : ''; // 获取分类别名
        $target_url = $redirect_urls[$category_slug] ?? $redirect_urls[get_the_category()[0]->slug];

        // 执行跳转
        wp_redirect($target_url, 301);
        exit;
    }
}
```

#### 改进点：

1. **多分类支持**：\
   – `$redirect_urls` 数组定义了多个分类及其对应的跳转目标。\
   – 根据分类动态跳转到不同的页面。

2. **更灵活的逻辑**：\
   – `get_queried_object()->slug` 获取当前分类的别名。\
   – `get_the_category()[0]->slug` 获取文章主分类的别名。

***

### **优势对比**

| **功能**     | **简单版代码**      | **动态控制代码**          |
| ---------- | -------------- | ------------------- |
| **适用范围**   | 仅限 abc- 分类及其文章 | 支持多个分类及不同目标地址       |
| **灵活性**    | 跳转目标固定         | 跳转目标可动态调整           |
| **实现复杂条件** | 不支持            | 可根据复杂条件（如用户角色、分类）跳转 |
| **代码复杂度**  | 简单，适合单一需求      | 较复杂，适合需要动态控制的情况     |

***

### **总结**

- 如果只有 **abc- 分类页面和文章** 需要跳转，使用第一段 **简单 PHP 代码** 即可。
- 如果需要针对不同分类或文章动态跳转，使用 **动态控制代码** 实现更灵活的跳转逻辑。

无论哪种方式，都可以确保分类页面和分类下的所有文章都跳转到目标地址，同时保持高效和 SEO 友好！
