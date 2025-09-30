---
id: 188
title: 根据条件动态加载左侧doc导航栏
slug: '%e6%a0%b9%e6%8d%ae%e6%9d%a1%e4%bb%b6%e5%8a%a8%e6%80%81%e5%8a%a0%e8%bd%bd%e5%b7%a6%e4%be%a7doc%e5%af%bc%e8%88%aa%e6%a0%8f'
date: '2025-04-28T23:10:19'
categories:
  - notes
tags: []
url: https://haoyelaiga.com/%e6%a0%b9%e6%8d%ae%e6%9d%a1%e4%bb%b6%e5%8a%a8%e6%80%81%e5%8a%a0%e8%bd%bd%e5%b7%a6%e4%be%a7doc%e5%af%bc%e8%88%aa%e6%a0%8f/
---

你的代码是正确的。它能实现：\
1\. 在单篇文章页面显示左侧栏\
2\. 排除 ‘csr’ 分类的文章\
3\. 使用 `astra_content_top` hook 注入到正确的位置

不过，可以建议一些优化：

```
function display_left_doc_sidebar() {
    // 提前返回的条件判断，提高代码效率
    if (!is_single() || has_category('csr') || !is_active_sidebar('left-doc')) {
        return;
    }

    echo '<div class="left-doc-sidebar">';
    dynamic_sidebar('left-doc');
    echo '</div>';
}
add_action('astra_content_top', 'display_left_doc_sidebar');
```

优化说明：\
1\. 使用提前返回模式，使代码更清晰\
2\. 合并所有条件检查，减少嵌套\
3\. 保留了关键的闭合div标签注释

如果需要添加CSS样式，可以在子主题的style.css中添加：

```
.left-doc-sidebar {
    /* 添加你的样式 */
}
```

## 自定义字段“is doc”=true, 才注入左侧栏

再加个条件，如果该文章属于自定义字段“is doc”=true, 才注入左侧栏；否则不注入。

可以修改代码，添加自定义字段检查：

```
function display_left_doc_sidebar() {
    // 提前返回的条件判断：
    // 1. 不是单篇文章 或
    // 2. 属于csr分类 或
    // 3. 侧边栏未激活 或
    // 4. 自定义字段'is_doc'不为true
    if (
        !is_single() || 
        has_category('csr') || 
        !is_active_sidebar('left-doc') ||
        !get_post_meta(get_the_ID(), 'is_doc', true)
    ) {
        return;
    }

    echo '<div class="left-doc-sidebar">';
    dynamic_sidebar('left-doc');
    echo '</div>';
}
add_action('astra_content_top', 'display_left_doc_sidebar');
```

说明：\
1\. `get_post_meta()` 函数用于获取文章的自定义字段\
2\. 第一个参数 `get_the_ID()` 获取当前文章ID\
3\. 第二个参数 `'is_doc'` 是自定义字段的名称\
4\. 第三个参数 `true` 表示只返回单个值而不是数组

使用方法：\
1\. 在文章编辑页面的自定义字段部分\
2\. 添加字段名 `is_doc`\
3\. 值设为 `true`（或1）

如果你使用ACF插件，也可以这样写：

```
function display_left_doc_sidebar() {
    if (
        !is_single() || 
        has_category('csr') || 
        !is_active_sidebar('left-doc') ||
        !get_field('is_doc') // ACF方式获取自定义字段
    ) {
        return;
    }

    echo '<div class="left-doc-sidebar">';
    dynamic_sidebar('left-doc');
    echo '</div>';
}
add_action('astra_content_top', 'display_left_doc_sidebar');
```

***

这样控制左侧栏，就比较自由了。比如BSCI分类下有doc文章，常用的，属于手册之类的文章，则出现左侧导航栏；如果bsci分类下的普通文章，比如介绍BSCI新闻消息的，则不出现左侧导航栏。

完全正确！这种设计非常灵活和实用，因为：

1. 分类控制层面：\
   – 完全排除’csr’分类的文章\
   – 其他分类（如’BSCI’）可以混合展示不同类型的内容

2. 文章类型控制层面：\
   – 手册类文档：设置 is\_doc = true，显示左侧导航栏\
   – 新闻资讯：保持 is\_doc 为空，不显示左侧导航栏

使用场景示例：

```
BSCI分类
├── 手册类文章 (is_doc = true)
│   ├── BSCI认证流程
│   ├── BSCI审核标准
│   └── BSCI常见问题
└── 新闻类文章 (is_doc = false/空)
    ├── BSCI最新政策更新
    ├── BSCI认证案例分享
    └── BSCI行业动态
```

这样的结构让内容组织更加清晰，用户体验也更好：\
– 手册类内容有导航栏便于查找相关内容\
– 新闻类内容保持清爽的阅读版式

建议：可以考虑在后台文章列表添加一个is\_doc的快速筛选器，方便管理这类文章。

## 不用注册新自定义类型帖子，用原始的post就可以

是的！这种方法有很多优点：

1. 实现简单：\
   – 不需要register\_post\_type\
   – 不需要额外的分类法(taxonomy)\
   – 不需要处理新类型的永久链接规则

2. 维护方便：\
   – 使用WordPress原生文章功能\
   – 所有SEO功能自动继承\
   – 主题样式完全兼容\
   – 备份恢复更简单

3. 灵活性强：\
   – 通过is\_doc自定义字段实现文档标记\
   – 可以和现有分类、标签完美配合\
   – 随时可以改变文章的文档属性\
   – 不影响已有的文章结构

实际使用场景：

```
WordPress文章
├── 普通文章 (is_doc = false)
│   ├── 新闻资讯
│   ├── 行业动态
│   └── 案例分享
└── 文档类文章 (is_doc = true)
    ├── 认证指南
    ├── 操作手册
    └── 标准解读
```

这种方案特别适合内容管理型网站，既保持了简单性，又实现了文档管理的需求。
