---
id: 196
title: 非常简单-Astra文章导航限定在当前分类内
slug: '%e9%9d%9e%e5%b8%b8%e7%ae%80%e5%8d%95-astra%e6%96%87%e7%ab%a0%e5%af%bc%e8%88%aa%e9%99%90%e5%ae%9a%e5%9c%a8%e5%bd%93%e5%89%8d%e5%88%86%e7%b1%bb%e5%86%85'
date: '2025-04-28T23:10:26'
categories:
  - notes
tags: []
url: https://haoyelaiga.com/%e9%9d%9e%e5%b8%b8%e7%ae%80%e5%8d%95-astra%e6%96%87%e7%ab%a0%e5%af%bc%e8%88%aa%e9%99%90%e5%ae%9a%e5%9c%a8%e5%bd%93%e5%89%8d%e5%88%86%e7%b1%bb%e5%86%85/
---

要实现在当前分类内导航,需要在获取上下篇文章时添加 `in_same_term` 参数。只需修改一个true;

修改了这两行:

- `get_next_post(true)`
- `get_previous_post(true)`

以下是修改后的代码:

:::warning

有问题，暂未解决\
:::

```
add_filter( 'astra_single_post_navigation', 'astra_change_next_prev_text' );
function astra_change_next_prev_text( $args ) {
    $next_post = get_next_post(true); // true表示仅在同一分类中获取
    $prev_post = get_previous_post(true); // true表示仅在同一分类中获取

    $next_text = false;
    if ( $next_post ) {
        $next_text = sprintf(
            '%s <span class="ast-right-arrow">→</span>',
            $next_post->post_title
        );
    }

    $prev_text = false;
    if ( $prev_post ) {
        $prev_text = sprintf(
            '<span class="ast-left-arrow">←</span> %s',
            $prev_post->post_title
        );
    }

    $args['next_text'] = $next_text;
    $args['prev_text'] = $prev_text;
    return $args;
}
```

现在导航只会显示同一分类下的文章。如果需要指定某个分类法(taxonomy),可以使用完整参数:

```
get_next_post(true, '', 'category'); // 第三个参数指定taxonomy
get_previous_post(true, '', 'category');
```
