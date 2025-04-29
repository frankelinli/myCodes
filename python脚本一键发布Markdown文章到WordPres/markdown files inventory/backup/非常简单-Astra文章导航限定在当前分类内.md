要实现在当前分类内导航,需要在获取上下篇文章时添加 `in_same_term` 参数。只需修改一个true;

修改了这两行:

- `get_next_post(true)`
- `get_previous_post(true)`

以下是修改后的代码:

:::warning

有问题，暂未解决
:::



```php
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

```php
get_next_post(true, '', 'category'); // 第三个参数指定taxonomy
get_previous_post(true, '', 'category');
```
