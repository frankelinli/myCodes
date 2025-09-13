---
author: haoye
categories:
- 随记
date: '2025-04-17T07:26:14'
id: 62
tags: []
title: publicly_queryable设置
---

`publicly_queryable => false` 是WordPress文章类型注册时的一个重要参数，它有以下作用：

  1. 主要功能：  
- 禁止通过前台URL直接访问单个文章页面  
- 禁止这些文章出现在搜索结果中  
- 禁止这些文章出现在主查询中(main query)

  2. 实际效果：

    
    
    register_post_type('changelog', array(
        'public' => true,
        'publicly_queryable' => false,
        // ...
    ));
    

  * 管理员仍可在后台管理文章
  * 前台无法通过 `/changelog/post-slug` 这样的URL访问单篇文章
  * 这些文章不会出现在站内搜索结果中

  3. 常见使用场景：  
- 只需要在特定模板中显示内容，不希望有单独的文章页面  
- 纯后台功能的文章类型，如设置页面  
- 需要将多篇文章内容组合显示在一个页面上

  4. 与 `public` 参数的区别：

    
    
    // 场景1: 完全公开
    'public' => true,
    'publicly_queryable' => true
    
    // 场景2: 只在后台可见和管理
    'public' => false,
    'publicly_queryable' => false
    
    // 场景3: 可在后台管理且可通过API访问，但无单独页面
    'public' => true,
    'publicly_queryable' => false
    

如果你的changelog需要：  
- 只在特定页面以列表形式显示  
- 不需要单独的文章详情页  
- 不希望出现在搜索结果中

那么设置 `publicly_queryable => false` 是合适的选择。

如果你需要：  
- 有独立的文章详情页  
- 允许搜索  
- 可以通过URL直接访问

那么应该设置 `publicly_queryable => true`。

